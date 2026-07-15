import type { Response } from "express";
import type { ZodError } from "zod";

export function validationErrors(res: Response, error: ZodError): void {
    res.status(400).json({
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        })),
    });
}
