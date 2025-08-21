// const nodemailer = require("nodemailer");
// const cron = require("node-cron");
// const Event = require("../models/eventModel");
// const EventRegistration = require("../models/registerEventModel");

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// const generateEventDetailsRows = (data) => {
//   const fieldMappings = {
//     fullName: {
//       label: "Attendee Name",
//       value: data.fullName,
//       show: Boolean(data.fullName),
//     },
//     eventTitle: {
//       label: "Event Title",
//       value: data.eventTitle,
//       show: Boolean(data.eventTitle),
//     },
//     eventCategory: {
//       label: "Event Type",
//       value: data.eventCategory,
//       show: Boolean(data.eventCategory),
//     },
//     eventDate: {
//       label: "Event Date",
//       value: data.eventDate
//         ? new Date(data.eventDate).toLocaleDateString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           })
//         : null,
//       show: Boolean(data.eventDate),
//     },
//     duration: {
//       label: "Duration",
//       value: data.duration ? `${data.duration} minutes` : null,
//       show: Boolean(data.duration),
//     },
//     venue: {
//       label: "Venue",
//       value: data.venue,
//       show: Boolean(data.venue),
//     },
//     meetingId: {
//       label: "Meeting ID",
//       value: data.meetingId,
//       show: Boolean(data.meetingId),
//     },
//     passcode: {
//       label: "Passcode",
//       value: data.passcode,
//       show: Boolean(data.passcode),
//     },
//     meetingLink: {
//       label: "Meeting Link",
//       value: `<a href="${data.meetingLink}" style="color: #F97316; text-decoration: none;">Join Meeting</a>`,
//       show: Boolean(data.meetingLink),
//     },
//   };

//   return Object.entries(fieldMappings)
//     .filter(([_, field]) => field.show)
//     .map(
//       ([_, field]) => `
//       <tr>
//         <td style="padding: 12px 15px; width: 140px; border-bottom: 1px solid #E5E7EB;">
//           <strong style="color: #1E293B;">${field.label}:</strong>
//         </td>
//         <td style="padding: 12px 15px; border-bottom: 1px solid #E5E7EB;">
//           ${field.value}
//         </td>
//       </tr>
//     `
//     )
//     .join("");
// };

// const generateEmailTemplate = (data) => {
//   const eventDetailsRows = generateEventDetailsRows(data);

//   const joinButtonHtml = data.meetingLink
//     ? `
//     <div style="text-align: center; margin-top: 30px;">
//       <a href="${data.meetingLink}"
//          style="display: inline-block; background-color: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
//          Join Meeting
//       </a>
//     </div>
//   `
//     : "";

//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Event Registration Confirmation</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB; -webkit-font-smoothing: antialiased;">
//       <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
//         <!-- Header -->
//         <div style="background-color: #1E293B; padding: 20px; text-align: center;">
//           <img src="https://via.placeholder.com/200x70" alt="Segun Umoru Logo" width="200" height="70" style="display: block; margin: 0 auto;">
//         </div>

//         <!-- Save the Date Section -->
//         <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #F97316, #FACC15);">
//           <div style="width: 180px; height: 180px; margin: 0 auto; border: 8px solid #FFFFFF; border-radius: 50%; background-color: #FFFFFF; display: flex; align-items: center; justify-content: center;">
//             <div style="font-size: 22px; line-height: 1.2; color: #1E293B; font-weight: bold; text-transform: uppercase;">
//               Save the Date
//             </div>
//           </div>
//         </div>

//         <!-- Confirmation Message -->
//         <div style="text-align: center; padding: 30px 20px; background-color: #F9FAFB;">
//           <p style="color: #64748B; font-size: 16px; margin: 0;">Thank you for registering for our upcoming event!</p>
//         </div>

//         <!-- Event Details -->
//         ${
//           eventDetailsRows
//             ? `
//         <div style="padding: 0 20px 30px;">
//           <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; border: 1px solid #E5E7EB;">
//             <h2 style="color: #F97316; font-size: 20px; margin: 0 0 20px 0; text-align: center; font-weight: 700;">Registration Details</h2>
//             <table cellpadding="0" cellspacing="0" style="width: 100%; color: #64748B;">
//               ${eventDetailsRows}
//             </table>
//             ${joinButtonHtml}
//           </div>
//         </div>
//         `
//             : ""
//         }

