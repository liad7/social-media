import jwt from "jsonwebtoken";
import moment from "moment";
const ObjectId = require('mongodb').ObjectId
import dbService from "../connect";

export const getComments = async (req, res) => {
  try {
    const collection = await dbService.getCollection("comment");
    const comments = await collection
      .find({ postId: req.query.postId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const addComment = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("comment");

      const comment = {
        desc: req.body.desc,
        createdAt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        userId: userInfo.id,
        postId: req.body.postId
      };

      await collection.insertOne(comment);

      return res.status(200).json("Comment has been created.");
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};

export const deleteComment = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const commentId = req.params.id;

    try {
      const collection = await dbService.getCollection("comment");

      const result = await collection.deleteOne({
        _id: ObjectId(commentId),
        userId: userInfo.id
      });

      if (result.deletedCount > 0) {
        return res.json("Comment has been deleted!");
      } else {
        return res.status(403).json("You can delete only your comment!");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};
