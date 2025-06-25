import mongoose, { Schema, Document, Model } from "mongoose";
const validateEmail = require("@/shared/email/validate-email");
const { hashString } = require("@/shared/common/hashing");
import { v4 as uuidv4 } from "uuid";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  reset_token?: string;
  reset_status: number;
  token?: string;
  login_attempts: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  status: number;
  is_deleted: number;
}

module.exports = (conn: any) => {
  const UserSchema: Schema<IUser> = new Schema(
    {
      id: {
        type: String,
        default: uuidv4,
        required: true,
        unique: true,
      },
      first_name: { type: String },
      last_name: { type: String },
      email: {
        type: String,
        required: [true, "Please enter a email"],
        unique: true,
        validate: {
          validator: async function (email: string) {
            const response = await validateEmail(email);
            if (!response[0]) {
              throw new Error(response[1]);
            }
            return true;
          },
          message: "EMAIL_VALIDATION_FAILED",
        },
      },
      password: {
        type: String,
        required: [true, "Please enter a password"],
        validate: {
          validator: function (password: string) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
              password
            );
          },
          message: "PASSWORD_VALIDATION",
        },
      },
      reset_token: { type: String },
      reset_status: { type: Number, default: 0, required: true },
      token: { type: String },
      login_attempts: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
      deleted_at: { type: Date },
      status: { type: Number, default: -1, required: true },
      is_deleted: { type: Number, default: 0, required: true },
    },
    {
      collection: "users",
      timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
  );

  // Pre-save hook to hash password
  UserSchema.pre<IUser>("save", async function (next) {
    if (this.isModified("password")) {
      this.password = await hashString(this.password);
    }
    next();
  });

  // Static method similar to Sequelize's updateRow
  UserSchema.statics.updateRow = async function (
    updateQuery: any,
    condition: any
  ) {
    updateQuery.updated_at = new Date();
    return this.updateMany(condition, updateQuery);
  };

  return conn.model("User", UserSchema);
};