//         <!-- Additional Information -->
//         <div style="padding: 0 30px 30px; color: #1E293B;">
//           <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
//             We’re excited to have you join us! Please add this event to your calendar.
//           </p>
//           <p style="font-size: 14px; line-height: 1.6;">
//             For any questions, contact our support team at
//             <a href="mailto:support@segunumoru.com" style="color: #F97316; text-decoration: none;">support@segunumoru.com</a>
//           </p>
//         </div>

//         <!-- Footer -->
//         <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
//           <p style="color: #64748B; font-size: 12px; margin: 0;">© 2025 Segun Umoru. All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// const sendEventConfirmationEmail = async (data) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: data.email,
//     subject: `Registration Confirmed: ${data.eventTitle}`,
//     html: generateEmailTemplate(data),
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (error) {
//     console.error("Error sending event registration email:", error);
//     throw new Error("Failed to send event registration email");
//   }
// };

// // REMINDER FUNCTIONS
// const sentReminders = new Set();

// const getReminderKey = (email, eventId, reminderType) => {
//   return `${email}-${eventId}-${reminderType}-${new Date().toDateString()}`;
// };

// const generate24HourReminderTemplate = (data) => {
//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Event Reminder - 24 Hours to Go!</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
//       <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
//         <!-- Header -->
//         <div style="background-color: #1E293B; padding: 20px; text-align: center;">
//           <img src="https://via.placeholder.com/200x70" alt="Segun Umoru Logo" width="200" height="70" style="display: block; margin: 0 auto;">
//         </div>

//         <!-- Reminder Banner -->
//         <div style="background: linear-gradient(135deg, #F97316, #FACC15); padding: 30px; text-align: center; color: #1E293B;">
//           <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Your Event Starts in 24 Hours!</h1>
//         </div>

//         <!-- Event Details -->
//         <div style="padding: 30px;">
//           <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; border: 1px solid #E5E7EB;">
//             <h2 style="color: #F97316; margin-top: 0; font-size: 18px; font-weight: 700;">${
//               data.eventTitle
//             }</h2>
//             <table style="width: 100%; border-collapse: collapse; color: #64748B;">
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   <strong>Date & Time:</strong>
//                 </td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   ${new Date(data.eventDate).toLocaleString()}
//                 </td>
//               </tr>
//               ${
//                 data.venue
//                   ? `
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   <strong>Venue:</strong>
//                 </td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   ${data.venue}
//                 </td>
//               </tr>
//               `
//                   : ""
//               }
//               ${
//                 data.meetingLink
//                   ? `
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   <strong>Meeting Link:</strong>
//                 </td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   <a href="${data.meetingLink}" style="color: #F97316;">Join Meeting</a>
//                 </td>
//               </tr>
//               `
//                   : ""
//               }
//             </table>

//             ${
//               data.meetingLink
//                 ? `
//             <div style="text-align: center; margin-top: 20px;">
//               <a href="${data.meetingLink}"
//                  style="display: inline-block; background-color: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
//                 Join Event
//               </a>
//             </div>
//             `
//                 : ""
//             }
//           </div>
//         </div>

//         <!-- Footer -->
//         <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
//           <p style="color: #64748B; font-size: 12px; margin: 0;">© 2025 Segun Umoru. All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// const generate1HourReminderTemplate = (data) => {
//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Event Starts in 1 Hour!</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
//       <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
//         <!-- Header -->
//         <div style="background-color: #1E293B; padding: 20px; text-align: center;">
//           <img src="https://via.placeholder.com/200x70" alt="Segun Umoru Logo" width="200" height="70" style="display: block; margin: 0 auto;">
//         </div>

//         <!-- Urgent Reminder Banner -->
//         <div style="background: linear-gradient(135deg, #F97316, #FACC15); padding: 30px; text-align: center; color: #1E293B;">
//           <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Your Event Starts in 1 Hour!</h1>
//         </div>

//         <!-- Event Details -->
//         <div style="padding: 30px;">
//           <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; border: 1px solid #E5E7EB;">
//             <h2 style="color: #F97316; margin-top: 0; font-size: 18px; font-weight: 700;">${
//               data.eventTitle
//             }</h2>
//             <table style="width: 100%; border-collapse: collapse; color: #64748B;">
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   <strong>Date & Time:</strong>
//                 </td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   ${new Date(data.eventDate).toLocaleString()}
//                 </td>
//               </tr>
//               ${
//                 data.venue
//                   ? `
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   <strong>Venue:</strong>
//                 </td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   ${data.venue}
//                 </td>
//               </tr>
//               `
//                   : ""
//               }
//               ${
//                 data.meetingLink
//                   ? `
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   <strong>Meeting Link:</strong>
//                 </td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
//                   <a href="${data.meetingLink}" style="color: #F97316;">Join Meeting</a>
//                 </td>
//               </tr>
//               `
//                   : ""
//               }
//             </table>

//             ${
//               data.meetingLink
//                 ? `
//             <div style="text-align: center; margin-top: 20px;">
//               <a href="${data.meetingLink}"
//                  style="display: inline-block; background-color: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
//                 Join Now
//               </a>
//             </div>
//             `
//                 : ""
//             }
//           </div>
//         </div>

//         <!-- Footer -->
//         <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
//           <p style="color: #64748B; font-size: 12px; margin: 0;">© 2025 Segun Umoru. All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// const sendReminderEmail = async (registration, event, template) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: registration.email,
//     subject: `Reminder: ${event.title} - Starting Soon!`,
//     html: template({
//       eventTitle: event.title,
//       eventDate: event.date,
//       venue: event.venue,
//       meetingLink: event.meetingLink,
//       meetingId: event.meetingId,
//       passcode: event.passcode,
//     }),
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Reminder email sent to ${registration.email}`);
//   } catch (error) {
//     console.error(
//       `Failed to send reminder email to ${registration.email}:`,
//       error
//     );
//   }
// };

// const checkAndSendReminders = async () => {
//   try {
//     const now = new Date();
//     console.log("Checking reminders at:", now);

//     for (const key of sentReminders) {
//       const [email, eventId, reminderType, dateStr] = key.split("-");
//       const reminderDate = new Date(dateStr);
//       if (now - reminderDate > 24 * 60 * 60 * 1000) {
//         sentReminders.delete(key);
//       }
//     }

//     const upcomingEvents = await Event.find({
//       date: {
//         $gt: now,
//         $lt: new Date(now.getTime() + 25 * 60 * 60 * 1000),
//       },
//     });

//     console.log(`Found ${upcomingEvents.length} upcoming events`);

//     for (const event of upcomingEvents) {
//       const registrations = await EventRegistration.find({ slug: event.slug });
//       console.log(
//         `Found ${registrations.length} registrations for event: ${event.title}`
//       );

//       const eventTime = new Date(event.date);
//       const hoursUntilEvent = (eventTime - now) / (1000 * 60 * 60);
//       console.log(`Hours until event: ${hoursUntilEvent}`);

//       for (const registration of registrations) {
//         if (hoursUntilEvent <= 24.5 && hoursUntilEvent > 23.5) {
//           const reminderKey = getReminderKey(
//             registration.email,
//             event._id,
//             "24h"
//           );
//           if (!sentReminders.has(reminderKey)) {
//             console.log(`Sending 24hr reminder to ${registration.email}`);
//             await sendReminderEmail(
//               registration,
//               event,
//               generate24HourReminderTemplate
//             );
//             sentReminders.add(reminderKey);
//           }
//         }

//         if (hoursUntilEvent <= 1.5 && hoursUntilEvent > 0.5) {
//           const reminderKey = getReminderKey(
//             registration.email,
//             event._id,
//             "1h"
//           );
//           if (!sentReminders.has(reminderKey)) {
//             console.log(`Sending 1hr reminder to ${registration.email}`);
//             await sendReminderEmail(
//               registration,
//               event,
//               generate1HourReminderTemplate
//             );
//             sentReminders.add(reminderKey);
//           }
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error in reminder check:", error);
//     console.error(error.stack);
//   }
// };

// const scheduleReminders = () => {
//   console.log("Initializing reminder scheduler...");

//   cron.schedule("*/10 * * * *", () => {
//     console.log("Running scheduled reminder check...");
//     checkAndSendReminders().catch((err) => {
//       console.error("Failed to run reminder check:", err);
//     });
//   });

//   checkAndSendReminders().catch((err) => {
//     console.error("Failed to run initial reminder check:", err);
//   });
// };

// const getRemindersStatus = () => {
//   return {
//     totalTrackedReminders: sentReminders.size,
//     reminders: Array.from(sentReminders),
//   };
// };

// const triggerReminderCheck = async () => {
//   console.log("Manually triggering reminder check...");
//   await checkAndSendReminders();
// };

// module.exports = {
//   sendEventConfirmationEmail,
//   scheduleReminders,
//   checkAndSendReminders,
//   triggerReminderCheck,
//   getRemindersStatus,
// };
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const Event = require("../models/eventModel");
const EventRegistration = require("../models/registerEventModel");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateEventDetailsRows = (data) => {
  const fieldMappings = {
    fullName: {
      label: "Attendee Name",
      value: data.fullName,
      show: Boolean(data.fullName),
    },
    eventTitle: {
      label: "Event Title",
      value: data.eventTitle,
      show: Boolean(data.eventTitle),
    },
    eventCategory: {
      label: "Event Type",
      value: data.eventCategory,
      show: Boolean(data.eventCategory),
    },
    eventDate: {
      label: "Event Date",
      value: data.eventDate
        ? new Date(data.eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
      show: Boolean(data.eventDate),
    },
    duration: {
      label: "Duration",
      value: data.duration ? `${data.duration} minutes` : null,
      show: Boolean(data.duration),
    },
    venue: {
      label: "Venue",
      value: data.venue,
      show: Boolean(data.venue),
    },
    meetingId: {
      label: "Meeting ID",
      value: data.meetingId,
      show: Boolean(data.meetingId),
    },
    passcode: {
      label: "Passcode",
      value: data.passcode,
      show: Boolean(data.passcode),
    },
    meetingLink: {
      label: "Meeting Link",
      value: `<a href="${data.meetingLink}" style="color: #F97316; text-decoration: none;">Join Meeting</a>`,
      show: Boolean(data.meetingLink),
    },
  };

  return Object.entries(fieldMappings)
    .filter(([_, field]) => field.show)
    .map(
      ([_, field]) => `
      <tr>
        <td style="padding: 12px 15px; width: 140px; border-bottom: 1px solid #E5E7EB;">
          <strong style="color: #1E293B;">${field.label}:</strong>
        </td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #E5E7EB;">
          ${field.value}
        </td>
      </tr>
    `
    )
    .join("");
};

const generateEmailTemplate = (data) => {
  const eventDetailsRows = generateEventDetailsRows(data);

  const joinButtonHtml = data.meetingLink
    ? `
    <div style="text-align: center; margin-top: 30px;">
      <a href="${data.meetingLink}" 
         style="display: inline-block; background-color: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
         Join Meeting
      </a>
    </div>
  `
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Registration Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
        <!-- New Header -->
        <div style="background: linear-gradient(90deg, #F97316, #FACC15); padding: 30px 20px; text-align: center; position: relative;">
          <h1 style="margin: 0; font-size: 28px; color: #1E293B; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Segun Umoru Events</h1>
          <div style="position: absolute; top: 50%; left: 20px; transform: translateY(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 15px solid #1E293B;"></div>
          <div style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 15px solid #1E293B;"></div>
        </div>

        <!-- Confirmation Message -->
        <div style="text-align: center; padding: 30px 20px; background-color: #F9FAFB;">
          <p style="color: #64748B; font-size: 16px; margin: 0;">Thank you for registering for our upcoming event!</p>
        </div>

        <!-- Event Details -->
        ${
          eventDetailsRows
            ? `
        <div style="padding: 0 20px 30px;">
          <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; border: 1px solid #E5E7EB;">
            <h2 style="color: #F97316; font-size: 20px; margin: 0 0 20px 0; text-align: center; font-weight: 700;">Registration Details</h2>
            <table cellpadding="0" cellspacing="0" style="width: 100%; color: #64748B;">
              ${eventDetailsRows}
            </table>
            ${joinButtonHtml}
          </div>
        </div>
        `
            : ""
        }

        <!-- Additional Information -->
        <div style="padding: 0 30px 30px; color: #1E293B;">
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            We’re excited to have you join us! Please add this event to your calendar.
          </p>
          <p style="font-size: 14px; line-height: 1.6;">
            For any questions, contact our support team at 
            <a href="mailto:support@segunumoru.com" style="color: #F97316; text-decoration: none;">support@segunumoru.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="color: #64748B; font-size: 12px; margin: 0;">© 2025 Segun Umoru. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEventConfirmationEmail = async (data) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: `Registration Confirmed: ${data.eventTitle}`,
    html: generateEmailTemplate(data),
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending event registration email:", error);
    throw new Error("Failed to send event registration email");
  }
};

// REMINDER FUNCTIONS
const sentReminders = new Set();

const getReminderKey = (email, eventId, reminderType) => {
  return `${email}-${eventId}-${reminderType}-${new Date().toDateString()}`;
};

const generate24HourReminderTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Reminder - 24 Hours to Go!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
        <!-- New Header -->
        <div style="background: linear-gradient(90deg, #F97316, #FACC15); padding: 30px 20px; text-align: center; position: relative;">
          <h1 style="margin: 0; font-size: 28px; color: #1E293B; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Segun Umoru Events</h1>
          <div style="position: absolute; top: 50%; left: 20px; transform: translateY(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 15px solid #1E293B;"></div>
          <div style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 15px solid #1E293B;"></div>
        </div>

        <!-- Reminder Banner -->
        <div style="background: linear-gradient(135deg, #F97316, #FACC15); padding: 20px; text-align: center; color: #1E293B;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Your Event Starts in 24 Hours!</h2>
        </div>

        <!-- Event Details -->
        <div style="padding: 30px;">
          <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; border: 1px solid #E5E7EB;">
            <h2 style="color: #F97316; margin-top: 0; font-size: 18px; font-weight: 700;">${
              data.eventTitle
            }</h2>
            <table style="width: 100%; border-collapse: collapse; color: #64748B;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong>Date & Time:</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  ${new Date(data.eventDate).toLocaleString()}
                </td>
              </tr>
              ${
                data.venue
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong>Venue:</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  ${data.venue}
                </td>
              </tr>
              `
                  : ""
              }
              ${
                data.meetingLink
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong>Meeting Link:</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  <a href="${data.meetingLink}" style="color: #F97316;">Join Meeting</a>
                </td>
              </tr>
              `
                  : ""
              }
            </table>

            ${
              data.meetingLink
                ? `
            <div style="text-align: center; margin-top: 20px;">
              <a href="${data.meetingLink}" 
                 style="display: inline-block; background-color: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                Join Event
              </a>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="color: #64748B; font-size: 12px; margin: 0;">© 2025 Segun Umoru. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generate1HourReminderTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Starts in 1 Hour!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
        <!-- New Header -->
        <div style="background: linear-gradient(90deg, #F97316, #FACC15); padding: 30px 20px; text-align: center; position: relative;">
          <h1 style="margin: 0; font-size: 28px; color: #1E293B; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Segun Umoru Events</h1>
          <div style="position: absolute; top: 50%; left: 20px; transform: translateY(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 15px solid #1E293B;"></div>
          <div style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 15px solid #1E293B;"></div>
        </div>

        <!-- Urgent Reminder Banner -->
        <div style="background: linear-gradient(135deg, #F97316, #FACC15); padding: 20px; text-align: center; color: #1E293B;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Your Event Starts in 1 Hour!</h2>
        </div>

        <!-- Event Details -->
        <div style="padding: 30px;">
          <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; border: 1px solid #E5E7EB;">
            <h2 style="color: #F97316; margin-top: 0; font-size: 18px; font-weight: 700;">${
              data.eventTitle
            }</h2>
            <table style="width: 100%; border-collapse: collapse; color: #64748B;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong>Date & Time:</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  ${new Date(data.eventDate).toLocaleString()}
                </td>
              </tr>
              ${
                data.venue
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong>Venue:</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  ${data.venue}
                </td>
              </tr>
              `
                  : ""
              }
              ${
                data.meetingLink
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong>Meeting Link:</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                  <a href="${data.meetingLink}" style="color: #F97316;">Join Meeting</a>
                </td>
              </tr>
              `
                  : ""
              }
            </table>

            ${
              data.meetingLink
                ? `
            <div style="text-align: center; margin-top: 20px;">
              <a href="${data.meetingLink}" 
                 style="display: inline-block; background-color: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                Join Now
              </a>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="color: #64748B; font-size: 12px; margin: 0;">© 2025 Segun Umoru. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendReminderEmail = async (registration, event, template) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: registration.email,
    subject: `Reminder: ${event.title} - Starting Soon!`,
    html: template({
      eventTitle: event.title,
      eventDate: event.date,
      venue: event.venue,
      meetingLink: event.meetingLink,
      meetingId: event.meetingId,
      passcode: event.passcode,
    }),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${registration.email}`);
  } catch (error) {
    console.error(
      `Failed to send reminder email to ${registration.email}:`,
      error
    );
  }
};

