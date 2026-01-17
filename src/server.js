import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import viewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import connectDB from "./config/connectDB";

dotenv.config();

const app = express();

// ============================
// 1️⃣ Cấu hình CORS
// ============================
const corsOptions = {
  origin: process.env.URL_REACT || "http://localhost:3000", // cho phép frontend React
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Requested-With", "Authorization"],
  credentials: true, // cho phép cookie, token
};

app.use(cors(corsOptions));

// ============================
// 2️⃣ Cấu hình body-parser
// ============================
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// ============================
// 3️⃣ View Engine & Routes
// ============================
viewEngine(app);
initWebRoutes(app);

// ============================
// 4️⃣ Kết nối Database
// ============================
connectDB();

// ============================
// 5️⃣ Chạy server
// ============================
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
