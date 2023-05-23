import jwt from "jsonwebtoken";
import dbService from "../connect";

export const getLikes = async (req, res) => {
  try {
    const collection = await dbService.getCollection("like");
    const likes = await collection
      .find({ postId: req.query.postId })
      .project({ userId: 1, _id: 0 })
      .toArray();

    return res.status(200).json(likes.map((like) => like.userId));
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const addLike = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("like");

      const like = {
        userId: userInfo.id,
        postId: req.body.postId,
      };

      await collection.insertOne(like);

      return res.status(200).json("Post has been liked.");
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};

export const deleteLike = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("like");

      const result = await collection.deleteOne({
        userId: userInfo.id,
        postId: req.query.postId,
      });

      if (result.deletedCount > 0) {
        return res.status(200).json("Post has been disliked.");
      } else {
        return res.status(404).json("Like not found.");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};
