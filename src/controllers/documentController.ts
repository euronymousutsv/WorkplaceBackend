import { Employee } from "../models/employeeModel";
import Document from "../models/documentModel";
import { Request, Response } from "express";
import { Op } from "sequelize";
import moment from "moment";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";

// Type for document creation request
interface CreateDocumentRequest {
  employeeId: string;
  documentType: "License" | "National ID";
  documentid: number;
  issueDate: string;
  expiryDate: string;
  docsURL?: string;
  isVerified?: boolean;
}

// Function to Generate list of Workers with Expired Documents
export const getWorkersWithExpiredDocuments = async (
  req: Request,
  res: Response
) => {
  try {
    const currentDate = new Date();

    const expiredDocuments = await Document.findAll({
      where: {
        expiryDate: { [Op.lt]: currentDate },
      },
      include: [
        {
          model: Employee,
          attributes: ["id", "firstName", "lastName", "phoneNumber"],
        },
      ],
    });

    if (!expiredDocuments.length) {
       res.status(200).json(
        new ApiResponse(200, [], "No expired documents found")
      );return;
    }

    const grouped = expiredDocuments.reduce((acc, doc) => {
      const employee = doc.Employee;
      if (!employee) return acc;
      if (!acc[employee.id]) {
        acc[employee.id] = {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          contactNumber: employee.phoneNumber,
          expiredDocuments: [],
        };
      }
      acc[employee.id].expiredDocuments.push({
        ...doc.toJSON(),
        expiryDate: moment(doc.expiryDate).format("YYYY-MM-DD"),
      });
      return acc;
    }, {} as Record<string, any>);

    res.status(200).json(
      new ApiResponse(200, Object.values(grouped), "Expired documents retrieved successfully")
    );
  } catch (error) {
    console.error("Error fetching expired documents:", error);
    res.status(500).json(
      new ApiError(500, {}, "Failed to fetch expired documents")
    );
  }
};

// Get workers with documents expiring in the next X days
export const getWorkersWithExpiringDocuments = async (
  req: Request,
  res: Response
) => {
  try {
    const { days } = req.query;
    const parsedDays = parseInt(days as string);
    
    if (!parsedDays || isNaN(parsedDays) || parsedDays <= 0) {
      throw new ApiError(400, {}, "Please provide a valid number of days greater than 0");
    }

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + parsedDays);

    const documents = await Document.findAll({
      where: {
        expiryDate: {
          [Op.between]: [currentDate, futureDate],
        },
      },
      include: [
        {
          model: Employee,
          attributes: ["id", "firstName", "lastName", "phoneNumber"],
        },
      ],
    });

    const grouped = documents.reduce((acc, doc) => {
      const employee = doc.Employee;
      if (!employee) return acc;
      const daysLeft = moment(doc.expiryDate).diff(moment(currentDate), "days");
      if (!acc[employee.id]) {
        acc[employee.id] = {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          contactNumber: employee.phoneNumber,
          expiringDocuments: [],
        };
      }
      acc[employee.id].expiringDocuments.push({
        ...doc.toJSON(),
        expiryDate: moment(doc.expiryDate).format("YYYY-MM-DD"),
        daysLeft,
      });
      return acc;
    }, {} as Record<string, any>);

    res.status(200).json(
      new ApiResponse(200, Object.values(grouped), "Expiring documents retrieved successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("Error fetching expiring documents:", error);
      res.status(500).json(
        new ApiError(500, {}, "Failed to fetch expiring documents")
      );
    }
  }
};

// Get document statistics
export const getDocumentStatistics = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

    const documents = await Document.findAll();

    const totalDocuments = documents.length;
    const expiredDocuments = documents.filter(
      (doc) => new Date(doc.expiryDate) < currentDate
    ).length;
    const expiringDocuments = documents.filter(
      (doc) =>
        new Date(doc.expiryDate) >= currentDate &&
        new Date(doc.expiryDate) <= thirtyDaysFromNow
    ).length;

    const expiredPercentage =
      totalDocuments > 0
        ? ((expiredDocuments / totalDocuments) * 100).toFixed(2)
        : "0.00";

    res.status(200).json(
      new ApiResponse(200, {
        totalDocuments,
        expiredDocuments,
        expiringDocuments,
        expiredPercentage,
      }, "Document statistics retrieved successfully")
    );
  } catch (error) {
    console.error("Error fetching document statistics:", error);
    res.status(500).json(
      new ApiError(500, {}, "Failed to fetch document statistics")
    );
  }
};

