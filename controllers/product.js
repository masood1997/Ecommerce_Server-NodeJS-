import { asyncErrorHandler } from '../middlewares/error.js';
import Product from '../models/product.js';
import CustomError from '../utils/ErrorClass.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const products = await Product.find({});
  res.status(200).json({
    success: true,
    message: products
  });
});

const newProduct = asyncErrorHandler(async (req, res, next) => {
  const { name, category, price, description, stock } = req.body;
  const images = [];

  if (req.files && req.files.length > 0) {
    await Promise.all(
      req.files.map(async (file) => {
        const { public_id, secure_url } = await uploadOnCloudinary(file.path, next);
        images.push({ publicId: public_id, url: secure_url });
      })
    );
  }
  const product = await Product.create({
    name,
    category,
    price,
    description,
    image: images,
    stock
  });
  res.status(201).json({
    success: true,
    message: 'Item created',
    product
  });
});

const getProductDetails = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new CustomError(`No Product exist for ID: ${req.params.id}`, 400));

  res.status(200).json({
    success: true,
    message: product
  });
});

const getProductReviews = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.q);
  if (!product) return next(new CustomError(`No Product exist for ID: ${req.query.q}`, 400));

  const reviews = product.reviews;

  res.status(200).json({
    success: true,
    message: reviews
  });
});

const createProductReview = asyncErrorHandler(async (req, res, next) => {
  const { rating, comment, title, productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return next(new CustomError(`No Product exist for ID: ${productId}`, 400));
  const review = {
    rating,
    comment,
    title,
    name: req.user.name,
    user: req.user._id
  };

  const reviewExist = product.reviews.findIndex((rev) => rev.user.toString() === req.user._id.toString());
  if (reviewExist === -1) {
    product.reviews.push(review);
  } else {
    product.reviews[reviewExist] = review;
  }

  product.updateProductRating();
  await product.save({
    new: true,
    validateBeforeSave: true
  });

  res.status(201).json({
    success: true,
    message: 'Review Posted'
  });
});

const deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return next(new CustomError(`No Product exist for ID: ${req.params.id}`, 400));

  res.status(200).json({
    success: true,
    message: 'Product Deleted'
  });
});

const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const { rating, noOfReviews, reviews, ...newDetails } = req.body;
  
  const product = await Product.findByIdAndUpdate(req.params.id, newDetails, {
    new: true,
    runValidators: true
  });
  if (!product) return next(new CustomError(`No Product exist for ID: ${req.params.id}`, 400));

  if(req.files && req.files.length >0 ){
    await Promise.all(
      req.files.map(async (file)=>{
        const {public_id,secure_url} = await uploadOnCloudinary(file.path,next)
        product.image.push({ publicId: public_id, url: secure_url })
      })
    )
  }

  await product.save({
    new:true,
    validateBeforeSave:true
  })
  res.status(200).json({
    success: true,
    message: 'Product Updated Successfully',
    product
  });
});

export {
  getAllProducts,
  newProduct,
  createProductReview,
  getProductDetails,
  getProductReviews,
  deleteProduct,
  updateProduct
};
