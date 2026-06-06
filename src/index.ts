import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import coursesRouter from "./routes/courses";
import enrollmentsRouter from "./routes/enrollments";
import sessionsRouter from "./routes/sessions";
import attendanceRouter from "./routes/attendance";
import contactRouter from "./routes/contact";
import teachersRouter from "./routes/teachers";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.use("/api/courses", coursesRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/contact", contactRouter);
app.use("/api/teachers", teachersRouter);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Quran Academy backend is running." });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
