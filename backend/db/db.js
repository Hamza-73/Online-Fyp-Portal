const mongoose = require("mongoose");

const connectDatabase = () => {
    

  mongoose.connect(process.env.MONGOURI).then(() => {
    console.log("Connected to database");
  }).catch((err) => {
    console.log("Database connection error:", err.message);
  });
};

module.exports = connectDatabase;
