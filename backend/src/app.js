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

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
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