import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

interface DiagnosisResult {
  errorPattern: string;
  solution: string;
  critical: boolean;
}

const commonErrors: Array<{
  pattern: RegExp;
  solution: string;
  critical: boolean;
}> = [
  {
    pattern: /ECONNREFUSED|Could not connect to database/,
    solution: 'Verificar conexión a SQLite. Ejecutar: npx prisma migrate reset',
    critical: true
  },
  {
    pattern: /Missing x-tenant-id header/,
    solution: 'Asegurar que el frontend envía el header x-tenant-id en todas las requests',
    critical: true
  },
  {
    pattern: /PrismaClientInitializationError/,
    solution: 'Reiniciar el servidor backend. Ejecutar: npm run build && npm start',
    critical: true
  }
];

export const diagnoseErrors = async (req?: Request): Promise<DiagnosisResult[]> => {
  const lastErrors = await prisma.log.findMany({
    where: {
      level: 'ERROR',
      tenantId: req?.tenant?.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  return lastErrors.flatMap(error => {
    return commonErrors
      .filter(({ pattern }) => pattern.test(error.message))
      .map(({ pattern, solution, critical }) => ({
        errorPattern: pattern.toString(),
        solution,
        critical
      }));
  });
};

export const autoFix = async (diagnosis: DiagnosisResult[]) => {
  const criticalErrors = diagnosis.filter(d => d.critical);
  
  for (const error of criticalErrors) {
    if (error.solution.includes('prisma migrate reset')) {
      try {
        await prisma.$executeRaw`PRAGMA foreign_keys=OFF`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS Log`;
        await prisma.$executeRaw`PRAGMA foreign_keys=ON`;
      } catch (e) {
        console.error('Auto-fix failed:', e);
      }
    }
  }
};
