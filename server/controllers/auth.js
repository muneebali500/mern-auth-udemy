import User from "../models/user.js";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import _ from "lodash";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch";

import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* export const signup = (req, res) => {
  // console.log(req.body);
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        message: `Email is taken`,
      });
    }
  });

  let newUser = new User({ name, email, password });
  console.log(newUser);

  newUser.save((err, success) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    res.status(200).json({
      message: `Signup success! Please login`,
    });
  });
}; */

export const signup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: `email is taken`,
      });
    }

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: `10m` }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Account Activation Link`,
      html: `
        <h1>Please use the following link to activate your account</h1>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}</p>
      `,
    };

    sgMail
      .send(emailData)
      .then(() => {
        return res.json({
          message: `Email has been sent to ${email}. Follow the instructions to activate your account`,
        });
      })
      .catch((err) => {
        return res.json({
          error: err,
        });
      });
  });
};

export const accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          // console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
          return res.status(401).json({
            error: "Expired link. Signup again",
          });
        }

        const { name, email, password } = jwt.decode(token);

        const user = new User({ name, email, password });

        user.save((err, user) => {
          if (err) {
            // console.log("SAVE USER IN ACCOUNT ACTIVATION ERROR", err);
            return res.status(401).json({
              error: "Error saving user in database. Try signup again",
            });
          }
          return res.json({
            message: "Signup success. Please signin.",
          });
        });
      }
    );
  } else {
    return res.json({
      message: "Something went wrong. Try again.",
    });
  }
};

export const signin = (req, res) => {
  const { email, password } = req.body;

  // check if user exists
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: `User with this email does not exist. Please signup`,
      });
    }

    // authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: `Email or Password does not match`,
      });
    }

    // generate a token and send it to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: `7d`,
    });
    const { _id, name, email, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};

export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

export const adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: `User not found`,
      });
    }

    if (user.role !== `admin`) {
      return res.status(400).json({
        error: `Admin resource. Access denied`,
      });
    }

    req.profile = user;

    next();
  });
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: `User with that email does not exist`,
      });
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: `10m`,
      }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password Reset Link`,
      html: `
        <h1>Please use the following link to reset your password</h1>
        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}</p>
      `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        // console.log(`Reset Password Link Error`, err);
        return res.status(400).json({
          error: `Database connection error on user password forgot request`,
        });
      } else {
        sgMail
          .send(emailData)
          .then(() => {
            return res.json({
              message: `Email has been sent to ${email}. Follow the instructions to activate your account`,
            });
          })
          .catch((err) => {
            return res.json({
              error: err,
            });
          });
      }
    });
  });
};

export const resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(400).json({
            error: `Expired link, try again`,
          });
        }

        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(400).json({
              error: `Something went wrong. Try later`,
            });
          }

          const updateFields = {
            password: newPassword,
            resetPasswordLink: ``,
          };

          user = _.extend(user, updateFields);

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: `Error reseting user password`,
              });
            }

            res.json({
              message: `Great! Now you can login with your new password`,
            });
          });
        });
      }
    );
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLogin = (req, res) => {
  const { idToken } = req.body;

  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      // console.log(`Google login response`, response);

      const { email_verified, name, email } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: `7d`,
            });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          } else {
            let password = email + process.env.JWT_SECRET;
            user = new User({ name, email, password });
            user.save((err, data) => {
              if (err) {
                // console.log(`Error google login on user save`, err);
                return res.status(400).json({
                  error: `User signup failed witth google`,
                });
              }

              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: `7d`,
                }
              );
              const { _id, email, name, role } = data;
              return res.json({
                token,
                user: { _id, email, name, role },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: `Google login failed`,
        });
      }
    });
};

export const facebookLogin = (req, res) => {
  // console.log(req.body);
  const { userID, accessToken } = req.body;

  const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

  return fetch(url, {
    method: `GET`,
  })
    .then((response) => response.json())
    .then((response) => {
      const { email, name } = response;
      User.findOne({ email }).exec((err, user) => {
        if (user) {
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: `7d`,
          });
          const { _id, email, name, role } = user;
          return res.json({
            token,
            user: { _id, email, name, role },
          });
        } else {
          {
            let password = email + process.env.JWT_SECRET;
            user = new User({ name, email, password });
            user.save((err, data) => {
              if (err) {
                // console.log(`Error facebook login on user save`, err);
                return res.status(400).json({
                  error: `User signup failed witth facebook`,
                });
              }

              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: `7d`,
                }
              );
              const { _id, email, name, role } = data;
              return res.json({
                token,
                user: { _id, email, name, role },
              });
            });
          }
        }
      });
    })
    .catch((err) => {
      res.json({
        error: `facebook login failed. Try later`,
      });
    });
};
