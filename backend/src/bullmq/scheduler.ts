import { Queue, Worker, Job } from 'bullmq';

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

// Queue names
export const QUEUE_NAMES = {
  EXAMPLE_QUEUE: 'example-queue',
} as const;

// Job types
export const JOB_TYPES = {
  EXAMPLE_JOB: 'example-job',
} as const;

