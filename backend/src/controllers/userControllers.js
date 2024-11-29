const User = require("../models/userModel");
// const ApiError = require("../utils/apiError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  // get all details from req.body
  // validation - not empaty
  // check if user already exist - username,email
  // hashed password
  // create a user object- create entry in db
  // check for user creation
  // return res

  try {
    const { username, email, dateOfBirth, password } = req.body;

    // validation - not empaty
    /*
   if (
      [username, email, dateOfBirth, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      // throw new ApiError(400, "All fields are required!!");
      return res.status(400).json({ message: "All fields are required!!" });
    }
  */

    // Validate required fields
    if (!username || !email || !dateOfBirth || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // check if user already exist - username,email
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
      return res
        .status(409)
        .json({ message: "User with username & email already exist" });
    }

    // hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      username: username.toLowerCase(),
      email,
      dateOfBirth,
      password: hashedPassword,
    });
    return res
      .status(201)
      .json({ message: `User register with username ${username}` });
  } catch (error) {
    res.status(500).json({ message: `something went wrogn ${err.message}` });
  }
};

const login = async (req, res) => {
  //  get username and password from req.body
  // find user
  // check password
  // generate Token
  // send response

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // find user
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with username ${username} not found` });
    }

    // check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate Token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: `User with username ${username} is login successfully`,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: `something went wrogn ${error.message}` });
  }
};

module.exports = { register, login };
