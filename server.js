// MongoDB connection
require("dotenv").config();

// Common core Nodejs module
const path = require("path");

// NPM modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

// Custom modules
const connectDB = require("./config/dbConn");

// Connect to MongoDB
connectDB();

// Port
const PORT = process.env.PORT || 3500;

// Cross Origin Resource Sharing
app.use(cors());

// Built in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for json data
app.use(express.json());

// Built-in middleware serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// Routes
app.use("/", require("./routes/root"));
app.use("/states", require("./routes/api/states"));

// 404 Not Found
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Listen for mongoDB database connection
mongoose.connection.once("open", () => {
  // We only listen for request if we have successfully connected
  console.log("Connected to MongoDB.");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
});
