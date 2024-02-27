import jwt from 'jsonwebtoken';
import CustomError from '../utils/ErrorClass.js';
import User from '../models/user.js';
import { asyncErrorHandler } from './error.js';

const isAuthenticated = asyncErrorHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new CustomError('Login First', 401));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id);
  if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
    return next(new CustomError('Token Expired due to Password Change', 401));
  }
  req.user = user;
  next();
});

export const isAuthorized = (requiredRole) => {
  return (req, res, next) => {
    if (!requiredRole.includes(req.user.role))
      return next(new CustomError(`Role: ${req.user.role} is not allowed to access this resource`, 403));
    next();
  };
};
export default isAuthenticated;
