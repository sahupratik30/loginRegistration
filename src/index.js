require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
require("./db/conn");
const User = require("./models/users");
const port = process.env.PORT || 8000;
const hbs = require("hbs");

const staticPath = path.join(__dirname, "../public");
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates/views"));
hbs.registerPartials(path.join(__dirname, "../templates/partials"));
//Using the static web folder.
app.use(cookieParser());
app.use(express.static(staticPath));
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/about", auth, (req, res) => {
  res.render("about", {
    username: res.user.firstname,
  });
});
app.get("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.user.tokens = res.user.tokens.filter((token) => {
      return token !== res.token;
    });
    await res.user.save();
    res.render("login");
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
//Registering User.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.post("/register", async (req, res) => {
  try {
    const confirmPassword = req.body.cpassword;
    const password = req.body.password;

    const userData = new User({
      firstname: req.body.fname,
      lastname: req.body.lname,
      mobile: req.body.mobile,
      dob: req.body.dob,
      email: req.body.email,
      password: req.body.password,
    });
    if (password === confirmPassword) {
      await userData.save();
      res.status(201).render("index");
    } else {
      res.status(400).send("Passwords are not matching");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//Logging in User.
app.post("/login", async (req, res) => {
  try {
    const inputEmail = req.body.email;
    const inputPassword = req.body.password;
    const data = await User.findOne({ email: inputEmail });
    const checkPasswordMatch = await bcrypt.compare(
      inputPassword,
      data.password
    );
    const token = await data.generateAuthToken();
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 1000000),
      httpOnly: true,
    });
    if (checkPasswordMatch) {
      res.status(200).render("index");
    } else {
      res.status(400).send("Invalid Credentials!");
    }
  } catch (e) {
    res.status(500).send("Invalid Credentials!");
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`Listening to port number ${port}`);
});
