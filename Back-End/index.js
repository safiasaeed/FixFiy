const express = require('express');
const dotenv = require("dotenv");
const app = express();
// const PORT = 3001
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./modules/users/user.routes')
const authRoutes = require("./modules/auth/auth.routes")

app.use("/api/profile",userRoutes );
app.use("/api/auth", authRoutes );  



app.listen(3001, () => {
    console.log("Server is Running ...")
})