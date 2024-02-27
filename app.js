import express from "express";
import { config } from "dotenv";
import userRouter from "./routes/user.js";
import productRouter from "./routes/product.js";
import orderRouter from "./routes/order.js"
import errorMiddleware from "./middlewares/error.js";
import cors from "cors";
import cookieParser from "cookie-parser";

config({
  path: "./data/config.env",
});

const app = express();
app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_URI],
  methods: ["GET","POST","PUT","PATCH","DELETE"],
  credentials:true
}))
app.use(cookieParser());

app.get("/", (req, res, next) => res.send("Choudhary Enterprises HomePage"));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order",orderRouter)

app.use(errorMiddleware);

export default app;
