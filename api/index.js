const app = require("../backend/src/app")
const connectToDB = require("../backend/src/config/database")
const seedUsers = require("../backend/src/config/seedUsers")

let readyPromise

function ensureReady() {
    if (!readyPromise) {
        readyPromise = (async () => {
            await connectToDB()
            await seedUsers()
        })().catch((error) => {
            readyPromise = undefined
            throw error
        })
    }
    return readyPromise
}

module.exports = async function handler(req, res) {
    try {
        await ensureReady()
    } catch (error) {
        console.error("Database initialization failed:", error)
        res.statusCode = 503
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify({ message: "Database unavailable. Please try again shortly." }))
        return
    }
    return app(req, res)
}
