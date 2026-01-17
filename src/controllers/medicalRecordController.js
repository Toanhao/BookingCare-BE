const medicalRecordService = require("../services/medicalRecordService");

const createMedicalRecord = async (req, res) => {
  try {
    const data = await medicalRecordService.createMedicalRecord(req.body);

    return res.status(201).json({
      errCode: 0,
      message: "Medical record created successfully",
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
  createMedicalRecord,
};
