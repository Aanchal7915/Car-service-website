const asyncHandler = require('express-async-handler');
const RentalCar = require('../models/RentalCar');
const RentalBooking = require('../models/RentalBooking');
const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

const dayDiff = (start, end) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const hourDiff = (startDate, startTime, endDate, endTime) => {
  const s = new Date(`${new Date(startDate).toISOString().split('T')[0]}T${startTime || '00:00'}:00`);
  const e = new Date(`${new Date(endDate).toISOString().split('T')[0]}T${endTime || '00:00'}:00`);
  const ms = e.getTime() - s.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
};

// ── RENTAL CARS ───────────────────────────────────────────────

// @desc  Get all rental cars (with filters)
// @route GET /api/rentals/cars
const getRentalCars = asyncHandler(async (req, res) => {
  const {
    brand, transmission, fuelType, seats, minPrice, maxPrice,
    city, sort, page = 1, limit = 12, search, isAdmin
  } = req.query;

  const query = isAdmin === 'true' ? {} : { status: { $in: ['available', 'rented'] } };

  if (brand) query.brand = new RegExp(brand, 'i');
  if (transmission) query.transmission = transmission;
  if (fuelType) query.fuelType = fuelType;
  if (seats) query.seats = Number(seats);
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (minPrice || maxPrice) {
    query.pricePerDay = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };
  }
  if (search) query.$or = [
    { title: new RegExp(search, 'i') },
    { brand: new RegExp(search, 'i') },
    { model: new RegExp(search, 'i') },
  ];

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { pricePerDay: 1 },
    price_desc: { pricePerDay: -1 },
    popular: { views: -1 },
  };

  const total = await RentalCar.countDocuments(query);
  const cars = await RentalCar.find(query)
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    cars,
  });
});

// @desc  Get single rental car
// @route GET /api/rentals/cars/:id
const getRentalCar = asyncHandler(async (req, res) => {
  const car = await RentalCar.findById(req.params.id);
  if (!car) { res.status(404); throw new Error('Rental car not found'); }
  car.views += 1;
  await car.save();
  res.json({ success: true, car });
});

const normalizeRentalCarBody = (body) => {
  if (typeof body.location === 'string') body.location = JSON.parse(body.location);
  if (typeof body.features === 'string') body.features = JSON.parse(body.features);

  // rentalUnits arrives as `rentalUnits[]` field — multer/body-parser may give array or single
  let units = body['rentalUnits[]'] ?? body.rentalUnits;
  if (units !== undefined) {
    if (typeof units === 'string') units = [units];
    if (Array.isArray(units)) {
      body.rentalUnits = units.filter(u => u === 'day' || u === 'hour');
    }
    delete body['rentalUnits[]'];
  }

  if (body.securityDepositRefundable !== undefined) {
    body.securityDepositRefundable = body.securityDepositRefundable === true || body.securityDepositRefundable === 'true';
  }
  if (body.isFeatured !== undefined) {
    body.isFeatured = body.isFeatured === true || body.isFeatured === 'true';
  }

  return body;
};

// @desc  Create rental car (admin)
// @route POST /api/rentals/cars
const createRentalCar = asyncHandler(async (req, res) => {
  const images = req.files ? req.files.map((f) => f.path) : [];
  const body = normalizeRentalCarBody({ ...req.body });
  const car = await RentalCar.create({ ...body, images });
  res.status(201).json({ success: true, car });
});

// @desc  Update rental car (admin)
// @route PUT /api/rentals/cars/:id
const updateRentalCar = asyncHandler(async (req, res) => {
  const car = await RentalCar.findById(req.params.id);
  if (!car) { res.status(404); throw new Error('Rental car not found'); }
  const body = normalizeRentalCarBody({ ...req.body });

  const existing = body.existingImages
    ? (Array.isArray(body.existingImages) ? body.existingImages : [body.existingImages])
    : [];
  const newUploads = (req.files || []).map(f => f.path);
  if (existing.length > 0 || newUploads.length > 0) body.images = [...existing, ...newUploads];
  delete body.existingImages;

  const updated = await RentalCar.findByIdAndUpdate(req.params.id, body, { new: true });
  res.json({ success: true, car: updated });
});

