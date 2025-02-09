// server.js (or the main entry point of your server)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./db/db"); // Import your connectDatabase function
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const app = express();


// Ensure .env file is loaded before anything else
dotenv.config({ path: path.resolve(__dirname, 'config/.env') });

// Connect to the database
connectDatabase();


const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dfexs9qho',
  api_key: '798692241663155',
  api_secret: '_zRYx_DFqV6FXNK664jRFxbKRP8'
});

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser())


// Simple test route to check server response
app.get("/", (req, res) => {
  console.log("Received a request at /");
  res.send("Hello world!");
});

// Static files route
app.use("/", express.static("uploads"));

// ROUTES

const adminRoutes = require('./routes/admin.route.js');
const studentRoutes = require('./routes/student.route.js');
const authRoutes = require('./routes/auth.route.js');
const supervisorRoutes = require('./routes/supervisor.route.js');
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/supervisor', supervisorRoutes);


// Start the server on the specified port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
