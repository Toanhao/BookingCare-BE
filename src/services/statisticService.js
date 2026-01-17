const db = require("../models/index");
const { Op, fn, col } = require("sequelize");

// Normalize date range to half-open [startOfDay(from), startOfNextDay(to)) to avoid double-counting boundary
const normalizeDateRange = (from, to) => {
  if (!from || !to) return undefined;
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1); // next day 00:00, exclusive
  return { [Op.gte]: start, [Op.lt]: end };
};

// KPI Tổng quan (Total bookings, revenue)
const getDashboardKPI = async ({ clinicId, specialtyId, from, to }) => {
  // Build filters
  const scheduleDateWhere =
    from && to ? { workDate: normalizeDateRange(from, to) } : {};
  const doctorWhere = {
    ...(clinicId && { clinicId }),
    ...(specialtyId && { specialtyId }),
  };
  const bookingWhere = { status: "DONE" };
  const requireDoctor = Object.keys(doctorWhere).length > 0;

  // Tính tổng lượt khám trong khoảng thời gian
  const totalBookings = await db.Booking.count({
    where: bookingWhere,
    include: [
      {
        model: db.Schedule,
        as: "schedule",
        where: scheduleDateWhere,
        attributes: [],
        required: true,
        include: [
          {
            model: db.Doctor,
            as: "doctor",
            where: doctorWhere,
            attributes: [],
            required: requireDoctor,
          },
        ],
      },
    ],
  });

  // Tính tổng doanh thu trong khoảng thời gian (lọc theo Doctor, gắn theo Schedule.workDate)
  const totalRevenueResult = await db.Bill.findOne({
    attributes: [[fn("SUM", col("Bill.total")), "total"]],
    where: {
      status: "PAID",
    },
    include: [
      {
        model: db.MedicalRecord,
        as: "medicalRecord",
        attributes: [],
        required: true,
        include: [
          {
            model: db.Booking,
            as: "booking",
            attributes: [],
            where: bookingWhere,
            required: true,
            include: [
              {
                model: db.Schedule,
                as: "schedule",
                attributes: [],
                required: true,
                where: scheduleDateWhere,
                include: [
                  {
                    model: db.Doctor,
                    as: "doctor",
                    where: doctorWhere,
                    attributes: [],
                    required: requireDoctor,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    raw: true,
  });

  return {
    totalBookings: totalBookings || 0,
    totalRevenue: parseFloat(totalRevenueResult?.total) || 0,
  };
};

// Time series data - lượt khám và doanh thu theo ngày
const getTimeSeries = async ({ clinicId, specialtyId, from, to }) => {
  const scheduleDateWhere =
    from && to ? { workDate: normalizeDateRange(from, to) } : {};
  const doctorWhere = {
    ...(clinicId && { clinicId }),
    ...(specialtyId && { specialtyId }),
  };
  const requireDoctor = Object.keys(doctorWhere).length > 0;

  const fetchBookingsSeries = () =>
    db.Booking.findAll({
      attributes: [
        [fn("DATE", col("schedule.workDate")), "date"],
        [fn("COUNT", col("Booking.id")), "count"],
      ],
      where: { status: "DONE" },
      include: [
        {
          model: db.Schedule,
          as: "schedule",
          where: scheduleDateWhere,
          attributes: [],
          required: true,
          include: [
            {
              model: db.Doctor,
              as: "doctor",
              where: doctorWhere,
              attributes: [],
              required: requireDoctor,
            },
          ],
        },
      ],
      group: [fn("DATE", col("schedule.workDate"))],
      order: [[fn("DATE", col("schedule.workDate")), "ASC"]],
      subQuery: false,
      raw: true,
    });

  const fetchRevenueSeries = () =>
    db.Bill.findAll({
      attributes: [
        [fn("DATE", col("medicalRecord.booking.schedule.workDate")), "date"],
        [fn("SUM", col("Bill.total")), "revenue"],
      ],
      include: [
        {
          model: db.MedicalRecord,
          as: "medicalRecord",
          attributes: [],
          required: true,
          include: [
            {
              model: db.Booking,
              as: "booking",
              attributes: [],
              where: { status: "DONE" },
              required: true,
              include: [
                {
                  model: db.Schedule,
                  as: "schedule",
                  attributes: [],
                  where: scheduleDateWhere,
                  required: true,
                  include: [
                    {
                      model: db.Doctor,
                      as: "doctor",
                      where: doctorWhere,
                      attributes: [],
                      required: requireDoctor,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      where: { status: "PAID" },
      group: [fn("DATE", col("medicalRecord.booking.schedule.workDate"))],
      order: [
        [fn("DATE", col("medicalRecord.booking.schedule.workDate")), "ASC"],
      ],
      raw: true,
    });

  const [bookings, revenue] = await Promise.all([
    fetchBookingsSeries(),
    fetchRevenueSeries(),
  ]);

  return { bookings, revenue };
};

// Top Doctors - Thống kê theo bác sĩ
const getTopDoctors = async ({
  clinicId,
  specialtyId,
  from,
  to,
  limit = 10,
}) => {
  const scheduleDateWhere =
    from && to ? { workDate: normalizeDateRange(from, to) } : {};
  const doctorWhere = {
    ...(clinicId && { clinicId }),
    ...(specialtyId && { specialtyId }),
  };
  const requireDoctor = Object.keys(doctorWhere).length > 0;

  // Bước 1: Lấy danh sách doctorId và booking count
  const bookingData = await db.Booking.findAll({
    attributes: [
      [db.sequelize.col("schedule.doctorId"), "doctorId"],
      [fn("COUNT", col("Booking.id")), "bookingCount"],
    ],
    include: [
      {
        model: db.Schedule,
        as: "schedule",
        attributes: [],
        where: scheduleDateWhere,
        required: true,
        include: [
          {
            model: db.Doctor,
            as: "doctor",
            where: doctorWhere,
            attributes: [],
            required: requireDoctor,
          },
        ],
      },
    ],
    where: { status: "DONE" },
    group: [db.sequelize.col("schedule.doctorId")],
    subQuery: false,
    raw: true,
  });

  const doctorIds = bookingData.map((b) => b.doctorId);

  if (doctorIds.length === 0) {
    return [];
  }

  // Bước 2: Lấy thông tin doctor (user, specialty, clinic)
  const doctors = await db.Doctor.findAll({
    where: { id: doctorIds },
    attributes: ["id"],
    include: [
      {
        model: db.User,
        as: "user",
        attributes: ["fullName"],
      },
      {
        model: db.Specialty,
        as: "specialty",
        attributes: ["name"],
      },
      {
        model: db.Clinic,
        as: "clinic",
        attributes: ["name"],
      },
    ],
  });

  const doctorMap = {};
  doctors.forEach((doc) => {
    doctorMap[doc.id] = doc;
  });

  // Bước 3: Lấy revenue từ Bill cho từng doctor (Sequelize, an toàn & rõ ràng)
  const revenueRows = await db.Bill.findAll({
    attributes: [
      [db.sequelize.col("medicalRecord.booking.schedule.doctorId"), "doctorId"],
      [fn("SUM", col("Bill.total")), "revenue"],
    ],
    where: { status: "PAID" },
    include: [
      {
        model: db.MedicalRecord,
        as: "medicalRecord",
        attributes: [],
        required: true,
        include: [
          {
            model: db.Booking,
            as: "booking",
            attributes: [],
            required: true,
            include: [
              {
                model: db.Schedule,
                as: "schedule",
                attributes: [],
                where: scheduleDateWhere,
                required: true,
                include: [
                  {
                    model: db.Doctor,
                    as: "doctor",
                    attributes: [],
                    where: doctorWhere,
                    required: requireDoctor,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    group: [db.sequelize.col("medicalRecord.booking.schedule.doctorId")],
    raw: true,
  });

  const revenueMap = {};
  revenueRows.forEach((r) => {
    revenueMap[r.doctorId] = parseFloat(r.revenue) || 0;
  });

  // Bước 4: Map và sort
  const result = bookingData
    .map((booking) => {
      const doctorId = booking.doctorId;
      const doctor = doctorMap[doctorId];
      if (!doctor) return null;

      return {
        doctorId,
        doctorName: doctor.user.fullName,
        specialty: doctor.specialty.name,
        clinic: doctor.clinic.name,
        bookingCount: parseInt(booking.bookingCount) || 0,
        revenue: revenueMap[doctorId] || 0,
      };
    })
    .filter((d) => d !== null)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return result;
};

// Generic comparison stats - So sánh theo clinic hoặc specialty
const getComparisonStats = async (
  groupByField,
  nameField,
  modelName,
  from,
  to
) => {
  const groupColumn = `schedule.doctor.${groupByField}`;
  const scheduleDateWhere =
    from && to ? { workDate: normalizeDateRange(from, to) } : {};

  // Đếm lượt khám
  const bookingData = await db.Booking.findAll({
    attributes: [
      [db.sequelize.col(groupColumn), groupByField],
      [fn("COUNT", col("Booking.id")), "bookingCount"],
    ],
    include: [
      {
        model: db.Schedule,
        as: "schedule",
        attributes: [],
        where: scheduleDateWhere,
        required: true,
        include: [
          {
            model: db.Doctor,
            as: "doctor",
            attributes: [],
            required: true,
          },
        ],
      },
    ],
    where: { status: "DONE" },
    group: [db.sequelize.col(groupColumn)],
    subQuery: false,
    raw: true,
  });

  const ids = bookingData.map((item) => item[groupByField]);
  if (ids.length === 0) return [];

  // Thông tin model (Clinic hoặc Specialty)
  const Model = db[modelName];
  const items = await Model.findAll({
    where: { id: ids },
    attributes: ["id", "name"],
  });
  const itemMap = items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  // Doanh thu theo thời gian
  const revenueRows = await db.Bill.findAll({
    attributes: [
      [db.sequelize.col(`medicalRecord.booking.${groupColumn}`), groupByField],
      [fn("SUM", col("Bill.total")), "revenue"],
    ],
    where: { status: "PAID" },
    include: [
      {
        model: db.MedicalRecord,
        as: "medicalRecord",
        attributes: [],
        required: true,
        include: [
          {
            model: db.Booking,
            as: "booking",
            attributes: [],
            where: { status: "DONE" },
            required: true,
            include: [
              {
                model: db.Schedule,
                as: "schedule",
                attributes: [],
                where: scheduleDateWhere,
                required: true,
                include: [
                  {
                    model: db.Doctor,
                    as: "doctor",
                    attributes: [],
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    group: [db.sequelize.col(`medicalRecord.booking.${groupColumn}`)],
    raw: true,
  });

  const revenueMap = revenueRows.reduce((acc, r) => {
    acc[r[groupByField]] = parseFloat(r.revenue) || 0;
    return acc;
  }, {});

  return bookingData
    .map((item) => {
      const info = itemMap[item[groupByField]];
      if (!info) return null;
      return {
        [`${groupByField}`]: item[groupByField],
        [nameField]: info.name,
        bookingCount: parseInt(item.bookingCount) || 0,
        revenue: revenueMap[item[groupByField]] || 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.revenue - a.revenue);
};

// Clinics comparison - So sánh các cơ sở
const getClinicsStats = async ({ from, to }) => {
  return getComparisonStats("clinicId", "clinicName", "Clinic", from, to);
};

// Specialties comparison - So sánh các chuyên khoa
const getSpecialtiesStats = async ({ from, to }) => {
  return getComparisonStats(
    "specialtyId",
    "specialtyName",
    "Specialty",
    from,
    to
  );
};

// Get booking details list with filters
const getBookingDetails = async ({
  clinicId,
  specialtyId,
  from,
  to,
  limit = 100,
  offset = 0,
}) => {
  const scheduleDateWhere =
    from && to ? { workDate: normalizeDateRange(from, to) } : {};
  const doctorWhere = {
    ...(clinicId && { clinicId }),
    ...(specialtyId && { specialtyId }),
  };
  const requireDoctor = Object.keys(doctorWhere).length > 0;

  const bookings = await db.Booking.findAll({
    where: { status: "DONE" },
    include: [
      {
        model: db.Schedule,
        as: "schedule",
        where: scheduleDateWhere,
        required: true,
        include: [
          {
            model: db.Doctor,
            as: "doctor",
            where: doctorWhere,
            required: requireDoctor,
            include: [
              {
                model: db.User,
                as: "user",
                attributes: ["fullName"],
              },
              {
                model: db.Specialty,
                as: "specialty",
                attributes: ["name"],
              },
              {
                model: db.Clinic,
                as: "clinic",
                attributes: ["name"],
              },
            ],
          },
          {
            model: db.TimeSlot,
            as: "timeSlot",
            attributes: ["startTime", "endTime", "label"],
          },
        ],
      },
      {
        model: db.Patient,
        as: "patient",
        required: true,
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["fullName", "phoneNumber"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  // Get bill info for each booking
  const bookingIds = bookings.map((b) => b.id);

  let billMap = {};
  if (bookingIds.length > 0) {
    const bills = await db.Bill.findAll({
      where: { status: "PAID" },
      include: [
        {
          model: db.MedicalRecord,
          as: "medicalRecord",
          where: { bookingId: { [Op.in]: bookingIds } },
          attributes: ["bookingId"],
          required: true,
        },
      ],
      attributes: ["id", "total"],
    });

    bills.forEach((bill) => {
      billMap[bill.medicalRecord.bookingId] = bill.total;
    });
  }

  const result = bookings.map((booking) => ({
    id: booking.id,
    patientName: booking.patient.user.fullName,
    patientPhone: booking.patient.user.phoneNumber,
    doctorName: booking.schedule.doctor.user.fullName,
    specialty: booking.schedule.doctor.specialty.name,
    clinic: booking.schedule.doctor.clinic.name,
    workDate: booking.schedule.workDate,
    timeSlot: booking.schedule.timeSlot.label,
    revenue: parseFloat(billMap[booking.id]) || 0,
    createdAt: booking.createdAt,
  }));

  const total = await db.Booking.count({
    where: { status: "DONE" },
    include: [
      {
        model: db.Schedule,
        as: "schedule",
        where: scheduleDateWhere,
        attributes: [],
        required: true,
        include: [
          {
            model: db.Doctor,
            as: "doctor",
            where: doctorWhere,
            attributes: [],
            required: requireDoctor,
          },
        ],
      },
    ],
  });

  return { bookings: result, total };
};

module.exports = {
  getDashboardKPI,
  getTimeSeries,
  getTopDoctors,
  getClinicsStats,
  getSpecialtiesStats,
  getBookingDetails,
};
