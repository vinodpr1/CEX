import type { ZodError } from "zod";
import type { Response } from "express";

export function validationErrors(res: Response, errors: ZodError): void {
    res.status(400).json({
        error: "validation_error",
        issues: errors.issues.map((issue)=>({
            path: issue.path.join("."),
            message: issue.message
        }))
    })
}