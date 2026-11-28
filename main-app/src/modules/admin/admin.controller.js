const adminService = require("./admin.service");

async function login(req, res) {
  const result = await adminService.login(req.body);

  res
    .status(200)
    .json({ success: true, message: "Admin login successful", data: result });
}

async function listInstallers(req, res) {
  const installers = await adminService.listInstallers(req.query);

  res.status(200).json({ success: true, data: installers });
}

async function getInstaller(req, res) {
  const installer = await adminService.getInstaller(req.params.id);

  res.status(200).json({ success: true, data: installer });
}

async function reviewInstaller(req, res) {
  const installer = await adminService.reviewInstaller(
    req.user.id,
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: `Installer ${installer.verificationStatus}`,
    data: installer,
  });
}

module.exports = { login, listInstallers, getInstaller, reviewInstaller };
