class CustomError extends Error {
  constructor(message, statusCode) {
    // Enforce consistent message type
    const errorMessage = typeof message === 'string' ? message : JSON.stringify(message);
    super(errorMessage);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
