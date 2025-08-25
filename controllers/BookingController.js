const Booking = require("../models/BookingModel.js");
const Notification = require("../models/notificationModel.js");
const { errorHandler } = require("../middlewares/errorHandling.js");

const createBooking = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name) {
      return next(errorHandler(400, "Name is required"));
    }
    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }
    if (!phone) {
      return next(errorHandler(400, "Phone number is required"));
    }
    if (!message) {
      return next(errorHandler(400, "Message is required"));
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    // Basic phone validation
    if (!/^\+?[\d\s\-()]{10,}$/.test(phone)) {
      return next(errorHandler(400, "Invalid phone number format"));
    }

    const newBooking = new Booking({
      name,
      email,
      phone,
      message,
    });

    const savedBooking = await newBooking.save();

    // Create admin notification
    const notification = new Notification({
      title: "New Booking Request",
      message: `A new booking request has been submitted by ${name} (${email}).`,
      recipients: ["admin"],
      relatedData: { bookingId: savedBooking._id },
      type: "info",
      isRead: false,
    });

    await notification.save();

    res.status(201).json(savedBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, message, status } = req.body;

    if (!name) {
      return next(errorHandler(400, "Name is required"));
    }
    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }
    if (!phone) {
      return next(errorHandler(400, "Phone number is required"));
    }
    if (!message) {
      return next(errorHandler(400, "Message is required"));
    }

    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    // Basic phone validation
    if (!/^\+?[\d\s\-()]{10,}$/.test(phone)) {
      return next(errorHandler(400, "Invalid phone number format"));
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        message,
        status,
      },
      { new: true, runValidators: true }
    );

    // Create admin notification for status updates
    if (status && status !== existingBooking.status) {
      const notification = new Notification({
        title: "Booking Status Updated",
        message: `Booking for ${name} (${email}) has been updated to status: ${status}.`,
        recipients: ["admin"],
        relatedData: { bookingId: updatedBooking._id },
        type: "info",
        isRead: false,
      });

      await notification.save();
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.findByIdAndDelete(id);

    // Create admin notification for deletion
    const notification = new Notification({
      title: "Booking Deleted",
      message: `Booking for ${booking.name} (${booking.email}) has been deleted.`,
      recipients: ["admin"],
      relatedData: { bookingId: id },
      type: "warning",
      isRead: false,
    });

    await notification.save();

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error retrieving booking:", error);
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({});
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    next(error);
  }
};

module.exports = {
  createBooking,
  updateBooking,
  getBookingById,
  getAllBookings,
  deleteBooking,
};
