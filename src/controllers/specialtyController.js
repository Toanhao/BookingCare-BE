const specialtyService = require("../services/specialtyService");

const createSpecialty = async (req, res) => {
  try {
    const specialty = await specialtyService.createSpecialty(req.body);
    return res.status(201).json({ success: true, data: specialty });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getSpecialties = async (req, res) => {
  try {
    const specialties = await specialtyService.getSpecialties();
    return res.json({ errCode: 0, data: specialties });
  } catch (error) {
    return res.status(500).json({ errCode: 1, message: error.message });
  }
};

const getSpecialtyById = async (req, res) => {
  try {
    const specialty = await specialtyService.getSpecialtyById(req.params.id);
    return res.json({ success: true, data: specialty });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const updateSpecialty = async (req, res) => {
  try {
    const specialty = await specialtyService.updateSpecialty(
      req.params.id,
      req.body
    );
    return res.json({ success: true, data: specialty });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteSpecialty = async (req, res) => {
  try {
    await specialtyService.deleteSpecialty(req.params.id);
    return res.json({
      success: true,
      message: "Specialty deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSpecialty,
  getSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
};
