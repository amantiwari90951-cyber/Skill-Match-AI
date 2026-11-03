const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

let memoryServer

async function connectToDB() {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI

    if (!mongoUri) {
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