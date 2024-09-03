import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    const response = await mongoose.connect(
      `mongodb+srv://yashpawar12122004:EuxmOAiMNH29yjjk@cluster0.9529p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log(`data base is connected with : ${response.connection.host}`);
  } catch (error) {
    console.log(`error in database connectivity : ${error}`);
  }
};
export default connectDb;
