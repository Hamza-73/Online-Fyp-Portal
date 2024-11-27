const mongoose = require("mongoose");

const connectDatabase = () => {
    

  mongoose.connect("mongodb+srv://hamza:hamza@fyp-portal.sa1tw.mongodb.net/fyp-portal?retryWrites=true&w=majority&appName=fyp-portal").then(() => {
    console.log("Connected to database");
  }).catch((err) => {
    console.log("Database connection error:", err.message);
  });
};

module.exports = connectDatabase;
