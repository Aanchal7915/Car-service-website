const asyncHandler = require('express-async-handler');
const ServiceBooking = require('../models/ServiceBooking');
const { createOrder, verifyPayment } = require('../services/paymentService');

// @desc  Create service booking
// @route POST /api/services
const createBooking = asyncHandler(async (req, res) => {
  const booking = await ServiceBooking.create({
    ...req.body,
    user: req.user._id,
    statusHistory: [{ status: 'requested', note: 'Booking created' }],
  });
  res.status(201).json({ success: true, booking });
});

// @desc  Get user's bookings
// @route GET /api/services/my
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await ServiceBooking.find({ user: req.user._id })
    .populate('mechanic', 'name phone')
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

// @desc  Get single booking
// @route GET /api/services/:id
const getBooking = asyncHandler(async (req, res) => {
  const booking = await ServiceBooking.findById(req.params.id)
    .populate('user', 'name phone email')
    .populate('mechanic', 'name phone');
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  res.json({ success: true, booking });
});

// @desc  Update booking status (admin/mechanic)
// @route PUT /api/services/:id/status
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, note, mechanic, estimatedCost, finalCost } = req.body;
  const booking = await ServiceBooking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  // Track if mechanic field was explicitly sent in this request
  const mechanicProvided = Object.prototype.hasOwnProperty.call(req.body, 'mechanic');
  const previousMechanic = booking.mechanic ? String(booking.mechanic) : null;

  // Mechanic assignment: empty/null unassigns, valid id assigns
  if (mechanicProvided) {
    booking.mechanic = mechanic ? mechanic : null;
  }

  // Auto-promote to "accepted" the moment a mechanic is assigned to a fresh request
  let effectiveStatus = status || booking.status;
  if (mechanicProvided && mechanic && booking.status === 'requested' && (!status || status === 'requested')) {
    effectiveStatus = 'accepted';
  }

  if (effectiveStatus !== booking.status) {
    booking.status = effectiveStatus;
    booking.statusHistory.push({ status: effectiveStatus, note: note || '' });
  } else if (mechanicProvided && previousMechanic !== (mechanic || null)) {
    booking.statusHistory.push({
      status: booking.status,
      note: mechanic ? 'Mechanic assigned' : 'Mechanic unassigned',
    });
  }

  if (estimatedCost) booking.estimatedCost = estimatedCost;
  if (finalCost) booking.finalCost = finalCost;

  await booking.save();
  const populated = await ServiceBooking.findById(booking._id)
    .populate('user', 'name phone email')
    .populate('mechanic', 'name phone email');
  res.json({ success: true, booking: populated });
});

// @desc  All bookings (admin)
// @route GET /api/services
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = status ? { status } : {};
  const total = await ServiceBooking.countDocuments(query);
  const bookings = await ServiceBooking.find(query)
    .populate('user', 'name phone')
    .populate('mechanic', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, bookings });
});

// @desc  Create Razorpay order for advance payment
// @route POST /api/services/:id/payment
const createServicePayment = asyncHandler(async (req, res) => {
  const booking = await ServiceBooking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  const amount = req.body.amount || booking.estimatedCost;
  const order = await createOrder({ amount, receipt: `srv_${booking._id}` });
  res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
});

// @desc  Verify service payment
// @route POST /api/services/:id/verify-payment
const verifyServicePayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
  const isValid = verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
  if (!isValid) { res.status(400); throw new Error('Payment verification failed'); }

  const booking = await ServiceBooking.findById(req.params.id);
  booking.payment.status = 'paid';
  booking.payment.transactionId = razorpay_payment_id;
  booking.payment.advancePaid = amount;
  await booking.save();

  res.json({ success: true, message: 'Payment verified' });
});

module.exports = { createBooking, getMyBookings, getBooking, updateBookingStatus, getAllBookings, createServicePayment, verifyServicePayment };
