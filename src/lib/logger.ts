type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLogLevel];
}

function formatLog(entry: LogEntry): string {
  const { level, message, timestamp, meta } = entry;
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function createLogEntry(level: LogLevel, message: string, meta?: Record<string, any>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    meta,
  };
}

function log(level: LogLevel, message: string, meta?: Record<string, any>): void {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, meta);
  const formatted = formatLog(entry);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

const logger = {
  debug: (message: string, meta?: Record<string, any>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, any>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, any>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, any>) => log('error', message, meta),
};

export default logger;

// Convenience exports
export const logInfo = logger.info;
export const logError = logger.error;
export const logWarn = logger.warn;
export const logDebug = logger.debug;

/**
 * Log API request
 */
export function logApiRequest(
  method: string,
  url: string,
  userId?: string,
  meta?: Record<string, any>
) {
  logger.info(`API Request: ${method} ${url}`, {
    method,
    url,
    userId,
    ...meta,
  });
}

/**
 * Log API response
 */
export function logApiResponse(
  method: string,
  url: string,
  statusCode: number,
  durationMs: number,
  meta?: Record<string, any>
) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  log(level, `API Response: ${method} ${url} ${statusCode} (${durationMs}ms)`, {
    method,
    url,
    statusCode,
    durationMs,
    ...meta,
  });
}

/**
 * Log error with stack trace
 */
export function logErrorWithStack(message: string, error: Error, meta?: Record<string, any>) {
  logger.error(message, {
    error: error.message,
    stack: error.stack,
    ...meta,
  });
}
