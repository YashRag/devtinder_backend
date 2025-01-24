const express = require("express");
const { userAuth } = require("../middleware/auth");
const { ConnectionStates } = require("mongoose");
const ConnectionRequest = require("../models/connectRequest");
const User = require("../models/user");
const userRouter = express.Router();
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequist = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "age",
      "gender",
    ]);

    res.json({ message: "Data fetched Successfully", data: connectionRequist });
  } catch (err) {
    req.statusCode(400).send("ERROR " + err.message);
  }
});

// userRouter.get("/user/connections", userAuth, async (req, res) => {
//   try {
//     const loggedInUser = req.user;

//     const connectionRequest = await ConnectionRequest.find({
//       $or: [
//         { toUserId: loggedInUser._id, status: "accepted" },
//         { fromUserId: loggedInUser._id, status: "accepted" },
//       ],
//     })
//       .populate("fromUserId", [
//         "firstName",
//         "lastName",
//         "photoUrl",
//         "age",
//         "gender",
//       ])
//       .populate("toUserId", [
//         "firstName",
//         "lastName",
//         "photoUrl",
//         "age",
//         "gender",
//       ]);

//     const data = connectionRequest.map((row) => {
//       if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
//         return row.toUserId;
//       }
//       row.fromUserId;
//     });

//     res.json({ data });
//   } catch (err) {
//     res.status(400).send({ message: err.message });
//   }
// });

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    console.log(connectionRequests);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const user = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName photoUrl age gender")
      .skip(skip)
      .limit(limit);

    res.send(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
