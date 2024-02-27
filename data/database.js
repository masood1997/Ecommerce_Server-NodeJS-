import mongoose from 'mongoose';

const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: 'ECommerce'
    })
    .then(() => {
      console.log('Connected to Database');
    })
    .catch((err) => {
      console.log('Shutting down server due to Unhandled Promise Rejection');
      console.log(err.message);
      process.exit(1);
    });
};

export default connectDB;
