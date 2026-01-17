const clinicService = require("../services/clinicService");

const createClinic = async (req, res) => {
  try {
    const data = await clinicService.createClinic(req.body);
    return res.status(201).json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

const getClinics = async (req, res) => {
  try {
    const data = await clinicService.getClinics();
    return res.status(200).json({ errCode: 0, data });
  } catch (e) {
    return res.status(500).json({ errCode: 1, message: e.message });
  }
};

const getClinicById = async (req, res) => {
  try {
    const data = await clinicService.getClinicById(req.params.id);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

const updateClinic = async (req, res) => {
  try {
    const data = await clinicService.updateClinic(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

const deleteClinic = async (req, res) => {
  try {
    await clinicService.deleteClinic(req.params.id);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

module.exports = {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
};
