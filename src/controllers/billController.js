const billService = require("../services/billService");

const createBill = async (req, res) => {
  try {
    const data = await billService.createBill(req.body);

    return res.status(201).json({
      errCode: 0,
      message: "Bill created successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      errCode: 1,
      errMessage: error.message,
    });
  }
};

const payBill = async (req, res) => {
  try {
    const data = await billService.payBill(req.body);
    return res.json({
      errCode: 0,
      message: "Payment successful",
      data,
    });
  } catch (e) {
    return res.status(400).json({
      errCode: 1,
      errMessage: e.message,
    });
  }
};

module.exports = {
  createBill,
  payBill,
};
