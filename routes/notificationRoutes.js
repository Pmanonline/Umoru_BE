const express = require("express");
const router = express.Router();
const {
  getAllNotificationForAdmin,
  markNotificationAsReadforAdmin,
  markAllNotificationsAsReadForAdmin,
  deleteNotificationForAdmin,
} = require("../controllers/notificationController");

// Admin-only Notification routes
router.get(
  "/notifications/getAllNotificationForAdmin",

  getAllNotificationForAdmin
);

router.patch(
  "/notifications/markNotificationAsReadforAdmin/:id",

  markNotificationAsReadforAdmin
);

router.patch(
  "/notifications/markAllNotificationsAsReadForAdmin",

  markAllNotificationsAsReadForAdmin
);

router.delete(
  "/notifications/deleteNotificationForAdmin/:id",

  deleteNotificationForAdmin
);

module.exports = router;
