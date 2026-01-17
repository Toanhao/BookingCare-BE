const statisticService = require("../services/statisticService");

const getDashboardKPI = async (req, res) => {
  try {
    const { clinicId, specialtyId, from, to } = req.query;

    const data = await statisticService.getDashboardKPI({
      clinicId: clinicId ? parseInt(clinicId) : undefined,
      specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
      from,
      to,
    });

    return res.status(200).json({
      errCode: 0,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      errCode: 1,
      errMessage: error.message,
    });
  }
};

const getTimeSeries = async (req, res) => {
  try {
    const { clinicId, specialtyId, from, to } = req.query;

    const data = await statisticService.getTimeSeries({
      clinicId: clinicId ? parseInt(clinicId) : undefined,
      specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
      from,
      to,
    });

    return res.status(200).json({
      errCode: 0,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      errCode: 1,
      errMessage: error.message,
    });
  }
};

const getTopDoctors = async (req, res) => {
  try {
    const { clinicId, specialtyId, limit, from, to } = req.query;

    const data = await statisticService.getTopDoctors({
      clinicId: clinicId ? parseInt(clinicId) : undefined,
      specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
      limit: limit ? parseInt(limit) : 10,
      from,
      to,
    });

    return res.status(200).json({
      errCode: 0,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      errCode: 1,
      errMessage: error.message,
    });
  }
};

const getClinicsStats = async (req, res) => {
  try {
    const { specialtyId, from, to } = req.query;

    const data = await statisticService.getClinicsStats({
      specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
      from,
      to,
    });

    return res.status(200).json({
      errCode: 0,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      errCode: 1,
      errMessage: error.message,
    });
  }
};

const getSpecialtiesStats = async (req, res) => {
  try {
    const { clinicId, from, to } = req.query;

    const data = await statisticService.getSpecialtiesStats({
      clinicId: clinicId ? parseInt(clinicId) : undefined,
      from,
      to,
    });

    return res.status(200).json({
      errCode: 0,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      errCode: 1,
      errMessage: error.message,
    });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const { clinicId, specialtyId, from, to, limit, offset } = req.query;

    const data = await statisticService.getBookingDetails({
      clinicId: clinicId ? parseInt(clinicId) : undefined,
      specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
      from,
      to,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    });

    return res.status(200).json({
      errCode: 0,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      errCode: 1,
      errMessage: error.message,
    });
  }
};

module.exports = {
  getDashboardKPI,
  getTimeSeries,
  getTopDoctors,
  getClinicsStats,
  getSpecialtiesStats,
  getBookingDetails,
};
