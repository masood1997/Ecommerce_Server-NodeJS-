const setCookie = async (user, res, statusCode, message) => {
  const token = await user.generateToken();

  res
    .status(statusCode)
    .cookie('token', token, {
      maxAge: 86400000,
      httpOnly: true,
      sameSite: process.env.MODE === 'DEVELOPMENT' ? 'Lax' : 'None',
      secure: process.env.MODE === 'DEVELOPMENT' ? false : true
    })
    .json({
      success: true,
      message: message
    });
};
export default setCookie;
