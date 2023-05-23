import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbService from "../connect";

export const register = async (req, res) => {
  try {
    // Check if user already exists
    const collection = await dbService.getCollection("users");
    const existingUser = await collection.findOne({
      username: req.body.username,
    });

    if (existingUser) {
      return res.status(409).json("User already exists!");
    }

    // Create a new user
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const newUser = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
    };

    await collection.insertOne(newUser);

    return res.status(200).json("User has been created.");
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  try {
    const collection = await dbService.getCollection("users");

    const user = await collection.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!checkPassword) {
      return res.status(400).json("Wrong password or username!");
    }

    const token = jwt.sign({ id: user._id.toString() }, "secretkey");

    const { password, ...others } = user;

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json(others);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json("User has been logged out.");
};
