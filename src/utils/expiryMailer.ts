import { format } from "date-fns";
import { Op } from "sequelize";
import Document from "../models/documentModel";
import { Employee } from "../models/employeeModel";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // only use true with port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const checkExpiringDocuments = async (): Promise<void> => {
  try {
    const currentDate = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(currentDate.getDate() + 30);

    const documents = await Document.findAll({
      where: {
        expiryDate: {
          [Op.lte]: nextMonth,
        },
      },
      include: [
        {
          model: Employee,
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    for (const doc of documents) {
      const employee = doc.Employee;
      if (!employee) continue;

      const isExpired = doc.expiryDate < currentDate;
      const expiryStatus = isExpired ? "expired" : "expiring soon";

      const employeeFullName = `${employee.firstName ?? ""} ${
        employee.lastName ?? ""
      }`.trim();

      const mailOptions = {
        from: process.env.EMAIL_USER!,
        to: employee.email,
        subject: `Document Expiry Alert for ${employeeFullName || "Employee"}`,
        text: `
Hello ${employeeFullName || "there"},

Your document "${doc.documentType}" (ID: ${doc.documentid}) is ${expiryStatus}.

Expiry Date: ${format(new Date(doc.expiryDate), "yyyy-MM-dd")}

Please take action as needed.

Regards,
Workplace Management System
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${employee.email}:`, info.response);
      } catch (error) {
        console.error(`Failed to send email to ${employee.email}:`, error);
      }
    }
  } catch (error) {
    console.error("Error checking expiring documents:", error);
  }
};
