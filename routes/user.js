import express from 'express';
import {
  deleteUser,
  forgotPassword,
  getAllUsers,
  getSingleUser,
  logOut,
  login,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUserRole,
  userProfile
} from '../controllers/user.js';
import isAuthenticated, { isAuthorized } from '../middlewares/auth.js';
import { uploadSingle } from '../middlewares/multer.js';

const router = express.Router();

//Public Routes
router.post('/new', uploadSingle, register);
router.post('/login', login);
router.get('/logout', isAuthenticated, logOut);

//User Routes
router.get('/profile', isAuthenticated, userProfile);
router.patch('/update', isAuthenticated, uploadSingle, updateProfile);

//Password Routes
router.post('/password/forgot', forgotPassword);
router.put('/password/reset', resetPassword);
router.patch('/password/update', isAuthenticated, updatePassword);

//Admin Routes
router.get('/admin/users', isAuthenticated, isAuthorized(['admin', 'superAdmin']), getAllUsers);
router
  .route('/admin/user/:id')
  .get(isAuthenticated, isAuthorized(['admin', 'superAdmin']), getSingleUser)
  .patch(isAuthenticated, isAuthorized('superAdmin'), updateUserRole)
  .delete(isAuthenticated, isAuthorized(['admin', 'superAdmin']), deleteUser);

export default router;
