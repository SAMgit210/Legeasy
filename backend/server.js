import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Document from "./models/Document.js";

import fs from "fs";
import { PDFParse } from "pdf-parse";
import multer from "multer";
import express from "express";
import cors from "cors";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();

const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());


// MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/legeasy")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });


// Test backend
app.get("/", (req, res) => {
  res.json({
    message: "Legeasy Backend is Working!",
    status: "success"
  });
});


// Risk classification
function classifyRisk(clause) {
  const lowerClause = clause.toLowerCase();

  if (
    lowerClause.includes("penalty") ||
    lowerClause.includes("fine") ||
    lowerClause.includes("liability") ||
    lowerClause.includes("damages") ||
    lowerClause.includes("forfeit") ||
    lowerClause.includes("non-refundable") ||
    lowerClause.includes("breach")
  ) {
    return "HIGH";
  }

  if (
    lowerClause.includes("termination") ||
    lowerClause.includes("arbitration") ||
    lowerClause.includes("notice") ||
    lowerClause.includes("renewal") ||
    lowerClause.includes("jurisdiction")
  ) {
    return "MEDIUM";
  }

  return "LOW";
}


// Upload PDF
app.post(
  "/api/documents/upload",
  upload.single("document"),
  async (req, res) => {
    try {
      const pdfBuffer = fs.readFileSync(req.file.path);

      const parser = new PDFParse({
        data: pdfBuffer
      });

      const result = await parser.getText();

      const cleanedText = result.text
        .replace(/--\s*\d+\s*of\s*\d+\s*--/g, "")
        .replace(/\r/g, "");

      const clauses = cleanedText
        .split(/\n\s*\n/)
        .map((clause) => clause.replace(/\s+/g, " ").trim())
        .filter((clause) => /[a-zA-Z0-9]/.test(clause))
        .filter((clause) => clause.length > 20);

      const classifiedClauses = clauses.map((clause) => ({
        text: clause,
        risk: classifyRisk(clause)
      }));

      await Document.create({
        fileName: req.file.originalname,
        text: cleanedText,
        clauses: classifiedClauses
      });

      res.json({
        message: "PDF processed successfully",
        clauses: classifiedClauses
      });

    } catch (error) {
      console.log("Upload error:", error);

      res.status(500).json({
        message: "Failed to process PDF"
      });
    }
  }
);


// AI explanation
app.post("/api/explain", async (req, res) => {
  try {
    const { clause } = req.body;

    if (!clause) {
      return res.status(400).json({
        message: "Clause is required"
      });
    }

    // Temporary demo explanation
    const lowerClause = clause.toLowerCase();

    let explanation =
      "This clause describes an important condition of the agreement.";

    if (lowerClause.includes("penalty")) {
      explanation =
        "This clause means that a penalty may be charged if the required payment or obligation is not completed on time.";
    }

    if (lowerClause.includes("termination")) {
      explanation +=
        " It also explains when one or both parties can end the agreement.";
    }

    if (lowerClause.includes("notice")) {
      explanation +=
        " The agreement requires advance notice before taking certain actions.";
    }

    if (lowerClause.includes("arbitration")) {
      explanation +=
        " Disputes may be handled through arbitration instead of going directly to court.";
    }

    res.json({
      explanation
    });

  } catch (error) {
    console.log("Explanation error:", error);

    res.status(500).json({
      message: "Failed to generate explanation"
    });
  }
});


app.listen(5000, () => {
  console.log("Legeasy backend running on port 5000");
});