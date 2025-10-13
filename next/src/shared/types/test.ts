import { User } from "./auth";

export interface Test {
    id?: number;
    title: string;
    description?: string;
    timeLimit?: number;
    status: "draft" | "active" | "completed";
    // questions: Question[];
    creator?: User;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTestData {
    title: string;
    description?: string;
    timeLimit?: number;
    // questions: Question[];
}
