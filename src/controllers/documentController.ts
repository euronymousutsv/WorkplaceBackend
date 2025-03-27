import { Employee } from "../models/employeeModel";
import Document from "../models/documentModel";
import { Request, Response } from "express";
import { Op } from "sequelize";
import moment from "moment";

// Function to Generate list of Workers with Expired Documents Which is Called in Dashboard Component for the brief Overview of the Expired Documents.
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
          attributes: ["id", "name", "contactNumber"],
        },
      ],
    });

    if (!expiredDocuments.length) {
      res.status(200).json([]);
      return;
    }

    const grouped = expiredDocuments.reduce((acc, doc) => {
      const employee = doc.Employee;
      if (!employee) return acc;
      if (!acc[employee.id]) {
        acc[employee.id] = {
          id: employee.id,
          name: employee.firstName,
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

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.error("Error fetching expired documents:", error);
    res.status(500).json({ error: "Failed to fetch expired documents" });
  }
};

// Get workers with documents expiring in the next 30 days
export const getWorkersWithExpiringDocuments = async (
  req: Request,
  res: Response
) => {
  try {
    const { days } = req.query;
    const parsedDays = parseInt(days as string);
    if (!parsedDays || isNaN(parsedDays)) {
      res.status(400).json({ error: "Please provide a valid number of days." });
      return;
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
          attributes: ["id", "name", "contactNumber"],
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
          name: employee.firstName + " " + employee.lastName,
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

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.error("Error fetching expiring documents:", error);
    res.status(500).json({ error: "Failed to fetch expiring documents" });
  }
};

// Get all workers or filter by role and document type
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

    res.status(200).json({
      totalDocuments,
      expiredDocuments,
      expiringDocuments,
      expiredPercentage,
    });
  } catch (error) {
    console.error("Error fetching document statistics:", error);
    res.status(500).json({ error: "Failed to fetch document statistics" });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { employeeId, documentType, documentid, issueDate, expiryDate } =
      req.body;

    // Optional: Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const newDocument = await Document.create({
      employeeId,
      documentType,
      documentid,
      issueDate,
      expiryDate,
    });

    res.status(201).json(newDocument);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
};

module.exports = {
  createDocument,
  getDocumentStatistics,
  getWorkersWithExpiredDocuments,
  getWorkersWithExpiringDocuments,
};
