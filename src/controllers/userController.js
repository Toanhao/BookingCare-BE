const userService = require("../services/userService");

const registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res
      .status(201)
      .json({ errCode: 0, message: "User registered", data: user });
  } catch (err) {
    res.status(400).json({ errCode: 1, message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { user, token } = await userService.loginUser(req.body);
    res
      .status(200)
      .json({ errCode: 0, message: "Login success", data: { user, token } });
  } catch (err) {
    res.status(400).json({ errCode: 1, message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json({ errCode: 0, data: user });
  } catch (err) {
    res.status(400).json({ errCode: 1, message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res
      .status(201)
      .json({ errCode: 0, message: "User created successfully", data: user });
  } catch (err) {
    res.status(400).json({ errCode: 1, message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json({ errCode: 0, users });
  } catch (err) {
    res.status(400).json({ errCode: 1, message: err.message });
  }
};

const getDoctorUsers = async (req, res) => {
  try {
    const users = await userService.getDoctorUsers();
    res.status(200).json({ errCode: 0, data: users });
  } catch (err) {
    res.status(400).json({ errCode: 1, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ errCode: 0, message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ errCode: 1, message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res
      .status(200)
      .json({ errCode: 0, message: "User updated successfully", data: user });
  } catch (err) {
    res.status(400).json({ errCode: 1, message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  getDoctorUsers,
};
