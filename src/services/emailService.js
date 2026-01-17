"use strict";
require("dotenv").config();
const nodemailer = require("nodemailer");

// Format date in Vietnamese: "Ngày dd/MM/yyyy" with VN timezone
const formatDateVi = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const formatted = date.toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  return `Ngày ${formatted}`;
};

const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

const sendBookingEmail = async ({
  email,
  patientName,
  doctorName,
  workDate,
  timeLabel,
  reason,
  token,
}) => {
  if (!email || !token) {
    throw new Error("Missing email or token");
  }

  console.log("Sending booking email to:", email, {
    workDate,
    timeLabel,
  });
  const transporter = createTransporter();

  const appUrl = process.env.URL_REACT;
  if (!appUrl) {
    throw new Error("Missing URL_REACT in environment");
  }
  const encodedToken = encodeURIComponent(token);
  const confirmLink = `${appUrl}/confirm-booking?token=${encodedToken}`;
  const cancelLink = `${appUrl}/cancel-booking?token=${encodedToken}`;

  const formattedDate = formatDateVi(workDate);

  const mailOptions = {
    from: `"Booking Care" <${process.env.EMAIL_APP}>`,
    to: email,
    subject: "Xác nhận lịch khám",
    html: `
      <h3>Xin chào ${patientName}</h3>
      <p>Bạn đã đặt lịch khám với thông tin sau:</p>
      <ul>
        <li><b>Bác sĩ:</b> ${doctorName}</li>
        <li><b>Ngày khám:</b> ${formattedDate}</li>
        <li><b>Khung giờ:</b> ${timeLabel}</li>
        <li><b>Lý do khám:</b> ${reason}</li>
      </ul>
      <p>Vui lòng xác nhận lịch hẹn:</p>
      <p>
        <a href="${confirmLink}" target="_blank" rel="noopener noreferrer">✅ Xác nhận lịch khám</a>
      </p>
      <p>
        <a href="${cancelLink}" target="_blank" rel="noopener noreferrer">❌ Huỷ lịch khám</a>
      </p>
      <p><i>Nếu bạn không xác nhận, lịch sẽ tự động huỷ.</i></p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send prescription + examination summary to patient
const sendPrescriptionEmail = async ({
  email,
  patientName,
  doctorName,
  workDate,
  timeLabel,
  diagnosis,
  conclusion,
  medicalNote,
  prescriptionNote,
  items,
}) => {
  if (!email) throw new Error("Missing patient email");

  const transporter = createTransporter();
  const formattedDate = formatDateVi(workDate);

  const itemsHtml =
    Array.isArray(items) && items.length
      ? `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead style="background:#f5f5f5;">
          <tr>
            <th style="text-align:left;">Tên thuốc</th>
            <th style="text-align:right;">Số lượng</th>
            <th style="text-align:left;">Cách dùng</th>
            <th style="text-align:right;">Số ngày</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (it) => `
            <tr>
              <td>${it.name || it.medicineName || "--"}</td>
              <td style="text-align:right;">${it.quantity ?? "--"}</td>
              <td>${it.usage ?? "--"}</td>
              <td style="text-align:right;">${it.duration ?? "--"}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `
      : `<p><i>Không có đơn thuốc được kê.</i></p>`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#333;">
      <h3>Xin chào ${patientName}</h3>
      <p>Bạn vừa hoàn tất khám với bác sĩ <b>${doctorName}</b>.</p>
      <ul>
        <li><b>${formattedDate}</b></li>
        <li><b>Khung giờ:</b> ${timeLabel || "--"}</li>
      </ul>
      <h4>Kết quả khám</h4>
      <p><b>Chẩn đoán:</b> ${diagnosis || "--"}</p>
      <p><b>Kết luận:</b> ${conclusion || "--"}</p>
      ${medicalNote ? `<p><b>Ghi chú:</b> ${medicalNote}</p>` : ""}
      <h4>Đơn thuốc</h4>
      ${itemsHtml}
      ${
        prescriptionNote
          ? `<p><b>Ghi chú đơn thuốc:</b> ${prescriptionNote}</p>`
          : ""
      }
      <p style="margin-top:16px;">Chúc bạn mau khỏe! Nếu có thắc mắc, vui lòng phản hồi email này.</p>
    </div>
  `;

  const mailOptions = {
    from: `"Booking Care" <${process.env.EMAIL_APP}>`,
    to: email,
    subject: "Đơn thuốc và kết quả khám",
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendBookingEmail,
  sendPrescriptionEmail,
};
