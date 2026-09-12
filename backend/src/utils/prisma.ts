import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';

export const prisma = new PrismaClient();
