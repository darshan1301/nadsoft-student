import { Router } from "express";
import {
  createStudent,
  deleteStudentById,
  getAllStudents,
  getStudentById,
} from "../controller/student.controller";

const router = Router();

router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.delete("/:id", deleteStudentById);

export default router;