import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import dbService from "../connect";

export const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const collection = await dbService.getCollection("user");

    const user = await collection.findOne(
      { _id: ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json("User not found");
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const updateUser = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const userId = req.params.userId;
      const collection = await dbService.getCollection("user");

      const result = await collection.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: {
            name: req.body.name,
            city: req.body.city,
            website: req.body.website,
            profilePic: req.body.profilePic,
            coverPic: req.body.coverPic,
          },
        }
      );

      if (result.matchedCount > 0) {
        return res.json("Updated!");
      } else {
        return res.status(403).json("You can update only your post!");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};
