const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    // validating the data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;
    // encrypt the password.
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const saveduser = await user.save();
    const token = await saveduser.getJWT();
    //console.log(token);
    // Add token to cookie and send the response back to user

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 360000),
    });
    res.json({message:"User added Successfully",data:saveduser});
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Email is not present");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // create JWT token
      const token = await user.getJWT();
      console.log(token);
      // Add token to cookie and send the response back to user

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 360000),
      });
      res.send(user);
    } else {
      throw new Error("Password is not correct");
    }
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Success");
});

module.exports = authRouter;
