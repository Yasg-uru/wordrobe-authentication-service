import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    const response = await mongoose.connect(
      `mongodb://127.0.0.1:27017/wordrobe-authentication-service`
    );
    console.log(`data base is connected with : ${response.connection.host}`);
  } catch (error) {
    console.log(`error in database connectivity : ${error}`);
  }
};
export default connectDb;
