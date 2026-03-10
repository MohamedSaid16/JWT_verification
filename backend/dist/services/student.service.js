"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const database_1 = __importDefault(require("../config/database"));
class StudentService {
    asString(value) {
        return Array.isArray(value) ? value[0] : value;
    }
    async getStudentByUserId(userId) {
        return database_1.default.student.findUnique({
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
    async getStudentByStudentId(studentId) {
        return database_1.default.student.findUnique({ where: { studentId }, include: { user: true } });
    }
    async upsertStudentProfile(userId, data) {
        return database_1.default.student.upsert({
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
    async updateStudentProfile(userId, data) {
        return database_1.default.student.update({
            where: { userId },
            data: {
                level: data.level,
                group: data.group,
                department: data.departmentId,
                specialite: data.specialiteId,
            },
        });
    }
    async getAvailableCourses(_studentId) {
        return [];
    }
    async enrollInCourse(studentId, courseId) {
        const normalizedCourseId = this.asString(courseId);
        return {
            id: `${studentId}:${normalizedCourseId}`,
            studentId,
            courseId: normalizedCourseId,
            status: "UNAVAILABLE",
            message: "Course enrollment is not available with the current schema",
        };
    }
    async dropCourse(_studentId, _courseId) {
        return { dropped: false, message: "Course enrollment is not available with the current schema" };
    }
    async getEnrolledCourses(_studentId) {
        return [];
    }
    async getGrades(_studentId, _semester) {
        return [];
    }
    async getGPA(_studentId) {
        return 0;
    }
    async getProjects(_studentId) {
        return [];
    }
    async submitProject(studentId, projectId, data) {
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
    async createComplaint(studentId, data) {
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
    async getComplaints(_studentId) {
        return [];
    }
    async getComplaintById(_complaintId, _studentId) {
        return null;
    }
    async getSchedule(_studentId) {
        return [];
    }
    async getStudentStats(_studentId) {
        return {
            enrolledCourses: 0,
            completedCourses: 0,
            totalProjects: 0,
            gpa: 0,
            complaints: 0,
        };
    }
}
exports.StudentService = StudentService;
//# sourceMappingURL=student.service.js.map