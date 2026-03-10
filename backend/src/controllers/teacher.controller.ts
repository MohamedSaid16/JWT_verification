import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { TeacherService } from "../services/teacher.service";

const teacherService = new TeacherService();

// ==================== PROFILE MANAGEMENT ====================

export const getTeacherProfile = async (req: AuthRequest, res: Response) => {
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
};

export const updateTeacherProfile = async (req: AuthRequest, res: Response) => {
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
};

// ==================== COURSE MANAGEMENT ====================

export const getMyCourses = async (req: AuthRequest, res: Response) => {
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
};

export const createCourse = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: { code: "CREATE_COURSE_FAILED", message: error.message },
    });
  }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: { code: "UPDATE_COURSE_FAILED", message: error.message },
    });
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: { code: "DELETE_COURSE_FAILED", message: error.message },
    });
  }
};

// ==================== GRADE MANAGEMENT ====================

export const getCourseGrades = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_GRADES_FAILED", message: error.message },
    });
  }
};

// ==================== STATISTICS ====================

export const getTeacherStats = async (req: AuthRequest, res: Response) => {
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
};