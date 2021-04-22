import User from "../models/user.js";

export const read = (req, res) => {
  const userId = req.params.id;
  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        err: `User not found`,
      });
    }

    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  });
};
