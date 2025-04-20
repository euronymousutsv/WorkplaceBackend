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
import { v4 as uuidv4 } from "uuid";

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

export const uploadBase64ToS3 = async (
  base64String: string,
  bucketName: string
) => {
  try {
    // Remove data URI prefix if exists
    const cleanedBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanedBase64, "base64");

    const fileName = `images/${uuidv4()}.jpg`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: "image/png",
    };

    await s3config.send(new PutObjectCommand(uploadParams));

    // Return the public URL (if the bucket/object is public)
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
    return imageUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export { uploadMiddleware, upload };
