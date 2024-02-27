import express from 'express';
import isAuthenticated, { isAuthorized } from '../middlewares/auth.js';
import { uploadMultiple } from '../middlewares/multer.js';
import {
  getAllProducts,
  newProduct,
  createProductReview,
  getProductDetails,
  getProductReviews,
  deleteProduct,
  updateProduct
} from '../controllers/product.js';

const router = express.Router();

//Admin Routes
router.post('/admin/new', isAuthenticated, isAuthorized(['admin', 'superAdmin']), uploadMultiple, newProduct);
router
  .route('/admin/single/:id')
  .put(isAuthenticated, isAuthorized(['admin', 'superAdmin']), uploadMultiple, updateProduct)
  .delete(isAuthenticated, isAuthorized(['admin', 'superAdmin']), deleteProduct);

//Public Routes
router.get('/all', getAllProducts);
router.route('/single/:id').get(getProductDetails);
router.get('/reviews', getProductReviews);

//User Routes
router.route('/review').post(isAuthenticated, createProductReview);

export default router;
