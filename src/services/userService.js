const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Đăng ký user (role mặc định là PATIENT)
const registerUser = async ({ fullName, email, password, ...profileData }) => {
  // Validate required fields
  if (!fullName || !email || !password) {
    throw new Error("Missing required parameters: fullName, email, password");
  }

  // Kiểm tra email đã tồn tại chưa
  const existed = await db.User.findOne({ where: { email } });
  if (existed) throw new Error("Email already in use");

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Tạo user, role mặc định là PATIENT
  const user = await db.User.create({
    fullName,
    email,
    password: hashedPassword,
    role: "PATIENT",
    ...profileData,
  });

  // Tạo patient profile luôn
  await db.Patient.create({ id: user.id });

  return user;
};

// Đăng nhập user
const loginUser = async ({ email, password }) => {
  if (!email || !password) throw new Error("Missing email or password");

  const user = await db.User.findOne({
    where: { email },
  });

  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Incorrect password");

  // Tạo JWT
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  // Bỏ password trước khi trả về
  const { password: _pw, ...safeUser } = user;

  return { user: safeUser, token };
};

// Lấy profile user kèm data tương ứng với role
const getUserProfile = async (userId) => {
  const user = await db.User.findByPk(userId, {
    include: [
      { model: db.Patient, as: "patientData" },
      { model: db.Admin, as: "adminData" },
      { model: db.Doctor, as: "doctorData" },
    ],
  });
  if (!user) throw new Error("User not found");
  return user;
};

// Admin tạo user với role tùy chỉnh (chỉ DOCTOR hoặc PATIENT)
const createUser = async ({
  fullName,
  email,
  password,
  role,
  ...profileData
}) => {
  // Validate required fields
  if (!fullName || !email || !password || !role) {
    throw new Error(
      "Missing required parameters: fullName, email, password, role"
    );
  }

  // Chỉ cho phép tạo PATIENT hoặc DOCTOR
  if (role !== "PATIENT" && role !== "DOCTOR") {
    throw new Error("Only PATIENT and DOCTOR roles can be created");
  }

  // Kiểm tra email đã tồn tại chưa
  const existed = await db.User.findOne({ where: { email } });
  if (existed) throw new Error("Email already in use");

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Tạo user với role từ admin
  const user = await db.User.create({
    fullName,
    email,
    password: hashedPassword,
    role,
    ...profileData,
  });

  if (role === "PATIENT") {
    await db.Patient.create({ id: user.id });
  }

  return user;
};

// Lấy danh sách tất cả users
const getUsers = async () => {
  const users = await db.User.findAll({
    attributes: { exclude: ["password"] },
    include: [
      { model: db.Patient, as: "patientData" },
      { model: db.Doctor, as: "doctorData" },
      { model: db.Admin, as: "adminData" },
    ],
  });
  return users;
};

// Xóa user
const deleteUser = async (userId) => {
  const user = await db.User.findByPk(userId);
  if (!user) throw new Error("User not found");

  // Xóa các record liên quan
  if (user.role === "PATIENT") {
    await db.Patient.destroy({ where: { id: userId } });
  } else if (user.role === "DOCTOR") {
    await db.Patient.destroy({ where: { id: userId } });
    await db.Doctor.destroy({ where: { id: userId } });
  } else if (user.role === "ADMIN") {
    await db.Admin.destroy({ where: { id: userId } });
  }

  await user.destroy();
  return true;
};

// Cập nhật user
const updateUser = async (userId, updateData) => {
  const user = await db.User.findByPk(userId);
  if (!user) throw new Error("User not found");

  // Nếu có password mới thì hash
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
  }

  // Không cho phép thay đổi email
  delete updateData.email;

  await user.update(updateData);
  return user;
};

// Lấy danh sách tất cả doctors (users có role DOCTOR)
const getDoctorUsers = async () => {
  const doctors = await db.User.findAll({
    where: { role: "DOCTOR" },
    attributes: { exclude: ["password"] },
  });
  return doctors;
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
