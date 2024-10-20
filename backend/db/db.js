const mongoose = require("mongoose");

const connectDatabase = () => {
    

  mongoose.connect('mongodb://127.0.0.1:27017/fyp-project').then(() => {
    console.log("Connected to database");
  }).catch((err) => {
    console.log("Database connection error:", err.message);
  });
};

module.exports = connectDatabase;
