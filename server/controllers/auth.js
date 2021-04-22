import User from "../models/user.js";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";

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
          console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
          return res.status(401).json({
            error: "Expired link. Signup again",
          });
        }

        const { name, email, password } = jwt.decode(token);

        const user = new User({ name, email, password });

        user.save((err, user) => {
          if (err) {
            console.log("SAVE USER IN ACCOUNT ACTIVATION ERROR", err);
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
