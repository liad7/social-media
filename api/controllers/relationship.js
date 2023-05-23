import jwt from "jsonwebtoken";
import dbService from "../connect";

export const getRelationships = async (req, res) => {
  try {
    const collection = await dbService.getCollection("relationship");

    const relationships = await collection
      .find({ followedUserId: req.query.followedUserId })
      .toArray();

    const followerUserIds = relationships.map(
      (relationship) => relationship.followerUserId
    );

    return res.status(200).json(followerUserIds);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const addRelationship = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("relationship");

      const relationship = {
        followerUserId: userInfo.id,
        followedUserId: req.body.userId,
      };

      await collection.insertOne(relationship);

      return res.status(200).json("Following");
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};

export const deleteRelationship = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("relationship");

      const result = await collection.deleteOne({
        followerUserId: userInfo.id,
        followedUserId: req.query.userId,
      });

      if (result.deletedCount > 0) {
        return res.status(200).json("Unfollow");
      } else {
        return res.status(500).json("Unable to unfollow.");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};
