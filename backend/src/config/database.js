const mongoose = require("mongoose")
let memoryServer
let connectionPromise

async function connectToDB() {
    if (mongoose.connection.readyState === 1) return
    if (!connectionPromise) {
        connectionPromise = connect().catch((err) => {
            connectionPromise = undefined
            throw err
        })
    }
    return connectionPromise
}

async function connect() {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI

    if (!mongoUri) {
        if (process.env.VERCEL) {
            throw new Error("MONGO_URI is not set for this deployment")
        }
        const { MongoMemoryServer } = require("mongodb-memory-server")
        memoryServer = await MongoMemoryServer.create({
            instance: {
                dbName: "yt-genai"
            }
        })

        process.env.MONGO_URI = memoryServer.getUri()
    }

    try {
        await mongoose.connect(process.env.MONGO_URI || mongoUri, {
            serverSelectionTimeoutMS: 5000
        })

        console.log("Connected to MongoDB")
    } catch (err) {
        console.error("MongoDB connection failed:", err.message)
        throw err
    }
}

module.exports = connectToDB
