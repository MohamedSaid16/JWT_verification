import { Router, Response } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/permission.middleware";
import { TeacherService } from "../services/teacher.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const router = Router();
const teacherService = new TeacherService();

// ==================== PROFILE MANAGEMENT ====================

/**
 * Get current teacher profile
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_PROFILE_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Update teacher profile
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
 * Get my courses
 */
router.get(
  "/courses",
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_COURSES_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Create a new course
 */
router.post(
  "/courses",
  authenticate,
  requirePermission('courses:create'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { code, name, description, credits, level, semester, schedule, departmentId, specialiteId } = req.body;

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
        schedule,
        departmentId,
        specialiteId,
      });

      return res.status(201).json({
        success: true,
        data: course,
        message: "Course created successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "CREATE_COURSE_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Update a course
 */
router.put(
  "/courses/:courseId",
  authenticate,
  requirePermission('courses:edit'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { courseId } = req.params;
      const { name, description, credits, level, semester, schedule, isActive } = req.body;

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
        schedule,
        isActive,
      });

      return res.json({
        success: true,
        data: course,
        message: "Course updated successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "UPDATE_COURSE_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Delete a course
 */
router.delete(
  "/courses/:courseId",
  authenticate,
  requirePermission('courses:delete'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { courseId } = req.params;

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
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "DELETE_COURSE_FAILED", message: error.message },
      });
    }
  }
);

// ==================== STUDENT MANAGEMENT ====================

/**
 * Get all students in my courses
 */
router.get(
  "/students",
  authenticate,
  requirePermission('users:view'),
  async (req: AuthRequest, res: Response) => {
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

      const students = await teacherService.getStudents(teacher.id);

      return res.json({
        success: true,
        data: students,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_STUDENTS_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Get students by course
 */
router.get(
  "/courses/:courseId/students",
  authenticate,
  requirePermission('users:view'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { courseId } = req.params;

      const teacher = await teacherService.getTeacherByUserId(req.user.id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
        });
      }

      const students = await teacherService.getStudentsByCourse(courseId, teacher.id);

      return res.json({
        success: true,
        data: students,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_STUDENTS_FAILED", message: error.message },
      });
    }
  }
);

// ==================== GRADE MANAGEMENT ====================

/**
 * Enter grades for a course
 */
router.post(
  "/courses/:courseId/grades",
  authenticate,
  requirePermission('grades:enter'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { courseId } = req.params;
      const { grades } = req.body;

      if (!grades || !Array.isArray(grades) || grades.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_INPUT", message: "Grades array is required" },
        });
      }

      const teacher = await teacherService.getTeacherByUserId(req.user.id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
        });
      }

      const formattedGrades = grades.map(g => ({
        ...g,
        courseId,
      }));

      const results = await teacherService.enterGrades(teacher.id, formattedGrades);

      return res.status(201).json({
        success: true,
        data: results,
        message: "Grades entered successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "ENTER_GRADES_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Get grades for a course
 */
router.get(
  "/courses/:courseId/grades",
  authenticate,
  requirePermission('grades:view:all'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { courseId } = req.params;

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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_GRADES_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Get grade statistics for a course
 */
router.get(
  "/courses/:courseId/grades/stats",
  authenticate,
  requirePermission('grades:view:all'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { courseId } = req.params;

      const teacher = await teacherService.getTeacherByUserId(req.user.id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
        });
      }

      const stats = await teacherService.getCourseGradeStats(courseId, teacher.id);

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

// ==================== PROJECT MANAGEMENT ====================

/**
 * Get supervised projects
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

      const teacher = await teacherService.getTeacherByUserId(req.user.id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
        });
      }

      const projects = await teacherService.getSupervisedProjects(teacher.id);

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
 * Create a new project (PFE)
 */
router.post(
  "/projects",
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

      const { title, description, type, year, specialiteId, maxStudents, deadline } = req.body;

      if (!title || !description || !type || !year) {
        return res.status(400).json({
          success: false,
          error: { code: "MISSING_FIELDS", message: "Title, description, type, and year are required" },
        });
      }

      const teacher = await teacherService.getTeacherByUserId(req.user.id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
        });
      }

      const project = await teacherService.createProject(teacher.id, {
        title,
        description,
        type,
        year,
        specialiteId,
        maxStudents,
        deadline: deadline ? new Date(deadline) : undefined,
      });

      return res.status(201).json({
        success: true,
        data: project,
        message: "Project created successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "CREATE_PROJECT_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Update project status
 */
router.patch(
  "/projects/:projectId/status",
  authenticate,
  requirePermission('projects:edit'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { projectId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: { code: "MISSING_FIELDS", message: "Status is required" },
        });
      }

      const teacher = await teacherService.getTeacherByUserId(req.user.id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
        });
      }

      const project = await teacherService.updateProjectStatus(projectId, teacher.id, status);

      return res.json({
        success: true,
        data: project,
        message: "Project status updated successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "UPDATE_PROJECT_FAILED", message: error.message },
      });
    }
  }
);

/**
 * Grade a project submission
 */
router.post(
  "/projects/:projectId/students/:studentId/grade",
  authenticate,
  requirePermission('projects:supervise'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { projectId, studentId } = req.params;
      const { grade, feedback } = req.body;

      if (grade === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: "MISSING_FIELDS", message: "Grade is required" },
        });
      }

      const teacher = await teacherService.getTeacherByUserId(req.user.id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
        });
      }

      const result = await teacherService.gradeProject(projectId, studentId, teacher.id, {
        grade,
        feedback,
      });

      return res.json({
        success: true,
        data: result,
        message: "Project graded successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: "GRADE_PROJECT_FAILED", message: error.message },
      });
    }
  }
);

// ==================== SCHEDULE ====================

/**
 * Get teacher schedule
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

      const teacher = await teacherService.getTeacherByUserId(req.user.id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: { code: "TEACHER_NOT_FOUND", message: "Teacher profile not found" },
        });
      }

      const schedule = await teacherService.getSchedule(teacher.id);

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
 * Get teacher statistics
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: "FETCH_STATS_FAILED", message: error.message },
      });
    }
  }
);

export default router;