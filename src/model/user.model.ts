import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  roles: ("User" | "Admin" | "Moderator")[];
  isActive: boolean;
  profileUrl: string;
  isVerified: boolean;
  verifycode: string;
  VerifyCodeExpiry: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

}

const userSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v: string) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: (props: { value: string }) =>
        `${props.value} is not a valid email address!`,
    },
  },
  passwordHash: {
    type: String,
    required: true,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  profileUrl: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifycode: {
    type: String,
    required: [true, "verication code is required"],
  },
  VerifyCodeExpiry: {
    type: Date,
    required: [true, "Verification code expiry is required"],
  },
  refreshToken: {
    type: String,
    default: null,
  },
  roles: {
    type: [String],
    enum: ["User", "Admin", "Moderator"],
    default: ["User"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
