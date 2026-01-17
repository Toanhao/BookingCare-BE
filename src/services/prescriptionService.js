const db = require("../models/index");

const createPrescription = async ({ medicalRecordId, note, items }) => {
  if (!medicalRecordId) {
    throw new Error("Missing medicalRecordId");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Prescription must have at least one item");
  }

  const medicalRecord = await db.MedicalRecord.findByPk(medicalRecordId);
  if (!medicalRecord) {
    throw new Error("Medical record not found");
  }

  const existed = await db.Prescription.findOne({
    where: { medicalRecordId },
  });
  if (existed) {
    throw new Error("Prescription already exists for this medical record");
  }

  // Check medicine tồn tại
  const medicineIds = items.map((i) => i.medicineId);
  const medicines = await db.Medicine.findAll({
    where: { id: medicineIds },
  });

  if (medicines.length !== medicineIds.length) {
    throw new Error("One or more medicines not found");
  }

  return db.sequelize.transaction(async (t) => {
    // 1. Create prescription
    const prescription = await db.Prescription.create(
      {
        medicalRecordId,
        doctorId: medicalRecord.doctorId,
        note,
      },
      { transaction: t }
    );

    // 2. Create items
    const itemData = items.map((item) => ({
      prescriptionId: prescription.id,
      medicineId: item.medicineId,
      quantity: item.quantity,
      usage: item.usage,
      duration: item.duration,
    }));

    await db.PrescriptionItem.bulkCreate(itemData, { transaction: t });

    return prescription;
  });
};

module.exports = {
  createPrescription,
};
