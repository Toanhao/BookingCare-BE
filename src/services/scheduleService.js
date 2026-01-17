const db = require("../models/index");
const { Op } = db.Sequelize;

// Tạo lịch hàng loạt (bulk) với việc xóa lịch cũ của ngày đó
const createScheduleBulk = async ({
  doctorId,
  workDate,
  timeSlotIds,
  maxPatient,
}) => {
  /* ========= 1. Validate input ========= */
  if (!doctorId || !workDate || !Array.isArray(timeSlotIds) || !maxPatient) {
    throw new Error("Missing required parameters");
  }

  /* ========= 2. Check doctor ========= */
  const doctor = await db.Doctor.findByPk(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  /* ========= 4. Nếu timeSlotIds rỗng → chỉ xóa, không tạo mới ========= */
  if (timeSlotIds.length === 0) {
    return {
      createdCount: 0,
      schedules: [],
      message: "All schedules deleted for this date",
    };
  }

  /* ========= 5. Check TimeSlot tồn tại ========= */
  const timeSlots = await db.TimeSlot.findAll({
    where: {
      id: { [Op.in]: timeSlotIds },
    },
  });

  if (timeSlots.length !== timeSlotIds.length) {
    throw new Error("One or more TimeSlots not found");
  }

  // Check if any time slot has passed (assumes server timezone is Asia/Ho_Chi_Minh)
  const now = new Date();
  const hasInvalidSlot = timeSlots.some((slot) => {
    const slotDateTime = new Date(`${workDate}T${slot.startTime}`);
    return slotDateTime <= now;
  });

  if (hasInvalidSlot) {
    throw new Error("Không thể tạo lịch cho các khung giờ đã qua");
  }

  // Lấy tất cả schedule của ngày đó
  const oldSchedules = await db.Schedule.findAll({
    where: {
      doctorId,
      [db.Sequelize.Op.and]: [
        db.Sequelize.where(
          db.Sequelize.fn("DATE", db.Sequelize.col("workDate")),
          "=",
          workDate
        ),
      ],
    },
    include: [
      {
        model: db.Booking,
        as: "bookings",
        attributes: ["id", "status"],
      },
    ],
  });

  // Xóa chỉ những schedule không có booking "done"
  const existingTimeSlotIds = new Set();
  for (const schedule of oldSchedules) {
    const hasDoneBooking = schedule.bookings?.some(
      (booking) => booking.status === "DONE" || booking.status === "CONFIRMED"
    );
    if (!hasDoneBooking) {
      await schedule.destroy({ individualHooks: true });
    } else {
      // Lưu lại timeSlot của những schedule có DONE booking
      existingTimeSlotIds.add(schedule.timeSlotId);
    }
  }

  /* ========= 6. Chuẩn bị data để tạo ========= */
  // Chỉ tạo schedule cho những timeSlot chưa tồn tại (hoặc đã bị xóa)
  const schedulesToCreate = timeSlotIds
    .filter((slotId) => !existingTimeSlotIds.has(slotId))
    .map((slotId) => ({
      doctorId,
      workDate,
      timeSlotId: slotId,
      maxPatient,
    }));

  /* ========= 7. Tạo lịch hàng loạt ========= */
  const createdSchedules = await db.Schedule.bulkCreate(schedulesToCreate);

  /* ========= 8. Trả kết quả ========= */
  return {
    createdCount: createdSchedules.length,
    schedules: createdSchedules,
  };
};

// Lấy danh sách lịch theo filter
const getSchedules = async (filters) => {
  const where = {};
  if (filters.doctorId) where.doctorId = parseInt(filters.doctorId);

  const include = [
    { model: db.Doctor, as: "doctor" },
    { model: db.TimeSlot, as: "timeSlot" },
    { model: db.Booking, as: "bookings" },
  ];

  if (filters.workDate) {
    where[db.Sequelize.Op.and] = [
      db.Sequelize.where(
        db.Sequelize.fn("DATE", db.Sequelize.col("Schedule.workDate")),
        "=",
        filters.workDate
      ),
    ];

    const today = new Date().toISOString().split("T")[0];

    if (filters.workDate === today) {
      const nowTime = new Date().toTimeString().split(" ")[0]; // HH:mm:ss
      include[1] = {
        ...include[1],
        where: { startTime: { [Op.gt]: nowTime } },
        required: true,
      };
    }
  }

  return db.Schedule.findAll({
    where,
    include,
    order: [
      ["workDate", "ASC"],
      ["timeSlotId", "ASC"],
    ],
  });
};

// Cập nhật lịch
const updateSchedule = async (scheduleId, data) => {
  if (!scheduleId) throw new Error("Missing schedule ID");

  const schedule = await db.Schedule.findByPk(scheduleId);
  if (!schedule) throw new Error("Schedule not found");

  const newTimeSlotId = data.timeSlotId || schedule.timeSlotId;
  const newWorkDate = data.workDate || schedule.workDate;

  if (
    newTimeSlotId !== schedule.timeSlotId ||
    newWorkDate !== schedule.workDate
  ) {
    const conflict = await db.Schedule.findOne({
      where: {
        doctorId: schedule.doctorId,
        timeSlotId: newTimeSlotId,
        workDate: newWorkDate,
        id: { [Op.ne]: scheduleId },
      },
    });
    if (conflict)
      throw new Error(
        "Schedule conflict: Doctor already has a schedule for this time slot on this date"
      );
  }

  return schedule.update(data);
};

module.exports = {
  createScheduleBulk,
  getSchedules,
  updateSchedule,
};
