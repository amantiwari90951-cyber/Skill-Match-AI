const fs = require("fs")
const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = process.env.GOOGLE_GENAI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
    : null

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated")
})

function extractJobTitle(jobDescription) {
    const match = (jobDescription || "").match(/[A-Za-z][A-Za-z\s&+-]*?(?:Engineer|Developer|Manager|Analyst|Architect|Lead|Specialist|Consultant|Designer|Product|Research)/i)
    return match && match[0] ? match[0].trim() : "Interview Preparation Plan"
}

function buildFallbackInterviewReport({ resume, selfDescription, jobDescription }) {
    const profileText = [resume, selfDescription].filter(Boolean).join(" ")
    const keywordMatches = ["react", "node", "javascript", "typescript", "python", "aws", "sql", "system design", "leadership", "api", "frontend", "backend"]
    const matchScore = Math.min(98, Math.max(45, keywordMatches.reduce((score, keyword) => {
        return score + (profileText.toLowerCase().includes(keyword) && jobDescription.toLowerCase().includes(keyword) ? 8 : 0)
    }, 52)))

    return {
        matchScore: Math.round(matchScore),
        technicalQuestions: [
            {
                question: "Describe a project where you improved performance or scalability.",
                intention: "Assess architecture, trade-offs, and ownership.",
                answer: "Explain the problem, your approach, metrics, and why the solution scaled."
            },
            {
                question: "How would you design a reliable API for high traffic?",
                intention: "Evaluate backend fundamentals and system design judgment.",
                answer: "Discuss requirements, caching, rate limiting, observability, database choices, and failure handling."
            }
        ],
        behavioralQuestions: [
            {
                question: "Tell me about a time you handled conflict or a difficult teammate situation.",
                intention: "Understand collaboration, communication, and maturity.",
                answer: "Share the context, your actions, and the result with a focus on ownership and learning."
            }
        ],
        skillGaps: [
            {
                skill: "System design depth",
                severity: "medium"
            }
        ],
        preparationPlan: [
            {
                day: 1,
                focus: "Role-specific fundamentals",
                tasks: [
                    "Review the job description and map key skills to your experience.",
                    "Prepare 3 strong examples for impact and leadership questions."
                ]
            },
            {
                day: 2,
                focus: "Technical depth",
                tasks: [
                    "Practice 2 coding problems relevant to the role.",
                    "Review core data structures and API design fundamentals."
                ]
            }
        ],
        title: extractJobTitle(jobDescription)
    }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    if (!ai) {
        return buildFallbackInterviewReport({ resume, selfDescription, jobDescription })
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(interviewReportSchema)
            }
        })

        return JSON.parse(response.text)
    } catch (error) {
        console.warn("AI interview generation failed; using fallback response:", error.message)
        return buildFallbackInterviewReport({ resume, selfDescription, jobDescription })
    }
}

function resolveBrowserExecutablePath(puppeteer) {
    const candidates = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    ]

    for (const candidate of candidates) {
        if (!candidate) continue

        try {
            if (fs.existsSync(candidate)) {
                return candidate
            }
        } catch (error) {
            // Ignore invalid paths and keep checking the rest.
        }
    }

    try {
        const puppeteerExecutable = puppeteer.executablePath()
        if (puppeteerExecutable && fs.existsSync(puppeteerExecutable)) {
            return puppeteerExecutable
        }
    } catch (error) {
        // Intentionally ignored; local Chrome/Edge is the most reliable browser path.
    }

    return null
}

async function launchBrowser() {
    // Serverless (Vercel) has no system Chrome; use the bundled Lambda-compatible Chromium build.
    if (process.env.VERCEL) {
        const chromium = require("@sparticuz/chromium")
        const puppeteerCore = require("puppeteer-core")
        return puppeteerCore.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true
        })
    }


    const browserExecutablePath = resolveBrowserExecutablePath(puppeteer)

    if (!browserExecutablePath) {
        throw new Error("No Chrome/Edge browser binary was found on this machine. Install Chrome or Edge and retry.")
    }

    return puppeteer.launch({
        headless: "new",
        executablePath: browserExecutablePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await launchBrowser()
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

function buildFallbackResumeHtml({ resume, selfDescription, jobDescription }) {
    const summary = [selfDescription, resume].filter(Boolean).join(" ")
    const jobTitle = extractJobTitle(jobDescription)

    return `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.5; margin: 24px; }
                    h1 { font-size: 28px; margin-bottom: 8px; }
                    .meta { color: #4b5563; margin-bottom: 18px; }
                    .section { margin-top: 18px; }
                    .section h2 { border-bottom: 1px solid #d1d5db; padding-bottom: 6px; font-size: 18px; }
                    ul { padding-left: 18px; }
                    strong { color: #111827; }
                </style>
            </head>
            <body>
                <h1>${jobTitle}</h1>
                <div class="meta">Professional Resume</div>
                <div class="section">
                    <h2>Profile Summary</h2>
                    <p>${(summary || "Experienced professional with a strong background in product delivery and technical problem solving.").slice(0, 600)}</p>
                </div>
                <div class="section">
                    <h2>Key Skills</h2>
                    <ul>
                        <li>Problem solving and ownership</li>
                        <li>Communication and stakeholder collaboration</li>
                        <li>Technical execution in modern web and backend systems</li>
                        <li>Delivery under ambiguity and rapid iteration</li>
                    </ul>
                </div>
                <div class="section">
                    <h2>Experience</h2>
                    <p><strong>Senior Engineer</strong> — Delivered customer-facing products using modern web technologies and measurable improvements in quality and speed.</p>
                    <p><strong>Role Match</strong> — Tailored for: ${(jobDescription || "software engineering position").slice(0, 200)}</p>
                </div>
            </body>
        </html>
    `
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                    `

    if (!ai) {
        return generatePdfFromHtml(buildFallbackResumeHtml({ resume, selfDescription, jobDescription }))
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema)
            }
        })

        const jsonContent = JSON.parse(response.text)
        return generatePdfFromHtml(jsonContent.html)
    } catch (error) {
        console.warn("AI resume generation failed; using fallback HTML:", error.message)
        return generatePdfFromHtml(buildFallbackResumeHtml({ resume, selfDescription, jobDescription }))
    }
}

module.exports = { generateInterviewReport, generateResumePdf }
