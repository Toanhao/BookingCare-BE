const db = require("../models/index");

const createClinic = async ({ name, address, image, description }) => {
  if (!name || !address) {
    throw new Error("Missing required parameters");
  }

  const existed = await db.Clinic.findOne({
    where: {
      name,
      address,
    },
  });
  if (existed) {
    throw new Error("Clinic already exists");
  }

  return db.Clinic.create({
    name,
    address,
    image,
    description,
  });
};

const getClinics = async () => {
  return db.Clinic.findAll({
    order: [["name", "ASC"]],
  });
};

const getClinicById = async (id) => {
  if (!id) throw new Error("Missing clinic id");

  const clinic = await db.Clinic.findByPk(id, {
    include: [
      {
        model: db.Doctor,
        as: "doctors",
        attributes: ["id"],
      },
    ],
  });

  if (!clinic) throw new Error("Clinic not found");

  return clinic;
};

const updateClinic = async (id, data) => {
  if (!id) throw new Error("Missing clinic id");

  const clinic = await db.Clinic.findByPk(id);
  if (!clinic) {
    throw new Error("Clinic not found");
  }

  if (
    (data.name && data.name !== clinic.name) ||
    (data.address && data.address !== clinic.address)
  ) {
    const existed = await db.Clinic.findOne({
      where: {
        name: data.name || clinic.name,
        address: data.address || clinic.address,
      },
    });

    if (existed && existed.id !== clinic.id) {
      throw new Error("Clinic with same name and address already exists");
    }
  }

  await clinic.update(data);
  return clinic;
};

const deleteClinic = async (id) => {
  if (!id) throw new Error("Missing clinic id");

  const clinic = await db.Clinic.findByPk(id);
  if (!clinic) {
    throw new Error("Clinic not found");
  }

  // Không cho xoá nếu còn doctor
  const doctorCount = await db.Doctor.count({
    where: { clinicId: id },
  });

  if (doctorCount > 0) {
    throw new Error("Cannot delete clinic with existing doctors");
  }

  await clinic.destroy();
  return true;
};

module.exports = {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
};
