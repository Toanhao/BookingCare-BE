const db = require("../models/index");
const emailService = require("./emailService");

const createBill = async ({ medicalRecordId }) => {
  /* ========= 1. Validate ========= */
  if (!medicalRecordId ) {
    throw new Error("Missing required parameters");
  }

  /* ========= 2. Check medical record ========= */
  const medicalRecord = await db.MedicalRecord.findByPk(medicalRecordId);

  if (!medicalRecord) {
    throw new Error("Medical record not found");
  }

  /* ========= 3. Check đã có bill chưa ========= */
  const existedBill = await db.Bill.findOne({
    where: { medicalRecordId },
  });

  if (existedBill) {
    throw new Error("Bill already exists for this medical record");
  }

  /* ========= 4. Lấy fee của doctor ========= */
  const doctor = await db.Doctor.findByPk(medicalRecord.doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  if (!doctor.fee) {
    throw new Error("Doctor fee not set");
  }

  /* ========= 5. Tạo bill ========= */
  const bill = await db.Bill.create({
    patientId: medicalRecord.patientId,
    medicalRecordId,
    total: doctor.fee,
    status: "UNPAID",
    method: "UNDEFINED",
  });

  return bill;
};

const payBill = async ({ billId, method }) => {
  if (!billId || !method) {
    throw new Error("Missing required parameters");
  }

  const bill = await db.Bill.findByPk(billId, {
    include: [
      {
        model: db.MedicalRecord,
        as: "medicalRecord",
        include: [
          {
            model: db.Patient,
            as: "patient",
            include: [{ model: db.User, as: "user" }],
          },
          {
            model: db.Doctor,
            as: "doctor",
            include: [{ model: db.User, as: "user" }],
          },
          {
            model: db.Booking,
            as: "booking",
            include: [
              {
                model: db.Schedule,
                as: "schedule",
                include: [
                  { model: db.TimeSlot, as: "timeSlot" },
                  {
                    model: db.Doctor,
                    as: "doctor",
                    include: [{ model: db.User, as: "user" }],
                  },
                ],
              },
            ],
          },
          {
            model: db.Prescription,
            as: "prescription",
            include: [
              {
                model: db.PrescriptionItem,
                as: "items",
                include: [{ model: db.Medicine, as: "medicine" }],
              },
            ],
          },
        ],
      },
    ],
  });
  if (!bill) throw new Error("Bill not found");

  if (bill.status === "PAID") {
    throw new Error("Bill already paid");
  }

  if (method === "UNDEFINED") {
    throw new Error("Invalid payment method");
  }

  await bill.update({
    status: "PAID",
    method,
  });

  // Attempt to send prescription email (non-blocking on failures)
  try {
    const mr = bill.medicalRecord;
    const patientUser = mr?.patient?.user;
    const doctorName =
      mr?.booking?.schedule?.doctor?.user?.fullName || mr?.doctor?.user?.fullName || "Bác sĩ";
    const workDate = mr?.booking?.schedule?.workDate;
    const timeLabel = mr?.booking?.schedule?.timeSlot?.label;
    const diagnosis = mr?.diagnosis;
    const conclusion = mr?.conclusion;
    const medicalNote = mr?.note;
    const prescriptionNote = mr?.prescription?.note;
    const items = (mr?.prescription?.items || []).map((it) => ({
      name: it?.medicine?.name,
      quantity: it?.quantity,
      usage: it?.usage,
      duration: it?.duration,
    }));

    if (patientUser?.email) {
      await emailService.sendPrescriptionEmail({
        email: patientUser.email,
        patientName: patientUser.fullName,
        doctorName,
        workDate,
        timeLabel,
        diagnosis,
        conclusion,
        medicalNote,
        prescriptionNote,
        items,
      });
    }
  } catch (e) {
    // Log and proceed; email failure should not block payment
    console.error("Failed to send prescription email:", e.message);
  }

  return bill;
};

module.exports = {
  createBill,
  payBill,
};
