import { NextResponse } from "next/server";

/**
 * Shared API route utilities for consistent request handling and error responses.
 */

export type ApiErrorResponse = {
  success: false;
  reason: string;
  detail?: string;
  error?: string;
};

export type ApiSuccessResponse<T = Record<string, unknown>> = {
  success: true;
} & T;

/**
 * Safely parse the JSON body of a request.
 * Returns the parsed body or null if parsing fails.
 */
export async function parseRequestBody<T = Record<string, unknown>>(
  req: Request
): Promise<T | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/**
 * Create a standardized error response.
 */
export function apiError(
  reason: string,
  status: number,
  detail?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false as const, reason, ...(detail ? { detail } : {}) },
    { status }
  );
}

/**
 * Create a standardized success response.
 */
export function apiSuccess<T extends Record<string, unknown>>(
  data?: T
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true as const,
    ...(data || ({} as T)),
  });
}

/**
 * Validate that all required fields are present in the body.
 * Returns an error response if any are missing, or null if all are present.
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  fields: string[]
): NextResponse<ApiErrorResponse> | null {
  const missing = fields.filter((f) => !body[f]);
  if (missing.length > 0) {
    return apiError(
      `Missing required fields: ${missing.join(", ")}`,
      400
    );
  }
  return null;
}

/**
 * Retrieve and validate Razorpay credentials from environment variables.
 * Returns the credentials or an error response.
 */
export function getRazorpayCredentials(): {
  keyId: string;
  keySecret: string;
} | NextResponse<ApiErrorResponse> {
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret || !keyId.startsWith("rzp_")) {
    console.error("[RAZORPAY] Environment anomaly: Missing or invalid keys.");
    return apiError("Internal configuration error.", 503);
  }

  return { keyId, keySecret };
}

/**
 * Type guard to check if getRazorpayCredentials returned an error response.
 */
export function isApiErrorResponse(
  result: { keyId: string; keySecret: string } | NextResponse<ApiErrorResponse>
): result is NextResponse<ApiErrorResponse> {
  return result instanceof NextResponse;
}

/**
 * Wrap an API handler with standard error catching and logging.
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<NextResponse>,
  logPrefix: string
) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (err: unknown) {
      console.error(`[${logPrefix}]`, err);
      return apiError("Internal server error.", 500);
    }
  };
}
