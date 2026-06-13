/**
 * Structured error class for the application.
 * Carries a machine-readable `code`, a human-readable `message`, and the
 * appropriate HTTP `statusCode`. The `code` survives TanStack Start's
 * superjson serialization so client-side code can branch on it.
 */

export const ErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  INTERNAL: "INTERNAL",
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

const CODE_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.PAYLOAD_TOO_LARGE]: 413,
  [ErrorCode.INTERNAL]: 500,
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number

  constructor(code: ErrorCode, message: string, statusCode?: number) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode ?? CODE_STATUS[code] ?? 500
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    }
  }
}

export function throwError(
  code: ErrorCode,
  message: string,
  statusCode?: number
): never {
  throw new AppError(code, message, statusCode)
}

export function toAppError(err: unknown): AppError | null {
  if (err instanceof AppError) return err
  if (err && typeof err === "object" && "code" in err && "message" in err) {
    return new AppError(
      (err as any).code,
      (err as any).message,
      (err as any).statusCode
    )
  }
  return null
}
