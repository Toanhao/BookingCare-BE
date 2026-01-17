const doctorService = require("../services/doctorService");

const createDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    res.json({ errCode: 0, data: doctor });
  } catch (e) {
    res.status(400).json({ errCode: 1, errMessage: e.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getDoctors(req.query);
    res.json({ errCode: 0, data: doctors });
  } catch (e) {
    res.status(400).json({ errCode: 1, errMessage: e.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res.json({ errCode: 0, data: doctor });
  } catch (e) {
    res.status(400).json({ errCode: 1, errMessage: e.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    res.json({ errCode: 0, data: doctor });
  } catch (e) {
    res.status(400).json({ errCode: 1, errMessage: e.message });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
};
