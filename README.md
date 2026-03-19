# BookingCare - Backend

## Giới thiệu

API server xây dựng với Node.js + Express + MySQL dành cho hệ thống đặt lịch khám bệnh trực tuyến. Cung cấp tất cả endpoints cần thiết để quản lý người dùng, bác sĩ, lịch khám, thanh toán và các dịch vụ liên quan.

Frontend: [BookingCare Frontend](https://github.com/Toanhao/BookingCare-FE)

---

## Tính năng

### Thành viên hệ thống

- Xác thực người dùng (đăng nhập/đăng xuất)
- Cung cấp dữ liệu bác sĩ, chuyên khoa, phòng khám
- Cung cấp nội dung cẩm nang y tế
- Tích hợp chat AI hỗ trợ tra cứu thông tin
- Quản lý thông tin cá nhân

### Bệnh nhân

- Đăng ký và quản lý tài khoản
- Xem lịch khám và thông tin bác sĩ
- Tạo và quản lý lịch đặt khám
- Xác nhận / hủy lịch qua email hoặc tài khoản
- Truy xuất lịch sử khám, bệnh án, đơn thuốc
- Thanh toán hóa đơn

### Bác sĩ

- Quản lý lịch làm việc (tạo nhiều lịch)
- Truy cập danh sách bệnh nhân đặt khám
- Tạo và quản lý hồ sơ bệnh án
- Kê đơn thuốc
- Quản lý nội dung cẩm nang y tế
- Xem thống kê hoạt động cá nhân

### Quản lý (Admin)

- Quản lý người dùng và phân quyền
- Quản lý bác sĩ, chuyên khoa, phòng khám
- Quản lý khung giờ khám và danh mục thuốc
- Xem thống kê toàn hệ thống (lượt khám, doanh thu, ...)

## Công nghệ

- Node.js
- Express
- MySQL v8+
- Sequelize
- JWT
- Nodemailer
- Babel

---

## Cấu trúc

```
BE-BookingCare/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── migrations/
│   ├── routes/
│   ├── services/
│   └── server.js
├── .env
├── package.json
└── README.md
```

---

## Cài đặt

Yêu cầu: Node.js v16+, MySQL v8+, npm

```bash
npm install
```

Tạo file .env:

```env
PORT=3001
NODE_ENV=development
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=123456
DB_NAME=bookingcare
JWT_SECRET=your_jwt_secret_key_here
URL_REACT=http://localhost:3000
EMAIL_APP=your_email@gmail.com
EMAIL_APP_PASSWORD=your_16_char_gmail_app_password
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
```

## Ghi chú

- `EMAIL_APP` và `EMAIL_APP_PASSWORD` là tài khoản Gmail hệ thống dùng để gửi email thông báo (đặt lịch, nhắc lịch, xác nhận) cho người dùng.
- `GEMINI_API_KEY`: bắt buộc, lấy từ Google AI Studio.
- `GEMINI_MODEL`: model sử dụng (mặc định `gemini-2.5-flash`).
- `GEMINI_BASE_URL`: endpoint của Gemini API.

Cấu hình Database (src/config/config.json):

```json
{
  "development": {
    "username": "root",
    "password": "123456",
    "database": "bookingcare",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

Tạo Database:

```bash
mysql -u root -p
CREATE DATABASE bookingcare;
npx sequelize-cli db:migrate
```

Chạy Server:

```bash
npm start
```

Server: http://localhost:3001

---

## API Endpoints

### User / Authentication

- POST /api/users/register: đăng ký tài khoản bệnh nhân.
- POST /api/users/login: đăng nhập, trả về JWT token.
- GET /api/users/profile: lấy thông tin user hiện tại (theo token).
- POST /api/users/create: admin tạo mới user theo role.
- GET /api/users: lấy danh sách toàn bộ người dùng.
- GET /api/users/doctors: lấy danh sách user có role bác sĩ.
- PUT /api/users/:id: cập nhật thông tin người dùng.
- DELETE /api/users/:id: xóa người dùng theo id.

### Doctors

- POST /api/doctors: tạo hồ sơ bác sĩ.
- GET /api/doctors: lấy danh sách bác sĩ.
- GET /api/doctors/:id: lấy chi tiết 1 bác sĩ.
- PATCH /api/doctors/:id: cập nhật thông tin bác sĩ.

### Specialties

- POST /api/specialties: tạo chuyên khoa mới.
- GET /api/specialties: lấy danh sách chuyên khoa.
- GET /api/specialties/:id: lấy chi tiết chuyên khoa.
- PATCH /api/specialties/:id: cập nhật chuyên khoa.
- DELETE /api/specialties/:id: xóa chuyên khoa.

### Clinics

- POST /api/clinics: tạo phòng khám.
- GET /api/clinics: lấy danh sách phòng khám.
- GET /api/clinics/:id: lấy chi tiết phòng khám.
- PATCH /api/clinics/:id: cập nhật phòng khám.
- DELETE /api/clinics/:id: xóa phòng khám.

### Handbooks

- POST /api/handbooks: tạo bài viết/cẩm nang y tế.
- GET /api/handbooks: lấy danh sách cẩm nang.
- GET /api/handbooks/:id: lấy chi tiết cẩm nang.
- PATCH /api/handbooks/:id: cập nhật cẩm nang.
- DELETE /api/handbooks/:id: xóa cẩm nang.

### Medicines

- POST /api/medicines: tạo thuốc mới.
- GET /api/medicines: lấy danh sách thuốc.
- GET /api/medicines/:id: lấy chi tiết thuốc.
- PATCH /api/medicines/:id: cập nhật thuốc.
- DELETE /api/medicines/:id: xóa thuốc.

### Time Slots

- POST /api/time-slots: tạo khung giờ khám.
- GET /api/time-slots: lấy danh sách khung giờ.
- GET /api/time-slots/:id: lấy chi tiết khung giờ.
- PATCH /api/time-slots/:id: cập nhật khung giờ.
- DELETE /api/time-slots/:id: xóa khung giờ.

### Schedules

- POST /api/schedules/bulk: tạo nhiều lịch làm việc cho bác sĩ.
- GET /api/schedules: lấy danh sách lịch khám/lịch làm việc.
- PATCH /api/schedules/:id: cập nhật một lịch làm việc.

### Bookings

- POST /api/bookings: tạo lượt đặt khám.
- GET /api/bookings/:id: lấy chi tiết một lượt đặt khám.
- GET /api/bookings/confirm: xác nhận đặt khám qua token/email.
- GET /api/bookings/cancel: hủy lịch qua token/email.
- GET /api/patient/bookings: lấy lịch sử đặt khám của bệnh nhân.
- PATCH /api/patient/bookings/cancel: bệnh nhân hủy lịch từ tài khoản.
- GET /api/doctor/bookings: bác sĩ xem danh sách lịch bệnh nhân đã đặt.

### Medical records / Prescriptions / Bills

- POST /api/medical-records: tạo hồ sơ bệnh án.
- POST /api/prescriptions: tạo đơn thuốc cho bệnh án/lượt khám.
- POST /api/bills: tạo hóa đơn thanh toán.
- PATCH /api/bills/pay: cập nhật trạng thái đã thanh toán.

### Statistics

- GET /api/statistics/dashboard: số liệu tổng quan (KPI).
- GET /api/statistics/time-series: thống kê theo thời gian.
- GET /api/statistics/doctors: thống kê theo bác sĩ.
- GET /api/statistics/clinics: thống kê theo phòng khám.
- GET /api/statistics/specialties: thống kê theo chuyên khoa.
- GET /api/statistics/bookings: thống kê chi tiết lượt đặt khám.

### Chat AI (Gemini)

`POST /api/chat-booking` dùng để hỏi thông tin bác sĩ/lịch khám/phòng khám/chuyên khoa bằng AI Assistant.

---

## Authentication

API sử dụng JWT (JSON Web Token) cho luồng đăng nhập.

Login:

```bash
POST /api/users/login
{"email": "user@example.com", "password": "password123"}
```

Use Token:

```bash
GET /api/users/profile
Authorization: Bearer <token>
```

---
