const timeSlotService = require("../services/timeSlotService");

// POST /timeslots
const createTimeSlot = async (req, res) => {
  try {
    const slot = await timeSlotService.createTimeSlot(req.body);
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /timeslots
const getTimeSlots = async (req, res) => {
  try {
    const slots = await timeSlotService.getTimeSlots();
    res.json(slots);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /timeslots/:id
const getTimeSlotById = async (req, res) => {
  try {
    const slot = await timeSlotService.getTimeSlotById(req.params.id);
    res.json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /timeslots/:id
const updateTimeSlot = async (req, res) => {
  try {
    const slot = await timeSlotService.updateTimeSlot(req.params.id, req.body);
    res.json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /timeslots/:id
const deleteTimeSlot = async (req, res) => {
  try {
    await timeSlotService.deleteTimeSlot(req.params.id);
    res.json({ message: "TimeSlot deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createTimeSlot,
  getTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot,
};
