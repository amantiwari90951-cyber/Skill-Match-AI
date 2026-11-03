const bcrypt = require("bcryptjs")
const userModel = require("../models/user.model")

const defaultUsers = [
    {
        username: "admin",
        email: "admin@interview.com",
        password: "Admin@123"
    },
    {
        username: "demo",
        email: "demo@interview.com",
        password: "Demo@123"
    }
]

async function seedUsers() {
    for (const user of defaultUsers) {
        const existingUser = await userModel.findOne({
            $or: [{ username: user.username }, { email: user.email }]
        })

        if (existingUser) {
            continue
        }

        const hashedPassword = await bcrypt.hash(user.password, 10)

        await userModel.create({
            username: user.username,
            email: user.email,
            password: hashedPassword
        })

        console.log(`Created default user: ${user.username} (${user.email})`)
    }
}

module.exports = seedUsers
