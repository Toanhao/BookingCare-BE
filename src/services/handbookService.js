const { at } = require("lodash");
const db = require("../models/index");

const createHandbook = async ({ title, content, image, doctorId }) => {
  if (!title || !content || !doctorId) {
    throw new Error("Missing required parameters");
  }

  const doctor = await db.Doctor.findByPk(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return db.Handbook.create({
    title,
    content,
    image: image || null,
    doctorId,
  });
};

const getHandbooks = async () => {
  return db.Handbook.findAll({
    attributes: ["id", "title", "image", "createdAt"],
    include: [
      {
        model: db.Doctor,
        as: "doctor",
        attributes: ["id"], // name lấy từ User nếu có
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getHandbookById = async (id) => {
  if (!id) throw new Error("Missing handbook id");

  const handbook = await db.Handbook.findByPk(id, {
    include: [
      {
        model: db.Doctor,
        as: "doctor",
        attributes: ["id", "title", "fee"],
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "fullName", "image"],
          },
        ],
      },
    ],
  });

  if (!handbook) throw new Error("Handbook not found");

  return handbook;
};

const updateHandbook = async (id, data) => {
  if (!id) throw new Error("Missing handbook id");

  const handbook = await db.Handbook.findByPk(id);
  if (!handbook) throw new Error("Handbook not found");

  const payload = {
    title: data.title ?? handbook.title,
    content: data.content ?? handbook.content,
    image: data.image ?? handbook.image,
    doctorId: data.doctorId ?? handbook.doctorId,
  };

  await handbook.update(payload);
  return handbook;
};

const deleteHandbook = async (id) => {
  if (!id) throw new Error("Missing handbook id");

  const handbook = await db.Handbook.findByPk(id);
  if (!handbook) throw new Error("Handbook not found");

  await handbook.destroy();
  return true;
};

module.exports = {
  createHandbook,
  getHandbooks,
  getHandbookById,
  updateHandbook,
  deleteHandbook,
};