const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    console.log("Checking reminders at:", now);

    for (const key of sentReminders) {
      const [email, eventId, reminderType, dateStr] = key.split("-");
      const reminderDate = new Date(dateStr);
      if (now - reminderDate > 24 * 60 * 60 * 1000) {
        sentReminders.delete(key);
      }
    }

    const upcomingEvents = await Event.find({
      date: {
        $gt: now,
        $lt: new Date(now.getTime() + 25 * 60 * 60 * 1000),
      },
    });

    console.log(`Found ${upcomingEvents.length} upcoming events`);

    for (const event of upcomingEvents) {
      const registrations = await EventRegistration.find({ slug: event.slug });
      console.log(
        `Found ${registrations.length} registrations for event: ${event.title}`
      );

      const eventTime = new Date(event.date);
      const hoursUntilEvent = (eventTime - now) / (1000 * 60 * 60);
      console.log(`Hours until event: ${hoursUntilEvent}`);

      for (const registration of registrations) {
        if (hoursUntilEvent <= 24.5 && hoursUntilEvent > 23.5) {
          const reminderKey = getReminderKey(
            registration.email,
            event._id,
            "24h"
          );
          if (!sentReminders.has(reminderKey)) {
            console.log(`Sending 24hr reminder to ${registration.email}`);
            await sendReminderEmail(
              registration,
              event,
              generate24HourReminderTemplate
            );
            sentReminders.add(reminderKey);
          }
        }

        if (hoursUntilEvent <= 1.5 && hoursUntilEvent > 0.5) {
          const reminderKey = getReminderKey(
            registration.email,
            event._id,
            "1h"
          );
          if (!sentReminders.has(reminderKey)) {
            console.log(`Sending 1hr reminder to ${registration.email}`);
            await sendReminderEmail(
              registration,
              event,
              generate1HourReminderTemplate
            );
            sentReminders.add(reminderKey);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in reminder check:", error);
    console.error(error.stack);
  }
};

const scheduleReminders = () => {
  console.log("Initializing reminder scheduler...");

  cron.schedule("*/10 * * * *", () => {
    console.log("Running scheduled reminder check...");
    checkAndSendReminders().catch((err) => {
      console.error("Failed to run reminder check:", err);
    });
  });

  checkAndSendReminders().catch((err) => {
    console.error("Failed to run initial reminder check:", err);
  });
};

const getRemindersStatus = () => {
  return {
    totalTrackedReminders: sentReminders.size,
    reminders: Array.from(sentReminders),
  };
};

const triggerReminderCheck = async () => {
  console.log("Manually triggering reminder check...");
  await checkAndSendReminders();
};

module.exports = {
  sendEventConfirmationEmail,
  scheduleReminders,
  checkAndSendReminders,
  triggerReminderCheck,
  getRemindersStatus,
};
