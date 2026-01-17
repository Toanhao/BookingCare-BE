const scheduleService = require("../services/scheduleService");

const createScheduleBulk = async (req, res) => {
  try {
    const schedules = await scheduleService.createScheduleBulk(req.body);
    return res.status(201).json(schedules);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET /schedules?doctorId=1&workDate=2025-12-16
const getSchedules = async (req, res) => {
  try {
    const schedules = await scheduleService.getSchedules(req.query);
    res.json(schedules);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /schedules/:id
const updateSchedule = async (req, res) => {
  try {
    const schedule = await scheduleService.updateSchedule(
      req.params.id,
      req.body
    );
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createScheduleBulk,
  getSchedules,
  updateSchedule,
};
