import prisma from "../config/database";

export class TeacherService {
  private asString(value: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
  }

  async getTeacherByUserId(userId: string) {
    return prisma.teacher.findUnique({
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

  async getTeacherByEmployeeId(employeeId: string) {
    return prisma.teacher.findUnique({ where: { employeeId }, include: { user: true } });
  }

  async upsertTeacherProfile(
    userId: string,
    data: {
      employeeId: string;
      department?: string;
      title?: string;
    }
  ) {
    return prisma.teacher.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }

  async updateTeacherProfile(
    userId: string,
    data: {
      department?: string;
      title?: string;
    }
  ) {
    return prisma.teacher.update({ where: { userId }, data });
  }

  async getCourses(_teacherId: string) {
    return [];
  }

  async createCourse(
    teacherId: string,
    data: {
      code: string;
      name: string;
      description?: string;
      credits: number;
      level?: string;
      departmentId?: string;
      specialiteId?: string;
      semester?: string;
      schedule?: any;
    }
  ) {
    return {
      id: `${teacherId}:${data.code}`,
      ...data,
      teacherId,
      isActive: false,
      message: "Courses are not available with the current schema",
    };
  }

  async updateCourse(
    courseId: string | string[],
    teacherId: string,
    data: {
      name?: string;
      description?: string;
      credits?: number;
      level?: string;
      semester?: string;
      schedule?: any;
      isActive?: boolean;
    }
  ) {
    const normalizedCourseId = this.asString(courseId);
    return {
      id: normalizedCourseId,
      teacherId,
      ...data,
      message: "Courses are not available with the current schema",
    };
  }

  async deleteCourse(_courseId: string | string[], _teacherId: string) {
    return { deleted: false, message: "Courses are not available with the current schema" };
  }

  async getStudents(_teacherId: string) {
    return [];
  }

  async getStudentsByCourse(_courseId: string | string[], _teacherId: string) {
    return [];
  }

  async enterGrades(
    _teacherId: string,
    grades: Array<{
      studentId: string;
      courseId: string;
      value: number;
      comment?: string;
    }>
  ) {
    return grades.map((grade) => ({
      ...grade,
      status: "UNAVAILABLE",
      message: "Grades are not available with the current schema",
    }));
  }

  async getCourseGrades(_courseId: string | string[], _teacherId: string) {
    return [];
  }

  async getCourseGradeStats(_courseId: string | string[], _teacherId: string) {
    return {
      average: 0,
      highest: 0,
      lowest: 0,
      count: 0,
      distribution: {},
    };
  }

  async getSupervisedProjects(_teacherId: string) {
    return [];
  }

  async createProject(
    teacherId: string,
    data: {
      title: string;
      description: string;
      type: string;
      year: string;
      specialiteId?: string;
      maxStudents?: number;
      deadline?: Date;
    }
  ) {
    return {
      id: `${teacherId}:${Date.now()}`,
      ...data,
      supervisorId: teacherId,
      status: "UNAVAILABLE",
      message: "Projects are not available with the current schema",
    };
  }

  async updateProjectStatus(projectId: string | string[], teacherId: string, status: string) {
    const normalizedProjectId = this.asString(projectId);
    return {
      id: normalizedProjectId,
      supervisorId: teacherId,
      status,
      message: "Projects are not available with the current schema",
    };
  }

  async gradeProject(
    projectId: string | string[],
    studentId: string | string[],
    teacherId: string,
    data: {
      grade: number;
      feedback?: string;
    }
  ) {
    const normalizedProjectId = this.asString(projectId);
    const normalizedStudentId = this.asString(studentId);
    return {
      projectId: normalizedProjectId,
      studentId: normalizedStudentId,
      gradedBy: teacherId,
      grade: data.grade,
      feedback: data.feedback,
      message: "Project grading is not available with the current schema",
    };
  }

  async getSchedule(_teacherId: string) {
    return [];
  }

  async getTeacherStats(_teacherId: string) {
    return {
      totalCourses: 0,
      activeCourses: 0,
      totalStudents: 0,
      totalProjects: 0,
      averageGrade: 0,
    };
  }
}
