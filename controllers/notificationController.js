const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");

// Get all notifications (Admin only)
const getAllNotificationForAdmin = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark single notification as read (Admin)
const markNotificationAsReadforAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { isRead: true } },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// Mark all notifications as read (Admin)
const markAllNotificationsAsReadForAdmin = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } },
      { runValidators: true }
    );

    if (!result.acknowledged) {
      return res.status(500).json({ message: "Update operation failed" });
    }

    const updatedNotifications = await Notification.find();

    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
      notifications: updatedNotifications,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

// Delete notification (Admin)
const deleteNotificationForAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

module.exports = {
  getAllNotificationForAdmin,
  markNotificationAsReadforAdmin,
  markAllNotificationsAsReadForAdmin,
  deleteNotificationForAdmin,
};
