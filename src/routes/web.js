import express from "express";
import userController from "../controllers/userController.js";
import doctorController from "../controllers/doctorController.js";
import specialtyController from "../controllers/specialtyController";
import clinicController from "../controllers/clinicController";
import handbookController from "../controllers/handbookController";
import medicineController from "../controllers/medicineController.js";
import bookingController from "../controllers/bookingController.js";
import scheduleController from "../controllers/scheduleController.js";
import timeSlotController from "../controllers/timeSlotController.js";
import prescriptionController from "../controllers/prescriptionController.js";
import medicalRecordController from "../controllers/medicalRecordController.js";
import billController from "../controllers/billController.js";
import statisticController from "../controllers/statisticController.js";
import chatController from "../controllers/chatController.js";

const verifyToken = require("../middlewares/verifyToken.js");
const requireRole = require("../middlewares/rbacMiddleware.js");

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", (req, res) => {
    return res.send("Hello World!");
  });

  // ========== USER ROUTES ==========
  router.post("/api/users/register", userController.registerUser);
  router.post("/api/users/login", userController.loginUser);
  router.get("/api/users/profile", verifyToken, userController.getUserProfile);
  router.post("/api/users/refresh-token", userController.refreshAccessToken);
  router.post("/api/users/logout", verifyToken, userController.logoutUser);
  router.post("/api/users/create", verifyToken, requireRole("ADMIN"), userController.createUser);
  router.get("/api/users", verifyToken, requireRole("ADMIN"), userController.getUsers);
  router.get("/api/users/doctors", verifyToken, requireRole("ADMIN"), userController.getDoctorUsers);
  router.delete("/api/users/:id", verifyToken, requireRole("ADMIN"), userController.deleteUser);
  router.put("/api/users/:id", verifyToken, requireRole("ADMIN"), userController.updateUser);

  // doctor
  router.post("/api/doctors", verifyToken, requireRole("ADMIN"), doctorController.createDoctor);
  router.patch("/api/doctors/:id", verifyToken, requireRole("ADMIN"), doctorController.updateDoctor);
  router.get("/api/doctors", doctorController.getDoctors);
  router.get("/api/doctors/:id", doctorController.getDoctorById);

  // ========== SPECIALTY ROUTES ==========
  router.post("/api/specialties", verifyToken, requireRole("ADMIN"), specialtyController.createSpecialty);
  router.get("/api/specialties", specialtyController.getSpecialties);
  router.get("/api/specialties/:id", specialtyController.getSpecialtyById);
  router.patch("/api/specialties/:id", verifyToken, requireRole("ADMIN"), specialtyController.updateSpecialty);
  router.delete("/api/specialties/:id", verifyToken, requireRole("ADMIN"), specialtyController.deleteSpecialty);

  // ========== CLINIC ROUTES ==========
  router.post("/api/clinics", verifyToken, requireRole("ADMIN"), clinicController.createClinic);
  router.get("/api/clinics", clinicController.getClinics);
  router.get("/api/clinics/:id", clinicController.getClinicById);
  router.patch("/api/clinics/:id", verifyToken, requireRole("ADMIN"), clinicController.updateClinic);
  router.delete("/api/clinics/:id", verifyToken, requireRole("ADMIN"), clinicController.deleteClinic);

  // ========== HANDBOOK ROUTES ==========
  router.post("/api/handbooks", verifyToken, requireRole("DOCTOR"), handbookController.createHandbook);
  router.get("/api/handbooks", handbookController.getHandbooks);
  router.get("/api/handbooks/:id", handbookController.getHandbookById);
  router.patch("/api/handbooks/:id", verifyToken, requireRole("DOCTOR"), handbookController.updateHandbook);
  router.delete("/api/handbooks/:id", verifyToken, requireRole("DOCTOR"), handbookController.deleteHandbook);

  // ========== MEDICINE ROUTES ==========
  router.post("/api/medicines", verifyToken, requireRole("ADMIN"), medicineController.createMedicine);
  router.get("/api/medicines", medicineController.getMedicines);
  router.get("/api/medicines/:id", medicineController.getMedicineById);
  router.patch("/api/medicines/:id", verifyToken, requireRole("ADMIN"), medicineController.updateMedicine);
  router.delete("/api/medicines/:id", verifyToken, requireRole("ADMIN"), medicineController.deleteMedicine);

  // ========== TIME SLOT ROUTES ==========
  router.post("/api/time-slots", verifyToken, requireRole("ADMIN"), timeSlotController.createTimeSlot);
  router.get("/api/time-slots", timeSlotController.getTimeSlots);
  router.get("/api/time-slots/:id", timeSlotController.getTimeSlotById);
  router.patch("/api/time-slots/:id", verifyToken, requireRole("ADMIN"), timeSlotController.updateTimeSlot);
  router.delete("/api/time-slots/:id", verifyToken, requireRole("ADMIN"), timeSlotController.deleteTimeSlot);

  // ========== SCHEDULE ROUTES ==========
  router.post("/api/schedules/bulk", verifyToken, requireRole("DOCTOR", "ADMIN"), scheduleController.createScheduleBulk);
  router.get("/api/schedules", scheduleController.getSchedules);
  router.patch("/api/schedules/:id", verifyToken, requireRole("DOCTOR", "ADMIN"), scheduleController.updateSchedule);

  // ========== BOOKING ROUTES ==========
  router.post("/api/bookings", verifyToken, bookingController.createBooking);
  router.get("/api/bookings/confirm", bookingController.confirmBookingByToken);
  router.get("/api/bookings/cancel", bookingController.cancelBookingByToken);
  router.get("/api/bookings/:id", verifyToken, bookingController.getBookingById);
  

  router.get("/api/patient/bookings", verifyToken, requireRole("PATIENT"), bookingController.getPatientBookings);
  router.patch("/api/patient/bookings/cancel", verifyToken, requireRole("PATIENT"), bookingController.cancelBooking);
  router.get("/api/doctor/bookings", verifyToken, requireRole("DOCTOR"), bookingController.getDoctorBookings);

  // ========== MEDICAL RECORD ROUTES ==========
  router.post("/api/medical-records", verifyToken, requireRole("DOCTOR"), medicalRecordController.createMedicalRecord);

  // ========== PRESCRIPTION ROUTES ==========
  router.post("/api/prescriptions", verifyToken, requireRole("DOCTOR"), prescriptionController.createPrescription);

  // ========== BILL ROUTES ==========
  router.post("/api/bills", verifyToken, requireRole("ADMIN", "DOCTOR"), billController.createBill);
  router.patch("/api/bills/pay", verifyToken, requireRole("PATIENT"), billController.payBill);

  // ========== STATISTIC ROUTES ==========
  router.get("/api/statistics/dashboard", verifyToken, requireRole("ADMIN"), statisticController.getDashboardKPI);
  router.get("/api/statistics/time-series", verifyToken, requireRole("ADMIN"), statisticController.getTimeSeries);
  router.get("/api/statistics/doctors", verifyToken, requireRole("ADMIN"), statisticController.getTopDoctors);
  router.get("/api/statistics/clinics", verifyToken, requireRole("ADMIN"), statisticController.getClinicsStats);
  router.get("/api/statistics/specialties", verifyToken, requireRole("ADMIN"), statisticController.getSpecialtiesStats);
  router.get("/api/statistics/bookings", verifyToken, requireRole("ADMIN"), statisticController.getBookingDetails);

  // ========== CHAT ROUTES ==========
  router.post("/api/chat-booking", verifyToken, chatController.chatBooking);

  return app.use("/", router);
};

export default initWebRoutes;
