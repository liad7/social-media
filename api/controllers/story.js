import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import moment from "moment";
import dbService from "../connect";

export const getStories = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    jwt.verify(token, "secretkey", async (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");

      const collection = await dbService.getCollection("story");

      const query = [
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "relationships",
            let: { userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followedUserId", "$$userId"] },
                      { $eq: ["$followerUserId", userInfo.id] },
                    ],
                  },
                },
              },
            ],
            as: "relationship",
          },
        },
        {
          $limit: 4,
        },
      ];

      const stories = await collection.aggregate(query).toArray();

      return res.status(200).json(stories);
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const addStory = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("story");

      const story = {
        img: req.body.img,
        createdAt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        userId: userInfo.id,
      };

      await collection.insertOne(story);

      return res.status(200).json("Story has been created.");
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};

export const deleteStory = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const collection = await dbService.getCollection("story");

      const result = await collection.deleteOne({
        _id: ObjectId(req.params.id),
        userId: userInfo.id,
      });

      if (result.deletedCount > 0) {
        return res.status(200).json("Story has been deleted.");
      } else {
        return res.status(403).json("You can delete only your story!");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};
