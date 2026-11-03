const multer = require("multer")

const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const fileName = (file.originalname || "").toLowerCase()
        const isPdf = fileName.endsWith(".pdf") || file.mimetype === "application/pdf"
        const isDocx = fileName.endsWith(".docx") || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        if (isPdf || isDocx || allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true)
            return
        }

        cb(new Error("Only PDF and DOCX resume files are allowed."))
    }
})

module.exports = upload