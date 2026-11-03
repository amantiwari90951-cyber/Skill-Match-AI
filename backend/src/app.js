const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:4173",
    "http://127.0.0.1:4173"
])

const isAllowedOrigin = (origin) => {
    if (!origin) return true

    if (allowedOrigins.has(origin)) return true

    try {
        const { hostname, protocol } = new URL(origin)

        if (protocol !== "http:" && protocol !== "https:") {
            return false
        }

        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return true
        }

        return hostname.endsWith(".vercel.app") || hostname.endsWith(".vercel.dev") || hostname === "vercel.app" || hostname === "vercel.dev"
    } catch {
        return false
    }
}

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true)
            return
        }

        callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)



module.exports = app