const jwt = require("jsonwebtoken");

const User = require("../models/users");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ _id: verifyUser._id });
    res.token = token;
    res.user = user;
    next();
  } catch (e) {
    res.status(401).send(e);
  }
};
module.exports = auth;
