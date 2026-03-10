"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherService = void 0;
const database_1 = __importDefault(require("../config/database"));
class TeacherService {
    asString(value) {
        return Array.isArray(value) ? value[0] : value;
    }
    async getTeacherByUserId(userId) {
        return database_1.default.teacher.findUnique({
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
    async getTeacherByEmployeeId(employeeId) {
        return database_1.default.teacher.findUnique({ where: { employeeId }, include: { user: true } });
    }
    async upsertTeacherProfile(userId, data) {
        return database_1.default.teacher.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data,
            },
        });
    }
    async updateTeacherProfile(userId, data) {
        return database_1.default.teacher.update({ where: { userId }, data });
    }
    async getCourses(_teacherId) {
        return [];
    }
    async createCourse(teacherId, data) {
        return {
            id: `${teacherId}:${data.code}`,
            ...data,
            teacherId,
            isActive: false,
            message: "Courses are not available with the current schema",
        };
    }
    async updateCourse(courseId, teacherId, data) {
        const normalizedCourseId = this.asString(courseId);
        return {
            id: normalizedCourseId,
            teacherId,
            ...data,
            message: "Courses are not available with the current schema",
        };
    }
    async deleteCourse(_courseId, _teacherId) {
        return { deleted: false, message: "Courses are not available with the current schema" };
    }
    async getStudents(_teacherId) {
        return [];
    }
    async getStudentsByCourse(_courseId, _teacherId) {
        return [];
    }
    async enterGrades(_teacherId, grades) {
        return grades.map((grade) => ({
            ...grade,
            status: "UNAVAILABLE",
            message: "Grades are not available with the current schema",
        }));
    }
    async getCourseGrades(_courseId, _teacherId) {
        return [];
    }
    async getCourseGradeStats(_courseId, _teacherId) {
        return {
            average: 0,
            highest: 0,
            lowest: 0,
            count: 0,
            distribution: {},
        };
    }
    async getSupervisedProjects(_teacherId) {
        return [];
    }
    async createProject(teacherId, data) {
        return {
            id: `${teacherId}:${Date.now()}`,
            ...data,
            supervisorId: teacherId,
            status: "UNAVAILABLE",
            message: "Projects are not available with the current schema",
        };
    }
    async updateProjectStatus(projectId, teacherId, status) {
        const normalizedProjectId = this.asString(projectId);
        return {
            id: normalizedProjectId,
            supervisorId: teacherId,
            status,
            message: "Projects are not available with the current schema",
        };
    }
    async gradeProject(projectId, studentId, teacherId, data) {
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
    async getSchedule(_teacherId) {
        return [];
    }
    async getTeacherStats(_teacherId) {
        return {
            totalCourses: 0,
            activeCourses: 0,
            totalStudents: 0,
            totalProjects: 0,
            averageGrade: 0,
        };
    }
}
exports.TeacherService = TeacherService;
//# sourceMappingURL=teacher.service.js.map