const handbookService = require("../services/handbookService");

const createHandbook = async (req, res) => {
  try {
    const data = await handbookService.createHandbook(req.body);
    return res.status(201).json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

const getHandbooks = async (req, res) => {
  try {
    const data = await handbookService.getHandbooks();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const getHandbookById = async (req, res) => {
  try {
    const data = await handbookService.getHandbookById(req.params.id);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

const updateHandbook = async (req, res) => {
  try {
    const data = await handbookService.updateHandbook(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

const deleteHandbook = async (req, res) => {
  try {
    await handbookService.deleteHandbook(req.params.id);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

module.exports = {
  createHandbook,
  getHandbooks,
  getHandbookById,
  updateHandbook,
  deleteHandbook,
};
