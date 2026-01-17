const bookingService = require("../services/bookingService");

const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    return res.status(201).json(booking);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const confirmBookingByToken = async (req, res) => {
  try {
    const booking = await bookingService.confirmBookingByToken(req.query.token);

    return res.status(200).json({
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const cancelBookingByToken = async (req, res) => {
  try {
    const booking = await bookingService.cancelBookingByToken(req.query.token);

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBooking(req.body);
    return res.status(200).json({
      errorCode: 0,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getPatientBookings = async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) {
      return res.status(400).json({ message: "Missing patientId" });
    }

    const bookings = await bookingService.getBookingsByPatient(patientId);
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getDoctorBookings = async (req, res) => {
  try {
    const { doctorId, workDate, status } = req.query;
    const data = await bookingService.getBookingsForDoctor({
      doctorId,
      workDate,
      status,
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await bookingService.getBookingById(id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  confirmBookingByToken,
  cancelBookingByToken,
  cancelBooking,
  getPatientBookings,
  getDoctorBookings,
  getBookingById,
};
