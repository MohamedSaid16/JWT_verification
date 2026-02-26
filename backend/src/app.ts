import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true // مهم للـ cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "University API Running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/auth", authRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;