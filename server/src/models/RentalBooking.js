const mongoose = require('mongoose');

const rentalBookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rentalCar: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalCar', required: true },
    carSnapshot: {
      title: String,
      brand: String,
      model: String,
      year: Number,
      image: String,
      pricePerDay: Number,
    },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    pickupTime: { type: String, default: '10:00' },
    returnTime: { type: String, default: '10:00' },
    totalDays: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    pickupAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    driverLicense: { type: String },
    contactPhone: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'requested',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    payment: {
      method: { type: String, enum: ['online', 'cod'], default: 'online' },
      status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
      transactionId: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
    },
  },
  { timestamps: true }
);

rentalBookingSchema.index({ user: 1, status: 1 });
rentalBookingSchema.index({ rentalCar: 1, pickupDate: 1, returnDate: 1 });

module.exports = mongoose.model('RentalBooking', rentalBookingSchema);
