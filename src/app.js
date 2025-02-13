const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require('cors')
require('dotenv').config()
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requists");
const userRouter   = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/",userRouter);

connectDB()
  .then(() => {
    console.log("Database connection success");
    app.listen(7777, () => {
      console.log("Server is running.....");
    });
  })
  .catch((err) => {
    console.log("Database connection failed");
  });
