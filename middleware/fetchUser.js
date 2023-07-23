const jwt = require("jsonwebtoken");

const JWT = "success";

const fetchuser = (req, res, next) => {
  // Get user from the jwt token
  const token = req.header("authtoken");

  if (!token) {
    res.status(401).send({ error: "Invalid token." });
  }

  try {
    const data = jwt.verify(token, JWT);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid token." });
  }
};

module.exports = fetchuser;
