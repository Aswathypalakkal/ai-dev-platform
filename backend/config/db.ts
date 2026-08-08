import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Ai_dev');

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
export const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

 const fileSchema = new mongoose.Schema({
  
    filename: String,
    filecontent: String,
    createduser: String
  
});

const User = mongoose.model("User", userSchema);

//export default connectDB;

export const File = mongoose.model("File", fileSchema);