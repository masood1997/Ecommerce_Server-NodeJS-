import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [
      (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password cannot be less than 6 characters'],
    select: false,
    validate: [
      (val) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[a-zA-Z!@#$%^&*()_+0-9]{8,}$/.test(val);
      },
      'Password must have at least one lowercase, one uppercase and one special character'
    ]
  },
  dob: {
    required: [true, 'Date of Birth is required'],
    type: Date
  },
  profilePic: {
    public_id: {
      type: String
    },
    secure_url: {
      type: String,
      required: [true, 'Please upload Photo']
    }
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  pincode: {
    type: Number,
    required: [true, 'Pincode is required'],
    validate: [
      (val) => {
        return /^\d{6}$/.test(val);
      },
      'Pincode must be exactly 6 digit numeric'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  },
  passwordChangedAt: {
    type: Date
  },
  otp: {
    type: String
  },
  otpExpireAt: {
    type: Date
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (typedPassword) {
  return bcrypt.compare(typedPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

userSchema.methods.generateOTP = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashed_Otp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otp = hashed_Otp;
  this.otpExpireAt = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.resetPassword = function (password) {
  this.password = password;
  this.otp = undefined;
  this.otpExpireAt = undefined;
  this.passwordChangedAt = Date.now();
};

userSchema.virtual('age').get(function () {
  const today = new Date();
  const age = today.getFullYear() - this.dob.getFullYear();
  const monthDiff = today.getMonth() - this.dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dob.getDate())) {
    return age - 1;
  }
  return age;
});

const User = mongoose.model('users', userSchema);

export default User;
