const express = require('express');
const router = express.Router();
const {
  getRentalCars, getRentalCar, createRentalCar, updateRentalCar, deleteRentalCar,
  createRentalBooking, getMyRentalBookings, getAllRentalBookings,
  updateRentalBookingStatus, cancelMyRentalBooking, verifyRentalPayment,
  getBookingLocation, getActiveLocations
} = require('../controllers/rentalController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { uploadBikeMedia } = require('../middleware/upload');

// Cars
router.get('/cars', getRentalCars);
router.get('/cars/:id', getRentalCar);
router.post('/cars', protect, adminOnly, uploadBikeMedia.array('images', 10), createRentalCar);
router.put('/cars/:id', protect, adminOnly, uploadBikeMedia.array('images', 10), updateRentalCar);
router.delete('/cars/:id', protect, adminOnly, deleteRentalCar);

// Bookings
router.post('/bookings', protect, createRentalBooking);
router.post('/bookings/verify', protect, verifyRentalPayment);
router.get('/bookings/my', protect, getMyRentalBookings);
router.get('/bookings', protect, adminOnly, getAllRentalBookings);
router.put('/bookings/:id/status', protect, adminOnly, updateRentalBookingStatus);
router.put('/bookings/:id/cancel', protect, cancelMyRentalBooking);

// Location tracking (static routes MUST come before :id routes)
router.get('/bookings/active-locations', protect, adminOnly, getActiveLocations);
router.get('/bookings/:id/location', protect, adminOnly, getBookingLocation);

module.exports = router;
