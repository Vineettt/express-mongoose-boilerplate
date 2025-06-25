import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IRoute extends Document {
  id: string;
  endpoint: string;
  method: string;
  type?: string;
  handler?: string;
}

module.exports = (conn: any) => {
  const RouteSchema: Schema<IRoute> = new Schema(
    {
      id: {
        type: String,
        default: uuidv4,
        required: true,
        unique: true,
      },
      endpoint: {
        type: String,
        required: [true, "Please enter a endpoint"],
      },
      method: {
        type: String,
        required: [true, "Please enter a method"],
      },
      type: {
        type: String,
      },
      handler: {
        type: String,
      },
    },
    {
      collection: "routes",
    }
  );

  return conn.model("Route", RouteSchema);
};