// Create a new document
export const createDocument = async (req: Request, res: Response) => {
  try {
    const { employeeId, documentType, documentid, issueDate, expiryDate, docsURL, isVerified } =
      req.body as CreateDocumentRequest;

    // Validate required fields with specific error messages
    const missingFields = [];
    if (!employeeId) missingFields.push('employeeId');
    if (!documentType) missingFields.push('documentType');
    if (!documentid) missingFields.push('documentid');
    if (!issueDate) missingFields.push('issueDate');
    if (!expiryDate) missingFields.push('expiryDate');

    if (missingFields.length > 0) {
      throw new ApiError(400, { missingFields }, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate document type
    if (!["License", "National ID"].includes(documentType)) {
      throw new ApiError(400, { documentType }, `Invalid document type: ${documentType}. Must be either 'License' or 'National ID'`);
    }

    // Validate dates
    const issueDateObj = new Date(issueDate);
    const expiryDateObj = new Date(expiryDate);
    
    if (isNaN(issueDateObj.getTime())) {
      throw new ApiError(400, { issueDate }, `Invalid issue date format: ${issueDate}`);
    }

    if (isNaN(expiryDateObj.getTime())) {
      throw new ApiError(400, { expiryDate }, `Invalid expiry date format: ${expiryDate}`);
    }

    if (expiryDateObj <= issueDateObj) {
      throw new ApiError(400, { issueDate, expiryDate }, 'Expiry date must be after issue date');
    }

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw new ApiError(404, { employeeId }, `Employee not found with ID: ${employeeId}`);
    }

    // Validate document ID is a number
    if (isNaN(Number(documentid))) {
      throw new ApiError(400, { documentid }, `Invalid document ID format: ${documentid}. Must be a number`);
    }

    const newDocument = await Document.create({
      employeeId,
      documentType,
      documentid: Number(documentid),
      issueDate: issueDateObj,
      expiryDate: expiryDateObj,
      docsURL: docsURL || "",
      isVerified: isVerified || false,
    });

    res.status(201).json(
      new ApiResponse(201, newDocument, "Document created successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("Error creating document:", error);
      res.status(500).json(
        new ApiError(500, {}, "Failed to create document")
      );
    }
  }
};

// Update document
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { documentType, documentid, issueDate, expiryDate, docsURL, isVerified } = req.body;

    // Find the document
    const document = await Document.findByPk(id);
    if (!document) {
      throw new ApiError(404, { documentId: id }, `Document not found with ID: ${id}`);
    }

    // Validate document type if provided
    if (documentType && !["License", "National ID"].includes(documentType)) {
      throw new ApiError(400, { documentType }, `Invalid document type: ${documentType}. Must be either 'License' or 'National ID'`);
    }

    // Validate dates if provided
    if (issueDate && expiryDate) {
      const issueDateObj = new Date(issueDate);
      const expiryDateObj = new Date(expiryDate);
      
      if (isNaN(issueDateObj.getTime())) {
        throw new ApiError(400, { issueDate }, `Invalid issue date format: ${issueDate}`);
      }

      if (isNaN(expiryDateObj.getTime())) {
        throw new ApiError(400, { expiryDate }, `Invalid expiry date format: ${expiryDate}`);
      }

      if (expiryDateObj <= issueDateObj) {
        throw new ApiError(400, { issueDate, expiryDate }, 'Expiry date must be after issue date');
      }
    }

    // Validate document ID if provided
    if (documentid && isNaN(Number(documentid))) {
      throw new ApiError(400, { documentid }, `Invalid document ID format: ${documentid}. Must be a number`);
    }

    // Update document fields
    await document.update({
      documentType: documentType ?? document.documentType,
      documentid: documentid ? Number(documentid) : document.documentid,
      issueDate: issueDate ? new Date(issueDate) : document.issueDate,
      expiryDate: expiryDate ? new Date(expiryDate) : document.expiryDate,
      docsURL: docsURL ?? document.docsURL,
      isVerified: isVerified ?? document.isVerified,
    });

    res.status(200).json(
      new ApiResponse(200, document, "Document updated successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("Error updating document:", error);
      res.status(500).json(
        new ApiError(500, {}, "Failed to update document")
      );
    }
  }
};

export default {
  getWorkersWithExpiredDocuments,
  getWorkersWithExpiringDocuments,
  getDocumentStatistics,
  createDocument,
  updateDocument,
};