// @desc  Delete rental car (admin)
// @route DELETE /api/rentals/cars/:id
const deleteRentalCar = asyncHandler(async (req, res) => {
  const car = await RentalCar.findByIdAndDelete(req.params.id);
  if (!car) { res.status(404); throw new Error('Rental car not found'); }
  res.json({ success: true, message: 'Rental car deleted' });
});

// ── RENTAL BOOKINGS ───────────────────────────────────────────

// @desc  Create rental booking
// @route POST /api/rentals/bookings
const createRentalBooking = asyncHandler(async (req, res) => {
  const {
    rentalCar, pickupDate, returnDate, pickupTime, returnTime,
    pickupAddress, driverLicense, contactPhone, notes, paymentMethod,
    rentalUnit,
  } = req.body;

  const car = await RentalCar.findById(rentalCar);
  if (!car) { res.status(404); throw new Error('Rental car not found'); }
  if (car.status !== 'available') { res.status(400); throw new Error('This car is not available for rent'); }

  // Auto-derive allowed units from prices + any explicit rentalUnits flag.
  // If pricePerHour > 0, hour mode is enabled even when rentalUnits doesn't list it.
  const fromPrices = [];
  if (car.pricePerDay > 0) fromPrices.push('day');
  if (car.pricePerHour > 0) fromPrices.push('hour');
  const explicit = Array.isArray(car.rentalUnits) ? car.rentalUnits.filter(u => u === 'day' || u === 'hour') : [];
  const allowedUnits = Array.from(new Set([...explicit, ...fromPrices]));
  if (!allowedUnits.length) allowedUnits.push('day');

  const unit = rentalUnit && allowedUnits.includes(rentalUnit) ? rentalUnit : allowedUnits[0];
  if (unit === 'hour' && (!car.pricePerHour || car.pricePerHour <= 0)) {
    res.status(400);
    throw new Error('Hourly rental is not available for this car');
  }

  let totalDays = 0;
  let totalHours = 0;
  let subtotal = 0;

  if (unit === 'hour') {
    totalHours = hourDiff(pickupDate, pickupTime, returnDate, returnTime);
    if (totalHours < (car.minRentalHours || 1)) {
      res.status(400);
      throw new Error(`Minimum rental period is ${car.minRentalHours} hour(s)`);
    }
    if (car.maxRentalHours && totalHours > car.maxRentalHours) {
      res.status(400);
      throw new Error(`Maximum rental period is ${car.maxRentalHours} hour(s)`);
    }
    subtotal = totalHours * car.pricePerHour;
  } else {
    totalDays = dayDiff(pickupDate, returnDate);
    if (totalDays < (car.minRentalDays || 1)) {
      res.status(400);
      throw new Error(`Minimum rental period is ${car.minRentalDays} day(s)`);
    }
    if (car.maxRentalDays && totalDays > car.maxRentalDays) {
      res.status(400);
      throw new Error(`Maximum rental period is ${car.maxRentalDays} day(s)`);
    }
    subtotal = totalDays * car.pricePerDay;
  }

  // Conflict check (strict: only block actually overlapping bookings)
  // For day rentals dates differ; for hour rentals same-day must check timestamp
  const overlap = await RentalBooking.findOne({
    rentalCar,
    status: { $in: ['requested', 'confirmed', 'active'] },
    pickupDate: { $lte: new Date(returnDate) },
    returnDate: { $gte: new Date(pickupDate) },
  });
  if (overlap) {
    // For hour rentals on same date, a `<=`/`>=` overlap may be a false positive — verify with timestamps
    const requestedStart = new Date(`${new Date(pickupDate).toISOString().split('T')[0]}T${pickupTime || '00:00'}:00`).getTime();
    const requestedEnd = new Date(`${new Date(returnDate).toISOString().split('T')[0]}T${returnTime || '23:59'}:00`).getTime();
    const existingStart = new Date(`${new Date(overlap.pickupDate).toISOString().split('T')[0]}T${overlap.pickupTime || '00:00'}:00`).getTime();
    const existingEnd = new Date(`${new Date(overlap.returnDate).toISOString().split('T')[0]}T${overlap.returnTime || '23:59'}:00`).getTime();
    if (requestedStart < existingEnd && requestedEnd > existingStart) {
      res.status(400);
      throw new Error('Car is already booked for the selected time window');
    }
  }

  const totalAmount = subtotal + (car.securityDeposit || 0);

  const booking = await RentalBooking.create({
    user: req.user._id,
    rentalCar,
    carSnapshot: {
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      image: car.images?.[0],
      pricePerDay: car.pricePerDay,
    },
    pickupDate, returnDate, pickupTime, returnTime,
    rentalUnit: unit,
    totalDays, totalHours,
    pricePerDay: car.pricePerDay,
    pricePerHour: car.pricePerHour || 0,
    securityDeposit: car.securityDeposit || 0,
    subtotal, totalAmount,
    pickupAddress, driverLicense, contactPhone, notes,
    payment: { method: paymentMethod || 'online', status: 'pending' },
    statusHistory: [{ status: 'requested', note: 'Booking created' }],
  });

  if (paymentMethod === 'online') {
    const razorpay = getRazorpay();
    if (!razorpay) {
      res.status(500);
      throw new Error('Online payment is not configured. Please contact support.');
    }
    try {
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `rental_${booking._id}`,
      };
      const order = await razorpay.orders.create(options);
      booking.payment.razorpayOrderId = order.id;
      await booking.save();
      return res.status(201).json({ success: true, booking, order, key: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
      res.status(500);
      throw new Error(err?.error?.description || err?.message || 'Failed to create payment order');
    }
  }

  res.status(201).json({ success: true, booking });
});

// @desc  Verify rental payment
// @route POST /api/rentals/bookings/verify
const verifyRentalPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const booking = await RentalBooking.findById(bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    booking.payment.status = 'paid';
    booking.payment.razorpayPaymentId = razorpay_payment_id;
    booking.payment.razorpaySignature = razorpay_signature;
    booking.statusHistory.push({ status: 'confirmed', note: 'Payment verified automatically' });
    booking.status = 'confirmed';
    await booking.save();

    res.json({ success: true, booking });
  } else {
    res.status(400);
    throw new Error('Invalid signature');
  }
});

