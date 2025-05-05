// server.js (or the main entry point of your server)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./db/db"); // Import your connectDatabase function
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const app = express();
const { createServer } = require("http");
const setupSocket = require("./socket/socket.js");

// Ensure .env file is loaded before anything else
dotenv.config();

// Connect to the database
connectDatabase();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser());

// Simple test route to check server response
app.get("/", (req, res) => {
  console.log("Received a request at /");
  res.send("Hello world!");
});

// Static files route
app.use("/", express.static("uploads"));

//socket connection
const httpServer = createServer(app);

// ROUTES

const adminRoutes = require("./routes/admin.route.js");
const studentRoutes = require("./routes/student.route.js");
const authRoutes = require("./routes/auth.route.js");
const supervisorRoutes = require("./routes/supervisor.route.js");
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/student", studentRoutes);
app.use("/supervisor", supervisorRoutes);

// Start the server on the specified port
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  setupSocket(httpServer);
  console.log(`Server running on port ${PORT}`);
});
