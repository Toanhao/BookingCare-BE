const prescriptionService = require("../services/prescriptionService");

const createPrescription = async (req, res) => {
  try {
    const data = await prescriptionService.createPrescription(req.body);

    return res.status(201).json({
      errCode: 0,
      message: "Prescription created successfully",
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
  createPrescription,
};
