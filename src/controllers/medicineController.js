const medicineService = require("../services/medicineService");

const createMedicine = async (req, res) => {
  try {
    const data = await medicineService.createMedicine(req.body);
    return res.status(201).json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

const getMedicines = async (req, res) => {
  try {
    const data = await medicineService.getMedicines();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const data = await medicineService.getMedicineById(req.params.id);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const data = await medicineService.updateMedicine(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    await medicineService.deleteMedicine(req.params.id);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
