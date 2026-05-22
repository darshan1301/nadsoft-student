import { Router } from "express";
import {
  createStudent,
  deleteStudentById,
  getAllStudents,
  getStudentById,
  updateStudentById,
} from "../controller/student.controller";

const router = Router();

router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.delete("/:id", deleteStudentById);
router.put("/:id", updateStudentById);

export default router;