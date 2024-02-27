// Global Error Middleware
export const errorMiddleware = (err, req, res, next) => {
  // special case for mongoose unique property error
  if (err.code === 11000 || err.code === 11001) {
    return res.status(409).json({
      success: false,
      message: 'Email already exist. LogIn or use another'
    });
  }
  if (err.name === 'ValidationError') {
    const errorMessage = handleRegisterError(err);
    console.log(err.stack);
    return res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
  if (err.name === 'CastError') {
    console.log(err.stack);
    return res.status(400).json({
      success: false,
      message: "Invalid Id Passed"
    });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
  console.log(err.stack);
};

// Mongoose Validation Error Middleware
export const handleRegisterError = (err) => {
  // Declaring empty error object and populate on validation errors found
  let errorMessage = {};

  Object.keys(err.errors).forEach((key) => {
    // Assign the error messages to the corresponding field in the 'errorMessage' object only if the error message exists
    errorMessage[key] = err.errors[key].message;
  });
  return errorMessage;
};

// Async Error Handler
export const asyncErrorHandler = (passedFunction) => (req, res, next) => {
  Promise.resolve(passedFunction(req, res, next)).catch(next);
};

export default errorMiddleware;
