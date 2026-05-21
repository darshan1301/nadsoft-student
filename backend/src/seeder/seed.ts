import { prisma } from "../db/prisma";

async function main() {
  console.log('Starting database seeding...');

  // 1. Clear existing data to prevent unique constraint errors on re-runs
  // Delete in reverse order of dependencies (Mark depends on everything else)
  await prisma.mark.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.semester.deleteMany({});

  console.log('Cleaned up existing database records.');

  // 2. Seed Semesters (6 semesters)
  const semestersData = Array.from({ length: 6 }, (_, i) => ({
    name: `Semester ${i + 1}`,
    code: `SEM-${i + 1}`,
  }));

  const semesters = [];
  for (const sem of semestersData) {
    const createdSem = await prisma.semester.create({ data: sem });
    semesters.push(createdSem);
  }
  console.log(`Created ${semesters.length} Semesters.`);

  // 3. Seed Subjects (4 specified subjects)
  const subjectsData = [
    { name: 'Mathematics', code: 'MATH101' },
    { name: 'Physics', code: 'PHYS101' },
    { name: 'Chemistry', code: 'CHEM101' },
    { name: 'Biology', code: 'BIO101' },
  ];

  const subjects = [];
  for (const sub of subjectsData) {
    const createdSub = await prisma.subject.create({ data: sub });
    subjects.push(createdSub);
  }
  console.log(`Created ${subjects.length} Subjects.`);

  // 4. Seed Students (20 students)
  const students = [];
  for (let i = 1; i <= 20; i++) {
    const paddedIndex = String(i).padStart(2, '0');
    const createdStudent = await prisma.student.create({
      data: {
        name: `Student ${paddedIndex}`,
        email: `student${paddedIndex}@example.com`,
        rollNo: `R-${2026}${paddedIndex}`, // e.g., R-202601
      },
    });
    students.push(createdStudent);
  }
  console.log(`Created ${students.length} Students.`);

  // 5. Seed Marks
  // For every student, in every semester, assign a grade for every subject
  console.log('Generating student marks...');
  const marksToInsert = [];

  for (const student of students) {
    for (const semester of semesters) {
      for (const subject of subjects) {
              // Generates random whole number between 40 and 100
      const randomMark =
        Math.floor(Math.random() * 61) + 40;

        marksToInsert.push({
          studentId: student.id,
          semesterId: semester.id,
          subjectId: subject.id,
          mark: randomMark,
        });
      }
    }
  }

  // Use createMany to insert all marks quickly
  const createdMarks = await prisma.mark.createMany({
    data: marksToInsert,
  });

  console.log(`Generated ${createdMarks.count} mark records.`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });