import User from '../models/user.js';
import { asyncErrorHandler } from '../middlewares/error.js';
import CustomError from '../utils/ErrorClass.js';
import setCookie from '../utils/setCookie.js';
import { uploadOnCloudinary, destroyOldPhoto } from '../utils/cloudinary.js';
import sendEmail from '../utils/nodemailer.js';
import crypto from 'crypto';

/// Get All Users (Admin Route)
const getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find({ role: 'user' }).select({
    name: 1,
    email: 1,
    dob: 1,
    address: 1,
    pincode: 1,
    _id: 1,
    createdAt: 1
  });

  res.status(200).json({
    success: true,
    message: users
  });
});

/// Get Single User Info (Admin Route)
const getSingleUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new CustomError(`User not found for ID: ${req.params.id}`, 400));

  res.status(200).json({
    success: true,
    message: user
  });
});

/// Update User Email & Role (Admin Route)
const updateUserRole = asyncErrorHandler(async (req, res, next) => {
  const { email, role } = req.body;
  const newUserData = { email, role };
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'User Updated',
    user
  });
});

/// Delete User by Id (Admin Route)
const deleteUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if(!user) return next(new CustomError(`User not found for ID: ${req.params.id}`,400));
  res.status(200).json({
    success: true,
    message: 'User Deleted'
  });
});

/// Get User Proile Info
const userProfile = (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: user
  });
};

/// Update User Profile
const updateProfile = asyncErrorHandler(async (req, res, next) => {
  const { email, password, ...newUser } = req.body;

  if (req.file) {
    destroyOldPhoto(req.user.profilePic.public_id);
    const filePath = req.file.path;
    const { public_id, secure_url } = await uploadOnCloudinary(filePath);
    newUser.profilePic = {
      public_id,
      secure_url
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUser, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'User Updated Successfully',
    user
  });
});

/// Login User
const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new CustomError('User not found', 404));
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new CustomError('Invalid Email or Password', 401));

  setCookie(user, res, 200, 'Logged In');
});

/// Register New User
const register = asyncErrorHandler(async (req, res, next) => {
  const { email, password, name, address, pincode, dob } = req.body;
  const profilePic = {};
  if (req.file) {
    const { public_id, secure_url } = await uploadOnCloudinary(req.file.path);
    profilePic.public_id = public_id;
    profilePic.secure_url = secure_url;
  }

  const user = await User.create({
    email,
    password,
    name,
    address,
    pincode,
    dob,
    profilePic
  });

  setCookie(user, res, 201, 'User Created Successfully');
});

/// Log Out User
const logOut = asyncErrorHandler((req, res, next) => {
  res
    .status(200)
    .clearCookie('token')
    .json({
      success: true,
      message: 'Logged Out'
    });
});

/// Forgot Password
const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new CustomError('Invalid Email / User Not Found', 404));
  const otp = user.generateOTP();
  await user.save();

  const message = `Your OTP to reset Password for Choudharys Retail account is below \n\n${otp} \n\nOTP will be valid for next 10 minutes only. Please Ignore if not requested`;
  try {
    await sendEmail({
      email: user.email,
      message: message,
      subject: 'Password Recovery Request'
    });
    res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email}`
    });
  } catch (error) {
    user.otp = null;
    user.otpExpireAt = null;
    await user.save();
    return next(new CustomError('Error Occured sending OTP to mail', 500));
  }
});

/// Reset Password
const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { otp, password, confirmPassword } = req.body;
  const hashed_otp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    otp: hashed_otp,
    otpExpireAt: { $gt: Date.now() }
  });
  if (!user) return next(new CustomError('Invalid OTP / OTP Expired', 400));

  if (password !== confirmPassword) return next(new CustomError('Passwords do not match', 400));

  user.resetPassword(password);
  await user.save({
    validateBeforeSave: true
  });
  res.status(201).json({
    success: true,
    message: 'Password Changed Successfully. LogIn using new Password'
  });
});

/// Update Password
const updatePassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new CustomError('Old Password is Incorrect', 401));

  if (newPassword !== confirmNewPassword) return next(new CustomError('Passwords do not match', 400));

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save({
    validateBeforeSave: true
  });
  setCookie(user, res, 200, 'Password Updated');
});

export {
  register,
  login,
  userProfile,
  logOut,
  updateProfile,
  forgotPassword,
  resetPassword,
  updatePassword,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUserRole
};
