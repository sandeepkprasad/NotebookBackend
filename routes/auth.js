const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchUser");

const JWT = "success";

// ROUTE 1: Creating a user using POST "api/auth/createuser". No login required.
router.post(
  "/createuser",
  // Body of express validator.
  [
    body("name", "Enter valid name").isLength({ min: 5 }),
    body("email", "Enter valid email").isEmail(),
    body("password", "Pawwsord should be minimum 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors return Bad request & errors using express validator.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    // Check whether the user email exists already.
    try {
      // Finding the email in DB if already exists.
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "User already registered." });
      }

      // Hashing and salt the password.
      const salt = await bcrypt.genSalt(10);
      const genPassword = await bcrypt.hash(req.body.password, salt);
      // Creating a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: genPassword,
      });

      // Using JWT.
      const data = {
        user: {
          id: user.id,
        },
      };

      const jwtData = jwt.sign(data, JWT);
      success = true;
      res.json({ success, jwtData });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 2: Registered user Login using POST "api/auth/login".
router.post(
  "/login",
  // Using express validator for email & password.
  [
    body("email", "Invalid email or password.").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // Checking errors in req using express validator.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success, error: "Invalid credentials." });
      }

      const passCompared = await bcrypt.compare(password, user.password);
      if (!passCompared) {
        return res.status(400).json({ success, error: "Invalid credentials." });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      const jwtData = jwt.sign(payload, JWT);
      success = true;
      res.json({ success, jwtData });
    } catch (err) {
      res.status(500).send("Internal server error.");
    }
  }
);

//ROUTE 3: Get loggedin user details using POST api/auth/getuser.
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
