const db = require("../models");

const createMedicalRecord = async ({
  bookingId,
  diagnosis,
  conclusion,
  note,
}) => {
  /* ========= 1. Validate input ========= */
  if (!bookingId || !diagnosis || !conclusion) {
    throw new Error("Missing required parameters");
  }

  /* ========= 2. Check booking ========= */
  const booking = await db.Booking.findByPk(bookingId, {
    include: [
      {
        model: db.Patient,
        as: "patient",
      },
      {
        model: db.Schedule,
        as: "schedule",
        include: [
          {
            model: db.Doctor,
            as: "doctor",
          },
        ],
      },
    ],
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "CONFIRMED") {
    throw new Error("Booking is not confirmed");
  }

  /* ========= 3. Check đã có medical record chưa ========= */
  const existedRecord = await db.MedicalRecord.findOne({
    where: { bookingId },
  });

  if (existedRecord) {
    throw new Error("Medical record already exists for this booking");
  }

  /* ========= 4. Tạo medical record ========= */
  const medicalRecord = await db.MedicalRecord.create({
    bookingId,
    patientId: booking.patientId,
    doctorId: booking.schedule.doctor.id,
    diagnosis,
    conclusion,
    note,
  });

  /* ========= 5. (Optional) update booking status ========= */
  booking.status = "DONE";
  await booking.save();

  return medicalRecord;
};

module.exports = {
  createMedicalRecord,
};
