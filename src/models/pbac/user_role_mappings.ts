import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IUserRoleMapping extends Document {
  id: string;
  user_fk_id: string;
  role_fk_id: string;
}

module.exports = (conn: any) => {
  const UserRoleMappingSchema: Schema<IUserRoleMapping> = new Schema(
    {
      id: {
        type: String,
        default: uuidv4,
        required: true,
        unique: true,
      },
      user_fk_id: {
        type: String,
        required: true,
        // Optionally: ref: 'User'
      },
      role_fk_id: {
        type: String,
        required: true,
        // Optionally: ref: 'Role'
      },
    },
    {
      collection: "user_role_mappings",
    }
  );

  return conn.model("UserRoleMapping", UserRoleMappingSchema);
};
