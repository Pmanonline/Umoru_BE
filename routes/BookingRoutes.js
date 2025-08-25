const express = require("express");
const router = express.Router();
const {
  createBooking,
  updateBooking,
  getBookingById,
  getAllBookings,
  deleteBooking,
} = require("../controllers/BookingController");

router.post("/createBooking", createBooking);
router.put("/updateBooking/:id", updateBooking);
router.delete("/deleteBooking/:id", deleteBooking);
router.get("/getAllBookings", getAllBookings);
router.get("/getBookingById/:id", getBookingById);

module.exports = router;
