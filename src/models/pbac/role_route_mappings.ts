import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IRoleRouteMapping extends Document {
  id: string;
  role_fk_id: string;
  route_fk_id: string;
}

module.exports = (conn: any) => {
  const RoleRouteMappingSchema: Schema<IRoleRouteMapping> = new Schema(
    {
      id: {
        type: String,
        default: uuidv4,
        required: true,
        unique: true,
      },
      role_fk_id: {
        type: String, // UUIDs are stored as strings in MongoDB
        required: true,
        ref: 'roles'
      },
      route_fk_id: {
        type: String,
        required: true,
      },
    },
    {
      collection: "role_route_mappings",
    }
  );

  return conn.model("RoleRouteMapping", RoleRouteMappingSchema);
};
