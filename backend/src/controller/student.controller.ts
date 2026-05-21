import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        skip,
        take: limit,
        orderBy: {
          id: "asc",
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
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        marks: {
          include: {
            subject: true,
            semester: true,
          },
        },
      },
    });
    return res.json({
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
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
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Check existing email
    const existingEmail =
      await prisma.student.findUnique({
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
    const existingRollNo =
      await prisma.student.findUnique({
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
        return res.json({
            message: "Student deleted successfully",
            data: student,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}