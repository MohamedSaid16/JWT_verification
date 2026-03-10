import prisma from "../config/database";

export class StudentService {
  private asString(value: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
  }

  async getStudentByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            lastLogin: true,
          },
        },
      },
    });
  }

  async getStudentByStudentId(studentId: string) {
    return prisma.student.findUnique({ where: { studentId }, include: { user: true } });
  }

  async upsertStudentProfile(
    userId: string,
    data: {
      studentId: string;
      level?: string;
      group?: string;
      departmentId?: string;
      specialiteId?: string;
    }
  ) {
    return prisma.student.upsert({
      where: { userId },
      update: {
        studentId: data.studentId,
        level: data.level,
        group: data.group,
        department: data.departmentId,
        specialite: data.specialiteId,
      },
      create: {
        userId,
        studentId: data.studentId,
        level: data.level,
        group: data.group,
        department: data.departmentId,
        specialite: data.specialiteId,
      },
    });
  }

  async updateStudentProfile(
    userId: string,
    data: {
      level?: string;
      group?: string;
      departmentId?: string;
      specialiteId?: string;
    }
  ) {
    return prisma.student.update({
      where: { userId },
      data: {
        level: data.level,
        group: data.group,
        department: data.departmentId,
        specialite: data.specialiteId,
      },
    });
  }

  async getAvailableCourses(_studentId: string) {
    return [];
  }

  async enrollInCourse(studentId: string, courseId: string | string[]) {
    const normalizedCourseId = this.asString(courseId);
    return {
      id: `${studentId}:${normalizedCourseId}`,
      studentId,
      courseId: normalizedCourseId,
      status: "UNAVAILABLE",
      message: "Course enrollment is not available with the current schema",
    };
  }

  async dropCourse(_studentId: string, _courseId: string | string[]) {
    return { dropped: false, message: "Course enrollment is not available with the current schema" };
  }

  async getEnrolledCourses(_studentId: string) {
    return [];
  }

  async getGrades(_studentId: string, _semester?: string) {
    return [];
  }

  async getGPA(_studentId: string) {
    return 0;
  }

  async getProjects(_studentId: string) {
    return [];
  }

  async submitProject(
    studentId: string,
    projectId: string | string[],
    data: {
      title: string;
      description?: string;
      fileUrl: string;
    }
  ) {
    const normalizedProjectId = this.asString(projectId);
    return {
      id: `${normalizedProjectId}:${studentId}`,
      projectId: normalizedProjectId,
      studentId,
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl,
      message: "Project submissions are not available with the current schema",
    };
  }

  async createComplaint(
    studentId: string,
    data: {
      title: string;
      description: string;
      category: string;
      priority?: string;
    }
  ) {
    return {
      id: `complaint:${Date.now()}`,
      studentId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || "MEDIUM",
      status: "UNAVAILABLE",
      message: "Complaints are not available with the current schema",
    };
  }

  async getComplaints(_studentId: string) {
    return [];
  }

  async getComplaintById(_complaintId: string | string[], _studentId: string) {
    return null;
  }

  async getSchedule(_studentId: string) {
    return [];
  }

  async getStudentStats(_studentId: string) {
    return {
      enrolledCourses: 0,
      completedCourses: 0,
      totalProjects: 0,
      gpa: 0,
      complaints: 0,
    };
  }
}
