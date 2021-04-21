import "dotenv/config.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// Import routes
import authRoutes from "./routes/auth.js";

// Connect to DATABASE
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log(`DB Connected`))
  .catch((err) => console.log(`DB Connection Error: ${err}`));

// app middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors()); // allows all origins
// if ((process.env.NODE_ENV = "development")) {
//   app.use(cors({ origin: `http://localhost:3000` }));
// }

// middleware
app.use("/api", authRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});
