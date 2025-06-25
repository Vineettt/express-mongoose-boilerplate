import mongoose, { Schema, Document, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const logger = require("@/shared/common/logger");

interface IRole extends Document {
  id: string;
  role: string;
}

interface IRoleModel extends Model<IRole> {
  updateRolesTable(): Promise<void>;
}

module.exports = (conn: any) => {
  const RoleSchema: Schema<IRole> = new Schema(
    {
      id: {
        type: String,
        default: uuidv4,
        required: true,
        unique: true,
      },
      role: {
        type: String,
        required: [true, "ROLE_ENTER"],
        unique: true,
      },
    },
    {
      collection: "roles",
    }
  );

  // Static Method: Similar to Sequelize's updateRolesTable
  RoleSchema.statics.updateRolesTable = async function () {
    try {
      await this.create(
        {
          id: "7d0c9dbd-1923-47ac-a1ee-e4039f379180",
          role: "user",
        },
        { overwriteDiscriminatorKey: false }
      ).catch((err: any) => {
        if (err.code === 11000) {
          // Duplicate key error, ignore it
          return;
        }
        throw err;
      });

      logger.info("Data have been saved");
    } catch (error) {
      logger.error("Error inserting default roles:", error);
    }
  };
  
  return conn.model("Role", RoleSchema);
};
