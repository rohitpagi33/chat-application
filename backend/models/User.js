import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true },
  mobile: { type: String, unique: true },
  profilePhoto: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema, 'user');
export default User;
