const mammoth = require("mammoth")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.services")
const interviewReportModel = require("../models/interviewReport.models")

async function extractPdfText(buffer) {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")
    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: true,
        ignoreErrors: true
    })

    const pdf = await loadingTask.promise
    const pageTexts = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
            .map((item) => (typeof item.str === "string" ? item.str : ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()

        if (pageText) {
            pageTexts.push(pageText)
        }
    }

    await pdf.destroy()
    return pageTexts.join("\n")
}

async function extractResumeText(file) {
    if (!file || !file.buffer) {
        return ""
    }

    const fileName = (file.originalname || "").toLowerCase()

    try {
        if (fileName.endsWith(".pdf") || file.mimetype === "application/pdf") {
            return await extractPdfText(file.buffer)
        }

        if (fileName.endsWith(".docx") || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ buffer: file.buffer })
            return result?.value || ""
        }
    } catch (error) {
        console.error("Resume parsing failed:", error.message)
    }

    return ""
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    const { selfDescription, jobDescription } = req.body
    const resumeFile = req.file

    if (!jobDescription || !jobDescription.trim()) {
        return res.status(400).json({
            message: "Job description is required."
        })
    }

    if (!resumeFile && (!selfDescription || !selfDescription.trim())) {
        return res.status(400).json({
            message: "Either a resume file or self description is required."
        })
    }

    const resumeText = await extractResumeText(resumeFile)

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription: selfDescription || "",
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription: selfDescription || "",
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    const pdfFileName = `resume_${interviewReportId}.pdf`

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdfFileName}"; filename*=UTF-8''${encodeURIComponent(pdfFileName)}`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
    })

    res.send(Buffer.from(pdfBuffer))
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }