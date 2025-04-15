import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

interface LogData {
  level: LogLevel;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  tenantId?: string;
}

export const logToDb = async (data: LogData) => {
  try {
    await prisma.log.create({
      data: {
        level: data.level,
        message: data.message,
        stack: data.stack,
        context: data.context ? JSON.stringify(data.context) : undefined,
        tenantId: data.tenantId
      }
    });
  } catch (error) {
    console.error('Failed to log to database:', error);
  }
};

export const errorHandler = (err: Error, req?: Request, res?: Response) => {
  const logData: LogData = {
    level: 'ERROR',
    message: err.message,
    stack: err.stack,
    context: {
      path: req?.path,
      method: req?.method,
      params: req?.params,
      query: req?.query
    },
    tenantId: req?.tenant?.id
  };

  logToDb(logData);
  
  if (res) {
    res.status(500).json({ 
      error: 'Internal Server Error',
      referenceId: Date.now() 
    });
  }
};
