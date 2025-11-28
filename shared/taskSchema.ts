import { z } from "zod";

// Task creation schema
export const insertTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().optional(),
    scheduledTime: z.date(),
    duration: z.number().int().positive().optional(), // in minutes
    xpReward: z.number().int().min(10).max(500).default(50),
});

// Task update schema
export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    scheduledTime: z.date().optional(),
    duration: z.number().int().positive().optional(),
    completed: z.boolean().optional(),
    xpReward: z.number().int().min(10).max(500).optional(),
});

// Task type
export type Task = {
    id: string; // Firebase uses string document IDs
    userId: string;
    title: string;
    description?: string;
    scheduledTime: Date;
    duration?: number;
    completed: boolean;
    notificationSent: boolean;
    xpReward: number;
    createdAt: Date;
    updatedAt: Date;
};

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
