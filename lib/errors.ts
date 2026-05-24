import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export class ValidationAppError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationAppError";
  }
}

export class NotFoundAppError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundAppError";
  }
}

export class ConflictAppError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictAppError";
  }
}

export class GoneAppError extends AppError {
  constructor(message: string) {
    super(message, 410);
    this.name = "GoneAppError";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Request body contains invalid JSON." },
      { status: 400 }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: error.flatten()
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  console.error("Unhandled API error:", error);

  return NextResponse.json(
    { error: "Internal server error." },
    { status: 500 }
  );
}
