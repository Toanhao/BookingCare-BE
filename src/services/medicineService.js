const db = require("../models/index");

const createMedicine = async ({ name, unit, description }) => {
  if (!name || !unit) {
    throw new Error("Missing required parameters");
  }

  const existed = await db.Medicine.findOne({ where: { name } });
  if (existed) {
    throw new Error("Medicine already exists");
  }

  return db.Medicine.create({
    name,
    unit,
    description,
  });
};

const getMedicines = async () => {
  return db.Medicine.findAll({
    order: [["name", "ASC"]],
  });
};

const getMedicineById = async (id) => {
  if (!id) throw new Error("Missing medicine id");

  const medicine = await db.Medicine.findByPk(id);
  if (!medicine) {
    throw new Error("Medicine not found");
  }

  return medicine;
};

const updateMedicine = async (id, data) => {
  if (!id) throw new Error("Missing medicine id");

  const medicine = await db.Medicine.findByPk(id);
  if (!medicine) {
    throw new Error("Medicine not found");
  }

  // Nếu đổi tên → check trùng
  if (data.name && data.name !== medicine.name) {
    const existed = await db.Medicine.findOne({
      where: { name: data.name },
    });
    if (existed) {
      throw new Error("Medicine name already exists");
    }
  }

  await medicine.update(data);
  return medicine;
};

const deleteMedicine = async (id) => {
  if (!id) throw new Error("Missing medicine id");

  const medicine = await db.Medicine.findByPk(id);
  if (!medicine) {
    throw new Error("Medicine not found");
  }

  // Không cho xoá nếu đã dùng trong đơn thuốc
  const usedCount = await db.PrescriptionItem.count({
    where: { medicineId: id },
  });

  if (usedCount > 0) {
    throw new Error("Cannot delete medicine already used in prescriptions");
  }

  await medicine.destroy();
  return true;
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
