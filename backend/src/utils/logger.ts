const logger = {
  info: (message: string, meta?: unknown) =>
    console.log(`[INFO] ${message}`, meta ?? ""),
  error: (message: string, meta?: unknown) =>
    console.error(`[ERROR] ${message}`, meta ?? ""),
  warn: (message: string, meta?: unknown) =>
    console.warn(`[WARN] ${message}`, meta ?? ""),
};

export default logger;