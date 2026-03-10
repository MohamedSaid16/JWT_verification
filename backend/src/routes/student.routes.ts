import { Router, Response } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/permission.middleware";
import { StudentService } from "../services/student.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const router = Router();
const studentService = new StudentService();

// ==================== PROFILE MANAGEMENT ====================

/**
 * Get current student profile
 */
router.get(
  "/profile",
  authenticate,
  requirePermission('profile:view'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_PROFILE_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Update student profile
 */
router.put(
  "/profile",
  authenticate,
  requirePermission('profile:edit'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "UPDATE_PROFILE_FAILED", message: error.message },
      });
    }
  }
);

// ==================== COURSE MANAGEMENT ====================

/**
 * Get available courses
 */
router.get(
  "/courses/available",
  authenticate,
  requirePermission('courses:view'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_COURSES_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Get enrolled courses
 */
router.get(
  "/courses/enrolled",
  authenticate,
  requirePermission('courses:view'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_COURSES_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Enroll in a course
 */
router.post(
  "/courses/:courseId/enroll",
  authenticate,
  requirePermission('courses:enroll'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "ENROLL_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Drop a course
 */
router.delete(
  "/courses/:courseId/drop",
  authenticate,
  requirePermission('courses:enroll'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "DROP_COURSE_FAILED", message: error.message },
      });
    }
  }
);

// ==================== GRADE MANAGEMENT ====================

/**
 * Get my grades
 */
router.get(
  "/grades",
  authenticate,
  requirePermission('grades:view:own'),
  async (req: AuthRequest, res: Response) => {
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

      const grades = await studentService.getGrades(student.id, semester as string);

      return res.json({
        success: true,
        data: grades,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_GRADES_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Get my GPA
 */
router.get(
  "/grades/gpa",
  authenticate,
  requirePermission('grades:view:own'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_GPA_FAILED", message: error.message },
      });
    }
  }
);

// ==================== PROJECT MANAGEMENT ====================

/**
 * Get my projects
 */
router.get(
  "/projects",
  authenticate,
  requirePermission('projects:view'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_PROJECTS_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Submit project work
 */
router.post(
  "/projects/:projectId/submit",
  authenticate,
  requirePermission('projects:create'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "SUBMIT_PROJECT_FAILED", message: error.message },
      });
    }
  }
);

// ==================== COMPLAINT MANAGEMENT ====================

/**
 * Create a complaint
 */
router.post(
  "/complaints",
  authenticate,
  requirePermission('committee:cases:create'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "CREATE_COMPLAINT_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Get my complaints
 */
router.get(
  "/complaints",
  authenticate,
  requirePermission('committee:cases:view'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_COMPLAINTS_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Get complaint by ID
 */
router.get(
  "/complaints/:complaintId",
  authenticate,
  requirePermission('committee:cases:view'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_COMPLAINT_FAILED", message: error.message },
      });
    }
  }
);

// ==================== SCHEDULE ====================

/**
 * Get my schedule
 */
router.get(
  "/schedule",
  authenticate,
  requirePermission('courses:view'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_SCHEDULE_FAILED", message: error.message },
      });
    }
  }
);

// ==================== STATISTICS ====================

/**
 * Get student statistics
 */
router.get(
  "/stats",
  authenticate,
  requirePermission('profile:view'),
  async (req: AuthRequest, res: Response) => {
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_STATS_FAILED", message: error.message },
      });
    }
  }
);

export default router;