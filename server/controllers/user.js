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

export const update = (req, res) => {
  // console.log(`Update user - req.user`, req.user, `Update data`, req.body);

  const { name, password } = req.body;

  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: `User not found`,
      });
    }

    if (!name) {
      return res.status(400).json({
        error: `Name is required`,
      });
    } else {
      user.name = name;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: `Password should be minimum 6 characters long`,
        });
      } else {
        user.password = password;
      }
    }

    user.save((err, updatedUser) => {
      if (err) {
        console.log(`Update error`, err);
        return res.status(400).json({
          error: `Update failed`,
        });
      }

      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      res.json(updatedUser);
    });
  });
};
