const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Bike = require('../models/Bike');
const Enquiry = require('../models/Enquiry');
const ServiceBooking = require('../models/ServiceBooking');
const SellRequest = require('../models/SellRequest');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const ServiceType = require('../models/ServiceType');
const RentalCar = require('../models/RentalCar');
const RentalBooking = require('../models/RentalBooking');

// @desc  Dashboard stats
// @route GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [users, bikes, services, sells, orders, rentalCars, rentalBookings] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Bike.countDocuments(),
    ServiceBooking.countDocuments(),
    SellRequest.countDocuments(),
    Order.countDocuments(),
    RentalCar.countDocuments(),
    RentalBooking.countDocuments(),
  ]);

  const pendingServices = await ServiceBooking.countDocuments({ status: 'requested' });
  const pendingSells = await SellRequest.countDocuments({ status: 'pending' });
  const pendingRentals = await RentalBooking.countDocuments({ status: 'requested' });
  const revenue = await Order.aggregate([
    { $match: { 'payment.status': 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  res.json({
    success: true,
    stats: {
      users, bikes, services, sells, orders, rentalCars, rentalBookings,
      pendingServices, pendingSells, pendingRentals,
      revenue: revenue[0]?.total || 0,
    },
  });
});

// @desc  Get all users
// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = role ? { role } : {};
  const total = await User.countDocuments(query);
  const users = await User.find(query).select('-password -otp -otpExpiry').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, users });
});

// @desc  Update user (role, status)
// @route PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

// @desc  Approve bike listing
// @route PUT /api/admin/bikes/:id/approve
const approveBike = asyncHandler(async (req, res) => {
  const bike = await Bike.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!bike) { res.status(404); throw new Error('Bike not found'); }
  res.json({ success: true, bike });
});

// @desc  Get mechanics
// @route GET /api/admin/mechanics
const getMechanics = asyncHandler(async (req, res) => {
  const mechanics = await User.find({ role: 'mechanic', isActive: true }).select('name phone email');
  res.json({ success: true, mechanics });
});

const toUrl = (f) => f.path.includes('uploads') ? '/uploads' + f.path.split('uploads')[1].replace(/\\/g, '/') : f.path;

// @desc  Create Category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const image = req.file ? toUrl(req.file) : null;
  const category = await Category.create({ name, image });
  res.status(201).json({ success: true, category });
});


// @desc  Get Categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, categories });
});

// @desc  Delete Category
const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

// @desc  Create Brand
const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const image = req.file ? toUrl(req.file) : null;
  const brand = await Brand.create({ name, image });
  res.status(201).json({ success: true, brand });
});


// @desc  Get Brands
const getBrandsList = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ name: 1 });
  res.json({ success: true, brands });
});

// @desc  Delete Brand
const deleteBrand = asyncHandler(async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Brand deleted' });
});

// @desc  Get all enquiries (admin)
// @route GET /api/admin/enquiries
const getAllEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find()
    .populate('user', 'name email phone')
    .populate({ path: 'bike', select: 'title brand model year price images location' })
    .sort({ createdAt: -1 });
  res.json({ success: true, enquiries });
});

// @desc  Update enquiry status (admin)
// @route PUT /api/admin/enquiries/:id
const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('user', 'name email phone')
    .populate({ path: 'bike', select: 'title brand model year price images location' });
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  res.json({ success: true, enquiry });
});

// ── Service Types CRUD ──
const getServiceTypes = asyncHandler(async (req, res) => {
  const types = await ServiceType.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, serviceTypes: types });
});

const getActiveServiceTypes = asyncHandler(async (req, res) => {
  const types = await ServiceType.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, serviceTypes: types });
});

const createServiceType = asyncHandler(async (req, res) => {
  const type = await ServiceType.create(req.body);
  res.status(201).json({ success: true, serviceType: type });
});

const updateServiceType = asyncHandler(async (req, res) => {
  const type = await ServiceType.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!type) { res.status(404); throw new Error('Service type not found'); }
  res.json({ success: true, serviceType: type });
});

const deleteServiceType = asyncHandler(async (req, res) => {
  await ServiceType.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Service type deleted' });
});

module.exports = {
  getDashboardStats, getUsers, updateUser, approveBike, getMechanics,
  createCategory, getCategories, deleteCategory,
  createBrand, getBrandsList, deleteBrand,
  getAllEnquiries, updateEnquiry,
  getServiceTypes, getActiveServiceTypes, createServiceType, updateServiceType, deleteServiceType
};
