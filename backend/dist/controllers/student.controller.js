"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentStats = exports.getMySchedule = exports.getComplaintById = exports.getMyComplaints = exports.createComplaint = exports.submitProject = exports.getMyProjects = exports.getMyGPA = exports.getMyGrades = exports.dropCourse = exports.enrollInCourse = exports.getEnrolledCourses = exports.getAvailableCourses = exports.updateStudentProfile = exports.getStudentProfile = void 0;
const student_service_1 = require("../services/student.service");
const studentService = new student_service_1.StudentService();
// ==================== PROFILE MANAGEMENT ====================
/**
 * Get current student profile
 */
const getStudentProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        return res.json({
            success: true,
            data: student,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_PROFILE_FAILED", message: error.message },
        });
    }
};
exports.getStudentProfile = getStudentProfile;
/**
 * Update student profile
 */
const updateStudentProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { level, group, departmentId, specialiteId } = req.body;
        const student = await studentService.updateStudentProfile(req.user.id, {
            level,
            group,
            departmentId,
            specialiteId,
        });
        return res.json({
            success: true,
            data: student,
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
exports.updateStudentProfile = updateStudentProfile;
// ==================== COURSE MANAGEMENT ====================
/**
 * Get available courses
 */
const getAvailableCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const courses = await studentService.getAvailableCourses(req.user.id);
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
exports.getAvailableCourses = getAvailableCourses;
/**
 * Get enrolled courses
 */
const getEnrolledCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const courses = await studentService.getEnrolledCourses(student.id);
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
exports.getEnrolledCourses = getEnrolledCourses;
/**
 * Enroll in a course
 */
const enrollInCourse = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { courseId } = req.params;
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const enrollment = await studentService.enrollInCourse(student.id, courseId);
        return res.status(201).json({
            success: true,
            data: enrollment,
            message: "Successfully enrolled in course",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "ENROLL_FAILED", message: error.message },
        });
    }
};
exports.enrollInCourse = enrollInCourse;
/**
 * Drop a course
 */
const dropCourse = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { courseId } = req.params;
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        await studentService.dropCourse(student.id, courseId);
        return res.json({
            success: true,
            message: "Course dropped successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "DROP_COURSE_FAILED", message: error.message },
        });
    }
};
exports.dropCourse = dropCourse;
// ==================== GRADE MANAGEMENT ====================
/**
 * Get my grades
 */
const getMyGrades = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { semester } = req.query;
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const grades = await studentService.getGrades(student.id, semester);
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
exports.getMyGrades = getMyGrades;
/**
 * Get my GPA
 */
const getMyGPA = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const gpa = await studentService.getGPA(student.id);
        return res.json({
            success: true,
            data: { gpa },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_GPA_FAILED", message: error.message },
        });
    }
};
exports.getMyGPA = getMyGPA;
// ==================== PROJECT MANAGEMENT ====================
/**
 * Get my projects
 */
const getMyProjects = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const projects = await studentService.getProjects(student.id);
        return res.json({
            success: true,
            data: projects,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_PROJECTS_FAILED", message: error.message },
        });
    }
};
exports.getMyProjects = getMyProjects;
/**
 * Submit project work
 */
const submitProject = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { projectId } = req.params;
        const { title, description, fileUrl } = req.body;
        if (!title || !fileUrl) {
            return res.status(400).json({
                success: false,
                error: { code: "MISSING_FIELDS", message: "Title and fileUrl are required" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const submission = await studentService.submitProject(student.id, projectId, {
            title,
            description,
            fileUrl,
        });
        return res.status(201).json({
            success: true,
            data: submission,
            message: "Project submitted successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "SUBMIT_PROJECT_FAILED", message: error.message },
        });
    }
};
exports.submitProject = submitProject;
// ==================== COMPLAINT MANAGEMENT ====================
/**
 * Create a complaint
 */
const createComplaint = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { title, description, category, priority } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                error: { code: "MISSING_FIELDS", message: "Title, description, and category are required" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const complaint = await studentService.createComplaint(student.id, {
            title,
            description,
            category,
            priority,
        });
        return res.status(201).json({
            success: true,
            data: complaint,
            message: "Complaint submitted successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "CREATE_COMPLAINT_FAILED", message: error.message },
        });
    }
};
exports.createComplaint = createComplaint;
/**
 * Get my complaints
 */
const getMyComplaints = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const complaints = await studentService.getComplaints(student.id);
        return res.json({
            success: true,
            data: complaints,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_COMPLAINTS_FAILED", message: error.message },
        });
    }
};
exports.getMyComplaints = getMyComplaints;
/**
 * Get complaint by ID
 */
const getComplaintById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { complaintId } = req.params;
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const complaint = await studentService.getComplaintById(complaintId, student.id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: { code: "COMPLAINT_NOT_FOUND", message: "Complaint not found" },
            });
        }
        return res.json({
            success: true,
            data: complaint,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_COMPLAINT_FAILED", message: error.message },
        });
    }
};
exports.getComplaintById = getComplaintById;
// ==================== SCHEDULE ====================
/**
 * Get my schedule
 */
const getMySchedule = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const schedule = await studentService.getSchedule(student.id);
        return res.json({
            success: true,
            data: schedule,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_SCHEDULE_FAILED", message: error.message },
        });
    }
};
exports.getMySchedule = getMySchedule;
// ==================== STATISTICS ====================
/**
 * Get student statistics
 */
const getStudentStats = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const student = await studentService.getStudentByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: { code: "STUDENT_NOT_FOUND", message: "Student profile not found" },
            });
        }
        const stats = await studentService.getStudentStats(student.id);
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
exports.getStudentStats = getStudentStats;
//# sourceMappingURL=student.controller.js.map