const usersService = require("./users.service");

async function register(req, res) {
  const user = await usersService.register(req.body);

  res
    .status(201)
    .json({ success: true, message: "Registration successful", data: user });
}

async function login(req, res) {
  const result = await usersService.login(req.body);

  res
    .status(200)
    .json({ success: true, message: "Login successfully", data: result });
}

async function forgotPassword(req, res) {
  await usersService.forgotPassword(req.body);

  res.status(200).json({
    success: true,
    message: "If an account exists for that email, a reset link has been sent",
  });
}

async function resetPassword(req, res) {
  await usersService.resetPassword(req.body);

  res
    .status(200)
    .json({
      success: true,
      message: "Password has been reset, you can log in",
    });
}

module.exports = { register, login, forgotPassword, resetPassword };
