import express from "express";
import dotenv from "dotenv";
import studentRouter from "./router/student.route";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(morgan("dev"));
app.use(cors());

app.get("/health", (req, res) => {
  return res.json("Api is healthy.");
});

app.use("/api/student", studentRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
