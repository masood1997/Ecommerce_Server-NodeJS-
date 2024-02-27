import { asyncErrorHandler } from '../middlewares/error.js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import CustomError from '../utils/ErrorClass.js';

const newOrder = asyncErrorHandler(async (req, res, next) => {
  const user = req.user._id;

  const { shippingInfo, billingInfo, orderItems, paymentInfo, taxAmount, shippingPrice, totalAmount } = req.body;

  // Set default values for billingInfo to User Info if they are not provided
  const defaultBillingInfo = {
    address: req.user.address,
    pincode: req.user.pincode
  };
  const updatedBillingInfo = billingInfo || defaultBillingInfo;

  const order = await Order.create({
    shippingInfo,
    billingInfo: updatedBillingInfo,
    orderDate: Date.now(),
    orderItems,
    taxAmount,
    shippingPrice,
    totalAmount,
    paymentInfo,
    user
  });

  res.status(201).json({
    success: true,
    message: 'Order Created',
    order
  });
});

const getMyOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  if (!orders || orders.length === 0) {
    return res.status(200).json({
      success: true,
      orders: []
    });
  }
  // Utilized Array.prototype.map() to directly transform each order object into the desired detail Array of orders.
  const orderOverview = orders.map((order) => order.createOrderOverviews());

  res.status(200).json({
    success: true,
    orders: orderOverview
  });
});

const getSingleOrder = async (req, res, next) => {
  const order = await Order.find({ user: req.user._id, _id: req.params.id });
  if (!order.length > 0)
    return next(new CustomError("Couldn't find an order matching the provided Order ID for your account", 400));

  res.status(200).json({
    success: true,
    message: order
  });
};

const singleOrderDetail = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({ path: 'user', select: 'name email' });
  if (!order) return next(new CustomError(`No order exist for ID ${req.params.id}`, 400));

  res.status(200).json({
    success: true,
    message: order
  });
});

const getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  orders.forEach((order) => (totalAmount += order.totalAmount));

  res.status(200).json({
    success: true,
    TotalAmount: totalAmount,
    messasge: orders
  });
});

const updateOrderStatus = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new CustomError(`No order exist for ID ${req.params.id}`, 400));

  if (order.orderStatus === 'Delivered') return next(new CustomError('This order is already delivered', 400));

  try {
    order.orderItems.forEach(async (item) => {
      const product = await Product.findById(item.productId);
      product.stock -= item.quantity;
      await product.save({
        validateBeforeSave: true
      });
    });
    order.orderStatus = req.body.status;
    await order.save();
  } catch (error) {
    return next(new CustomError('Could not Update Order Status', 500));
  }

  res.status(200).json({
    success: true,
    message: order
  });
});

const deleteOrder = async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return next(new CustomError(`Cannot Find Order No ${req.params.id} to delete`, 400));
  res.status(200).json({
    success: true,
    message: 'Order Deleted'
  });
};

export { newOrder, getMyOrders, getSingleOrder, singleOrderDetail, getAllOrders, updateOrderStatus, deleteOrder };
