import express, { Application } from "express";
import { config } from "dotenv";
import connectDb from "./util/connectDb";
import { ErrorhandlerMiddleware } from "./middleware/errorMiddleware";
import UserRouter from "./route/user.route";
const app: Application = express();
config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 4000;
app.use("/user",UserRouter);

connectDb();
app.use(ErrorhandlerMiddleware);

app.listen(PORT, () => {
  console.log(`authentication service is running on port : ${PORT}`);
});
