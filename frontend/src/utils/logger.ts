import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

interface LogData {
  level: LogLevel;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export const logError = (error: Error, context?: Record<string, unknown>) => {
  const logData: LogData = {
    level: 'ERROR',
    message: error.message,
    stack: error.stack,
    context
  };

  // Send to backend
  axios.post('/api/logs', logData).catch(() => {
    console.error('Failed to send log to server', logData);
  });

  // Also log to console for development
  console.error(error);
};

// Window error handler
window.onerror = (message, source, lineno, colno, error) => {
  logError(error || new Error(String(message)), {
    source,
    lineno,
    colno
  });
};

// Unhandled promise rejections
window.onunhandledrejection = (event) => {
  logError(event.reason, {
    type: 'unhandledrejection'
  });
};
