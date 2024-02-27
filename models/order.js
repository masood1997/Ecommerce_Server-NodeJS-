import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    name: {
      type: String,
      required: [true, 'Reciever Name Required']
    },
    address: {
      type: String,
      required: [true, 'Shipping  Address Required']
    },
    city: {
      type: String,
      required: [true, 'Shipping City Required']
    },
    state: {
      type: String,
      required: [true, 'Shipping State Required']
    },
    pincode: {
      type: Number,
      required: [true, 'Shipping Pincode Required'],
      validate: [
        (val) => {
          return /^\d{6}$/.test(val);
        },
        'Invalid Pincode. Must be 6 digit numeric'
      ]
    },
    country: {
      type: String,
      default: 'India'
    }
  },

  billingInfo: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      default: 'NA'
    },
    state: {
      type: String,
      required: true,
      default: 'NA'
    },
    pincode: {
      type: Number,
      required: true,
      validate: [
        (val) => {
          return /^\d{6}$/.test(val);
        },
        'Invalid Pincode. Must be 6 digit numeric'
      ]
    },
    country: {
      type: String,
      default: 'India'
    }
  },

  orderDate: {
    type: Date,
    required: true
  },

  orderItems: [
    {
      name: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      productId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
        required: [true, 'Product Id is required for creating Order']
      },
      quantity: {
        type: Number,
        required: true
      },
      itemPrice: {
        type: Number,
        required: true,
        default: 0
      }
    }
  ],

  taxAmount: {
    type: Number,
    required: true,
    default: 0
  },

  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },

  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },

  paymentInfo: {
    type: String,
    required: true
  },

  orderStatus: {
    type: String,
    required: true,
    default: 'Processing'
  },

  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.methods.createOrderOverviews = function () {
  const overviewDetail = {};
  (overviewDetail.name = this.shippingInfo.name),
    (overviewDetail.orderDate = this.orderDate),
    (overviewDetail.orderNumber = this._id),
    (overviewDetail.orderName = this.orderItems[0].name),
    (overviewDetail.image = this.orderItems[0].image),
    (overviewDetail.amount = this.totalAmount);
  return overviewDetail;
};

const Order = mongoose.model('orders', orderSchema);

export default Order;
