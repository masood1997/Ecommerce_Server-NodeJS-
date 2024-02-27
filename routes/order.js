import express from 'express';
import isAuthenticated, { isAuthorized } from '../middlewares/auth.js';
import {
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  newOrder,
  singleOrderDetail,
  updateOrderStatus
} from '../controllers/order.js';

const router = express.Router();

//User Routes
router.post('/new', isAuthenticated, newOrder);
router.get('/myOrders', isAuthenticated, getMyOrders);
router.get('/single/:id', isAuthenticated, getSingleOrder);

//Admin Routes
router.get('/admin/all', isAuthenticated, isAuthorized(['superAdmin', 'admin']), getAllOrders);
router
  .route('/admin/:id')
  .get(isAuthenticated, isAuthorized(['superAdmin', 'admin']), singleOrderDetail)
  .patch(isAuthenticated, isAuthorized(['superAdmin', 'admin']), updateOrderStatus)
  .delete(isAuthenticated, isAuthorized(['superAdmin', 'admin']), deleteOrder);

export default router;
