require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./db");

const authRoutes = require("./routes/auth.routes");
const ocrRoutes = require("./routes/ocr.routes");
const reminderRoutes = require("./routes/reminder.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/", ocrRoutes);
app.use("/", reminderRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
