import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  publicId: {
    type: String
  },
  url: {
    type: String,
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Enter product price'],
    validate: [
      (price) => {
        return /^\d{1,6}$/.test(price);
      },
      'Price of product cannot be more than 6 digit'
    ]
  },
  rating: {
    type: Number,
    default: 0
  },
  image: {
    type: [imageSchema],
    required: true,
    validate: [
      (image) => {
        return image.length > 0;
      },
      'Atleast 1 image is required'
    ]
  },
  category: {
    type: String,
    required: [true, 'Enter the category of the product']
  },
  stock: {
    type: Number,
    default: 1,
    validate: [
      (stock) => {
        return /^\d{1,3}$/.test(stock);
      },
      'Maximum allowed stock is 999'
    ]
  },
  noOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      name: {
        type: String,
        required: [true, 'Reviewer name is required']
      },
      rating: {
        type: Number,
        required: [true, 'Rating is required before submitting review']
      },
      title: {
        type: String,
        required: [true, 'Review title is required']
      },
      comment: {
        type: String,
        required: [true, 'Review comment cannot be blank']
      },
      user:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"User"
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.methods.updateProductRating = function(){
  this.noOfReviews = this.reviews.length
  let ratingSum = 0;
  this.reviews.forEach((rev)=>ratingSum+=rev.rating)
  this.rating = ratingSum/this.noOfReviews;
}

const Product = mongoose.model('products', productSchema);

export default Product;
