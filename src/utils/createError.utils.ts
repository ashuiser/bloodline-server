import AppError from "./AppError.utils.js";

const ERRORS = {
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "The specified user was not found.",
    statusCode: 404,
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Some properties in the body are missing or have wrong type.",
    statusCode: 400,
  },
  FAILED_TO_CREATE: {
    code: "FAILED_TO_CREATE",
    message: "Failed to create entry in database.",
    statusCode: 500,
  },
  BAD_REQUEST: {
    code: "BAD_REQUEST",
    message: "The request was malformed or invalid.",
    statusCode: 400,
  },
  CONFLICT: {
    code: "CONFLICT",
    message: "Resource already exists.",
    statusCode: 409,
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Invalid credentials.",
    statusCode: 401,
  },
};

type TCreateErrorParams = {
  code: keyof typeof ERRORS;
  message?: string;
  statusCode?: number;
  details?: unknown;
};

export default function createError({
  code,
  message,
  statusCode,
  details,
}: TCreateErrorParams) {
  const errorCreator = ERRORS[code];
  if (!errorCreator) {
    throw new Error(`Error code '${code}' is not defined.`);
  }
  return new AppError({
    code: errorCreator.code,
    message: message || errorCreator.message,
    statusCode: statusCode || errorCreator.statusCode,
    details,
  });
}
