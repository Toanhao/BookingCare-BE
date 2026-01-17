const db = require("../models");

const createSpecialty = async ({ name, image, description }) => {
  if (!name) {
    throw new Error("Missing specialty name");
  }

  const existed = await db.Specialty.findOne({
    where: { name },
  });

  if (existed) {
    throw new Error("Specialty already exists");
  }

  return await db.Specialty.create({
    name,
    image,
    description,
  });
};

const getSpecialties = async () => {
  return await db.Specialty.findAll({
    order: [["name", "ASC"]],
  });
};

const getSpecialtyById = async (id) => {
  const specialty = await db.Specialty.findByPk(id, {
    include: [
      {
        model: db.Doctor,
        as: "doctors",
      },
    ],
  });

  if (!specialty) {
    throw new Error("Specialty not found");
  }

  return specialty;
};

const updateSpecialty = async (id, data) => {
  const specialty = await db.Specialty.findByPk(id);

  if (!specialty) {
    throw new Error("Specialty not found");
  }

  if (data.name && data.name !== specialty.name) {
    const existed = await db.Specialty.findOne({
      where: { name: data.name },
    });

    if (existed) {
      throw new Error("Specialty name already exists");
    }
  }

  await specialty.update(data);
  return specialty;
};

const deleteSpecialty = async (id) => {
  const specialty = await db.Specialty.findByPk(id);

  if (!specialty) {
    throw new Error("Specialty not found");
  }

  const doctorCount = await db.Doctor.count({
    where: { specialtyId: id },
  });

  if (doctorCount > 0) {
    throw new Error("Cannot delete specialty that has doctors");
  }

  await specialty.destroy();
  return true;
};

module.exports = {
  createSpecialty,
  getSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
};
