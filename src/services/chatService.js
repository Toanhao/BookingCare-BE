const db = require("../models/index");

const GEMINI_URL = `${process.env.GEMINI_BASE_URL}/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`;
const MAX_LIMIT = 10;

const TABLE_COLUMNS = {
  Users: ["id", "fullName", "email", "phoneNumber", "gender", "role"],
  Doctors: ["id", "title", "fee", "clinicId", "specialtyId"],
  Clinics: ["id", "name", "address"],
  Specialties: ["id", "name"],
  Schedules: ["id", "doctorId", "timeSlotId", "workDate", "maxPatient"],
  TimeSlots: ["id", "label"],
};

const buildSchema = () => {
  const schemaLines = [
    "Tables and allowed columns (do not use others):",
    "- Users(id, fullName, email, phoneNumber, gender, role)",
    "- Doctors(id, title, fee, clinicId, specialtyId)",
    "- Clinics(id, name, address)",
    "- Specialties(id, name)",
    "- Schedules(id, doctorId, timeSlotId, workDate, maxPatient)",
    "- TimeSlots(id, label)",
    "Relationships:",
    "Doctor.id -> Users.id (to get doctor name and contact info)",
    "- Doctors.clinicId -> Clinics.id",
    "- Doctors.specialtyId -> Specialties.id",
    "- Schedules.doctorId -> Doctors.id",
    "- Schedules.timeSlotId -> TimeSlots.id",
  ];
  return { schema: schemaLines.join("\n"), tables: Object.keys(TABLE_COLUMNS) };
};

const callGemini = async (apiKey, prompt, mimeType) => {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: mimeType },
    }),
  });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || (mimeType === "application/json" ? "{}" : "");
};

const sanitizeRows = (rows = []) => {
  const forbiddenKeys = ["password", "image", "description", "bio", "token"];
  return rows.map((row) => {
    const clean = {};
    Object.keys(row || {}).forEach((key) => {
      const lower = key.toLowerCase();
      if (forbiddenKeys.some((f) => lower.includes(f))) return;
      clean[key] = row[key];
    });
    return clean;
  });
};

const safeSql = (sql, allowedTables) => {
  const text = sql.toLowerCase();
  const forbidden = /(insert|update|delete|drop|truncate|alter|create|replace|grant|revoke)/;
  if (forbidden.test(text)) return false;
  if (!/^\s*select/.test(text)) return false;
  if (sql.includes(";")) return false;
  if (/information_schema|pg_|sqlite_master/.test(text)) return false;

  const tableRegex = /\bfrom\s+([\w"`.]+)/gi;
  const joinRegex = /\bjoin\s+([\w"`.]+)/gi;
  const found = [];
  let m;
  while ((m = tableRegex.exec(text))) found.push(m[1].replace(/[`"']/g, ""));
  while ((m = joinRegex.exec(text))) found.push(m[1].replace(/[`"']/g, ""));
  if (found.length === 0) return false;

  return found.every((t) => allowedTables.some((allowed) => allowed.toLowerCase() === t.toLowerCase()));
};

const buildSqlPrompt = ({ message, language, schema }) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return [
    "You are an expert SQL generator for a medical booking app.",
    "Only answer with a single JSON object and nothing else.",
    "Use the schema below. Use only listed tables/columns. Avoid long text fields.",
    schema,
    `User message: ${message}`,
    `Today's date (use this literal date in SQL): ${today}`,
    "Output JSON format:",
    '{"run_sql": true|false, "sql": "SELECT ...", "answer": "short answer in requested language"}',
    "Rules:",
    "- If the question is not about doctors, schedules, specialties, or clinics, set run_sql to false and provide a brief natural answer in the requested language.",
    "- If SQL is needed, produce a single SELECT statement with explicit column names (no SELECT *).",
    `- When querying schedules (workDate), ALWAYS filter by workDate >= '${today}' to show only future/today appointments. Use literal date, not CURDATE().`,
    "- When returning schedules, ORDER BY workDate ASC to show nearest appointments first.",
    `- Always cap results with LIMIT ${MAX_LIMIT}. If not provided, we will append it.`,
    `- Language for 'answer' must be ${language}.`,
  ].join("\n");
};

const buildExplainPrompt = ({ message, rows, language }) => {
  return [
    "You are an AI assistant for an online medical booking app.",
    `User asked: ${message}`,
    "SQL query results (JSON):",
    JSON.stringify(rows, null, 2),
    "Link rules:",
    "- Doctor detail: http://localhost:3000/detail-doctor/{id}",
    "- Specialty detail: http://localhost:3000/detail-specialty/{id}",
    "- Clinic detail: http://localhost:3000/detail-clinic/{id}",
    "- All doctors: http://localhost:3000/all-directory?tab=doctor",
    "- All clinics: http://localhost:3000/all-directory?tab=clinic",
    "- All specialties: http://localhost:3000/all-directory?tab=specialty",
    "- Replace {id} with real IDs from results and use Markdown links [text](url).",
    "- Do not invent URLs; only use the patterns above.",
    "Response rules:",
    `- Write a concise, friendly reply in ${language}.`,
    "- If no data, politely say so and suggest what the user can ask (e.g., doctor name, specialty, clinic).",
    "- If the user wants to book, tell them to open the doctor detail link to continue; do not invent booking URLs.",
  ].join("\n");
};

const chatBooking = async (body = {}) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { errCode: 2, errMessage: "Missing GEMINI_API_KEY" };

    const { message = "", language = "vi" } = body;
    if (!message.trim()) return { errCode: 3, errMessage: "Missing message" };

    const { schema, tables: allowedTables } = buildSchema();
    const sqlPrompt = buildSqlPrompt({ message, language, schema });

    const rawSql = await callGemini(apiKey, sqlPrompt, "application/json");
    let sqlObj;
    try {
      sqlObj = JSON.parse(rawSql);
    } catch (err) {
      return { errCode: 5, errMessage: "Không phân tích được JSON từ Gemini", raw: rawSql };
    }

    if (!sqlObj.run_sql || !sqlObj.sql) {
      return { errCode: 0, reply: sqlObj.answer || "Xin lỗi, tôi chưa rõ yêu cầu." };
    }

    let sql = (sqlObj.sql || "").trim();
    sql = sql.replace(/;+$/g, "");
    if (!/limit\s+\d+/i.test(sql)) sql += ` LIMIT ${MAX_LIMIT}`;

    if (!safeSql(sql, allowedTables)) {
      return { errCode: 6, errMessage: "SQL không an toàn", sql };
    }

    let rows = [];
    try {
      rows = await db.sequelize.query(sql, { type: db.Sequelize.QueryTypes.SELECT });
    } catch (err) {
      console.error("SQL execution failed", err);
      return { errCode: 0, reply: "Xin lỗi, tôi chưa lấy được dữ liệu. Bạn có thể hỏi rõ hơn?", sql };
    }

    const cleanRows = sanitizeRows(rows).slice(0, MAX_LIMIT);
    const explainPrompt = buildExplainPrompt({ message, rows: cleanRows, language });
    const finalReply = await callGemini(apiKey, explainPrompt, "text/plain");

    return { errCode: 0, reply: finalReply || sqlObj.answer || "" };
  } catch (e) {
    return { errCode: -1, errMessage: e.message };
  }
};

module.exports = { chatBooking };
