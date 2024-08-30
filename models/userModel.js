import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    name: String,
    age: Number,
    city: String,
    email: String,
    interests: [String],
    signupDate: Date,
    isActive: Boolean
})

const users = new mongoose.model("users", userModel)

export default users 