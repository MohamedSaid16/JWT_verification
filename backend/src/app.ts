import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import logger from "./utils/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "University API Running",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;