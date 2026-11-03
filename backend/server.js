require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const seedUsers = require("./src/config/seedUsers")

async function startServer() {
    await connectToDB()
    await seedUsers()

    app.listen(3000, () => {
        console.log("Server is running on port 3000")
    })
}

startServer().catch((error) => {
    console.error("Failed to start server:", error)
    process.exit(1)
})