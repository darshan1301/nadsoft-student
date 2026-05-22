import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.student.count(),
    ]);

    return res.status(200).json({
      data: students,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate that 'id' exists and is a valid numeric string
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format. Student ID must be a valid number.",
      });
    }

    const studentId = Number(id);

    // Perform database lookup
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        marks: {
          include: {
            subject: true,
            semester: true,
          },
        },
      },
    });

    // Return a clean 404 if the database query comes up empty
    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student record with ID #${studentId} could not be found.`,
      });
    }

    //  Explicitly successful return
    return res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    // Log the actual error for your server telemetry logs
    console.error("Error executing getStudentById:", error);

    // Send an opaque error back to the client to obscure database architecture details
    return res.status(500).json({
      success: false,
      error:
        "An internal server error occurred while retrieving student records.",
    });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, rollNo } = req.body;

    // Required field validation
    if (!name || !email || !rollNo) {
      return res.status(400).json({
        error: "Name, email and rollNo are required",
      });
    }

    // Normalize input
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedRollNo = rollNo.trim().toUpperCase();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Check existing email
    const existingEmail = await prisma.student.findUnique({
      where: {
        email: trimmedEmail,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    // Check existing roll number
    const existingRollNo = await prisma.student.findUnique({
      where: {
        rollNo: trimmedRollNo,
      },
    });

    if (existingRollNo) {
      return res.status(409).json({
        error: "Roll number already exists",
      });
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        rollNo: trimmedRollNo,
      },
    });

    return res.status(201).json({
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

export const deleteStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.delete({
      where: { id: Number(id) },
    });
    if (!student) {
      return res.status(400).json({ message: "Student not found." });
    }
    return res.json({
      message: "Student deleted successfully",
      data: student,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, rollNo } = req.body;
    if (!name || !email || !rollNo) {
      return res.status(400).json({
        error: "Name, email and rollNo are required",
      });
    }

    // cheque duplicate roll no and email
    const existingEmail = await prisma.student.findUnique({
      where: { email: email.toLowerCase() },
    });

    const existingRollNo = await prisma.student.findUnique({
      where: { rollNo: rollNo.toUpperCase() },
    });

    // Check if email already exists (and ignore if it's the same student)
    if (existingEmail && existingEmail.id !== Number(id)) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    // Check if roll number already exists (and ignore if it's the same student)
    if (existingRollNo && existingRollNo.id !== Number(id)) {
      return res.status(409).json({
        error: "Roll number already exists",
      });
    }

    const student = await prisma.student.update({
      where: { id: Number(id) },
      data: { name, email, rollNo },
    });
    return res.json({
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
