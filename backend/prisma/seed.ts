import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ==================== CREATE ADMIN USER ====================
  const adminPassword = await bcrypt.hash('Admin@123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@system.com' },
    update: {},
    create: {
      email: 'admin@system.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN_SUPER,
      isActive: true,
    },
  })

  console.log('✅ Admin user created')

  // ==================== CREATE SAMPLE TEACHER ====================
  const teacherPassword = await bcrypt.hash('Teacher@123', 10)

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@system.com' },
    update: {},
    create: {
      email: 'teacher@system.com',
      password: teacherPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.TEACHER,
      isActive: true,
    },
  })

  await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      employeeId: 'EMP-001',
      department: 'Computer Science',
      title: 'Professor',
    },
  })

  console.log('✅ Sample teacher created')

  // ==================== CREATE SAMPLE STUDENT ====================
  const studentPassword = await bcrypt.hash('Student@123', 10)

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@system.com' },
    update: {},
    create: {
      email: 'student@system.com',
      password: studentPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.STUDENT,
      isActive: true,
    },
  })

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      studentId: 'STU-001',
      level: 'L3',
      group: 'G1',
      department: 'Computer Science',
      specialite: 'Software Engineering',
    },
  })

  console.log(' Sample student created')

  console.log('\n Seed Credentials:')
  console.log('   Admin   — admin@system.com   / Admin@123')
  console.log('   Teacher — teacher@system.com / Teacher@123')
  console.log('   Student — student@system.com / Student@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())