import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import multer from "multer";
import ApiError from "../../utils/apiError";
import ApiResponse from "../../utils/apiResponse";

// AWS S3 Configuration
const s3config = new S3Client({
  region: process.env.AWS_REGION_S3 || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Multer config to store files in memory (as buffer)
const uploadMiddleware = multer({ storage: multer.memoryStorage() }).single(
  "file"
);

// Upload to aws S3
const upload = async (
  req: Request<{}, {}, {}, { bucketName: string }>,
  res: Response
): Promise<void> => {
  try {
    const { bucketName } = req.query;
    if (!bucketName) {
      throw new ApiError(400, {}, "No bucket name provided");
    }
    const file = req.file;
    if (!file) {
      throw new ApiError(400, {}, "No file uploaded");
    }

    const uploadParams = {
      Bucket: bucketName as string,
      Key: `${Date.now()}_${file.originalname.trim().replace(/\s+/g, "_")}`,
      Body: file.buffer,
      ACL: "public-read" as ObjectCannedACL,
    };

    const data = await s3config.send(new PutObjectCommand(uploadParams));

    if (!data) {
      throw new ApiError(500, {}, "Failed to upload file");
    }

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION_S3}.amazonaws.com/${uploadParams.Key}`;

    res
      .status(200)
      .send(new ApiResponse(200, { fileUrl }, "File uploaded successfully"));
  } catch (error) {
    if (error instanceof S3ServiceException) {
      res.status(500).send({ message: "Error uploading file", error });
    } else {
      res.status(500).send({ message: "An unexpected error occurred", error });
    }
  }
};

export { uploadMiddleware, upload };
