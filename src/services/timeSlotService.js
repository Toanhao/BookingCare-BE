const db = require("../models/index");
const { Op } = db.Sequelize;

const createTimeSlot = async ({ startTime, endTime, label }) => {
  if (!startTime || !endTime || !label) {
    throw new Error("Missing required parameters: startTime, endTime, label");
  }

  // Kiểm tra trùng giờ
  const existed = await db.TimeSlot.findOne({
    where: { startTime, endTime },
  });
  if (existed) throw new Error("TimeSlot already exists");

  return db.TimeSlot.create({ startTime, endTime, label });
};

const getTimeSlots = async () => {
  return db.TimeSlot.findAll({
    order: [["startTime", "ASC"]],
  });
};

const getTimeSlotById = async (id) => {
  if (!id) throw new Error("Missing timeSlot ID");

  const slot = await db.TimeSlot.findByPk(id);
  if (!slot) throw new Error("TimeSlot not found");

  return slot;
};

const updateTimeSlot = async (id, data) => {
  if (!id) throw new Error("Missing timeSlot ID");

  const slot = await db.TimeSlot.findByPk(id);
  if (!slot) throw new Error("TimeSlot not found");

  // Nếu đổi start/end → check trùng
  const newStart = data.startTime ?? slot.startTime;
  const newEnd = data.endTime ?? slot.endTime;

  const existed = await db.TimeSlot.findOne({
    where: {
      startTime: newStart,
      endTime: newEnd,
      id: { [Op.ne]: id },
    },
  });
  if (existed)
    throw new Error("Another TimeSlot with the same time range already exists");

  return slot.update(data);
};

const deleteTimeSlot = async (id) => {
  if (!id) throw new Error("Missing timeSlot ID");

  const slot = await db.TimeSlot.findByPk(id);
  if (!slot) throw new Error("TimeSlot not found");

  const scheduleCount = await db.Schedule.count({ where: { timeSlotId: id } });
  if (scheduleCount > 0)
    throw new Error("Cannot delete TimeSlot with existing schedules");

  return slot.destroy();
};

module.exports = {
  createTimeSlot,
  getTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot,
};
