import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import moment from "moment";
import dbService from "../connect";

export const getPosts = async (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("post");

      let query;
      let values;

      if (userId !== "undefined") {
        query = {
          userId: userId,
        };
        values = [userId];
      } else {
        query = {
          $or: [
            { userId: userInfo.id },
            { userId: { $in: userInfo.following } },
          ],
        };
        values = [userInfo.id, userInfo.id];
      }

      const posts = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};

export const addPost = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("post");

      const post = {
        desc: req.body.desc,
        img: req.body.img,
        createdAt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        userId: userInfo.id,
      };

      await collection.insertOne(post);

      return res.status(200).json("Post has been created.");
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};

export const deletePost = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("post");

      const result = await collection.deleteOne({
        _id: ObjectId(req.params.id),
        userId: userInfo.id,
      });

      if (result.deletedCount > 0) {
        return res.status(200).json("Post has been deleted.");
      } else {
        return res.status(403).json("You can delete only your post.");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};
