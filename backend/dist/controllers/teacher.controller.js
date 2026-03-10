"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherStats = exports.getCourseGrades = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getMyCourses = exports.updateTeacherProfile = exports.getTeacherProfile = void 0;
const teacher_service_1 = require("../services/teacher.service");
const teacherService = new teacher_service_1.TeacherService();
// ==================== PROFILE MANAGEMENT ====================
const getTeacherProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const teacher = await teacherService.getTeacherByUserId(req.user.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
            });
        }
        return res.json({
            success: true,
            data: teacher,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_PROFILE_FAILED", message: error.message },
        });
    }
};
exports.getTeacherProfile = getTeacherProfile;
const updateTeacherProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { department, title } = req.body;
        const teacher = await teacherService.updateTeacherProfile(req.user.id, {
            department,
            title,
        });
        return res.json({
            success: true,
            data: teacher,
            message: "Profile updated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "UPDATE_PROFILE_FAILED", message: error.message },
        });
    }
};
exports.updateTeacherProfile = updateTeacherProfile;
// ==================== COURSE MANAGEMENT ====================
const getMyCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const teacher = await teacherService.getTeacherByUserId(req.user.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
            });
        }
        const courses = await teacherService.getCourses(teacher.id);
        return res.json({
            success: true,
            data: courses,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_COURSES_FAILED", message: error.message },
        });
    }
};
exports.getMyCourses = getMyCourses;
const createCourse = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { code, name, description, credits, level, semester } = req.body;
        if (!code || !name || !credits) {
            return res.status(400).json({
                success: false,
                error: { code: "MISSING_FIELDS", message: "Code, name, and credits are required" },
            });
        }
        const teacher = await teacherService.getTeacherByUserId(req.user.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
            });
        }
        const course = await teacherService.createCourse(teacher.id, {
            code,
            name,
            description,
            credits,
            level,
            semester,
        });
        return res.status(201).json({
            success: true,
            data: course,
            message: "Course created successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "CREATE_COURSE_FAILED", message: error.message },
        });
    }
};
exports.createCourse = createCourse;
const updateCourse = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        // FIXED: Convert params to strings safely
        const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
        const { name, description, credits, level, semester, isActive } = req.body;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                error: { code: "MISSING_COURSE_ID", message: "Course ID is required" },
            });
        }
        const teacher = await teacherService.getTeacherByUserId(req.user.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
            });
        }
        const course = await teacherService.updateCourse(courseId, teacher.id, {
            name,
            description,
            credits,
            level,
            semester,
            isActive,
        });
        return res.json({
            success: true,
            data: course,
            message: "Course updated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "UPDATE_COURSE_FAILED", message: error.message },
        });
    }
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        // FIXED: Convert param to string safely
        const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                error: { code: "MISSING_COURSE_ID", message: "Course ID is required" },
            });
        }
        const teacher = await teacherService.getTeacherByUserId(req.user.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
            });
        }
        await teacherService.deleteCourse(courseId, teacher.id);
        return res.json({
            success: true,
            message: "Course deleted successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "DELETE_COURSE_FAILED", message: error.message },
        });
    }
};
exports.deleteCourse = deleteCourse;
// ==================== GRADE MANAGEMENT ====================
const getCourseGrades = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        // FIXED: Convert param to string safely
        const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                error: { code: "MISSING_COURSE_ID", message: "Course ID is required" },
            });
        }
        const teacher = await teacherService.getTeacherByUserId(req.user.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
            });
        }
        const grades = await teacherService.getCourseGrades(courseId, teacher.id);
        return res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_GRADES_FAILED", message: error.message },
        });
    }
};
exports.getCourseGrades = getCourseGrades;
// ==================== STATISTICS ====================
const getTeacherStats = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const teacher = await teacherService.getTeacherByUserId(req.user.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
            });
        }
        const stats = await teacherService.getTeacherStats(teacher.id);
        return res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_STATS_FAILED", message: error.message },
        });
    }
};
exports.getTeacherStats = getTeacherStats;
//# sourceMappingURL=teacher.controller.js.map