// @desc  Get current user's rental bookings
// @route GET /api/rentals/bookings/my
const getMyRentalBookings = asyncHandler(async (req, res) => {
  const bookings = await RentalBooking.find({ user: req.user._id })
    .populate('rentalCar', 'title brand model year images pricePerDay')
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

// @desc  Get all rental bookings (admin)
// @route GET /api/rentals/bookings
const getAllRentalBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const total = await RentalBooking.countDocuments(query);
  const bookings = await RentalBooking.find(query)
    .populate('user', 'name phone email')
    .populate('rentalCar', 'title brand model year images pricePerDay')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, bookings });
});

// @desc  Update rental booking status (admin)
// @route PUT /api/rentals/bookings/:id/status
const updateRentalBookingStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const booking = await RentalBooking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Rental booking not found'); }

  booking.status = status;
  booking.statusHistory.push({ status, note });

  if (status === 'active') {
    await RentalCar.findByIdAndUpdate(booking.rentalCar, { status: 'rented' });
  } else {
    // If status is anything other than 'active', the car should be available (unless admin manually marked it otherwise)
    // This handles moving back to 'confirmed' or moving to 'completed'/'cancelled'
    await RentalCar.findByIdAndUpdate(booking.rentalCar, { status: 'available' });
  }

  await booking.save();
  res.json({ success: true, booking });
});

// @desc  Cancel my rental booking
// @route PUT /api/rentals/bookings/:id/cancel
const cancelMyRentalBooking = asyncHandler(async (req, res) => {
  const booking = await RentalBooking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Rental booking not found'); }
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  if (!['requested', 'confirmed'].includes(booking.status)) {
    res.status(400); throw new Error('Cannot cancel this booking now');
  }
  booking.status = 'cancelled';
  booking.statusHistory.push({ status: 'cancelled', note: 'Cancelled by user' });
  await booking.save();
  res.json({ success: true, booking });
});

module.exports = {
  getRentalCars, getRentalCar, createRentalCar, updateRentalCar, deleteRentalCar,
  createRentalBooking, getMyRentalBookings, getAllRentalBookings,
  updateRentalBookingStatus, cancelMyRentalBooking, verifyRentalPayment
};
