import multer from "multer";
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "@DeparkHackaton/shared";
import { AppError } from "@utils/app-error.js";
import { ALLOWED_IMAGE_TYPES } from "@controllers/plan-analysis-controller.js";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// memoryStorage keeps the file as a Buffer on req.file, nothing is written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return callback(null, true);
    callback(
      AppError.from({
        message: `Unsupported image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        httpStatusCode: HttpStatusCode.UNSUPPORTED_MEDIA_TYPE,
      }),
    );
  },
});

const singleImage = upload.single("image");

// Reads the multipart field "image" into req.file and maps multer errors to AppError.
export function uploadImage(req: Request, res: Response, next: NextFunction) {
  singleImage(req, res, (err?: unknown) => {
    if (!(err instanceof multer.MulterError)) return next(err);

    next(
      err.code === "LIMIT_FILE_SIZE"
        ? AppError.from({
            message: `Image is too large (max ${MAX_IMAGE_BYTES / 1024 / 1024} MB)`,
            httpStatusCode: HttpStatusCode.PAYLOAD_TOO_LARGE,
          })
        : AppError.badRequest(
            err.code === "LIMIT_UNEXPECTED_FILE"
              ? 'Send exactly one file in the "image" field'
              : err.message,
          ),
    );
  });
}
