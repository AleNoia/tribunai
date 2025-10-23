type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, action, message, userId, metadata } = entry;
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      action,
      message,
      userId,
      ...metadata,
    });
  }

  info(
    message: string,
    data?: {
      action?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    const entry: LogEntry = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };

    if (this.isDev) {
      console.log(`ℹ️  ${message}`, data?.metadata || "");
    } else {
      console.log(this.formatLog(entry));
    }
  }

  warn(
    message: string,
    data?: {
      action?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    const entry: LogEntry = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };

    if (this.isDev) {
      console.warn(`⚠️  ${message}`, data?.metadata || "");
    } else {
      console.warn(this.formatLog(entry));
    }
  }

  error(
    message: string,
    data?: {
      action?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    const entry: LogEntry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };

    if (this.isDev) {
      console.error(`❌ ${message}`, data?.metadata || "");
    } else {
      console.error(this.formatLog(entry));
    }
  }

  debug(
    message: string,
    data?: {
      action?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    if (!this.isDev) return;

    const entry: LogEntry = {
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };

    console.debug(`🐛 ${message}`, data?.metadata || "");
  }
}

export const logger = new Logger();


