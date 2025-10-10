import jwt from "jsonwebtoken"
import mongoose, { Document, Model, Schema } from "mongoose"
import { DashboardUserRole } from "./user-role.enum"
export interface IRefreshToken extends Document {
  userId: Schema.Types.ObjectId
  token: string
  expiryDate: Date
  role: DashboardUserRole
}

interface RefreshTokenModel extends Model<IRefreshToken> {
  isExpired(token: IRefreshToken): boolean
}

// Refresh Token Schema
const refreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "userType" // Dynamic reference to either AppUser or DashboardUser
  },
  token: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  role: {
    type: String,
    required: true,
    enum: [DashboardUserRole.AUDITOR, DashboardUserRole.SUPER_ADMIN]
  }
})

// Static method to check if the token is expired
refreshTokenSchema.statics.isExpired = function (token: IRefreshToken) {
  let isExpired = false
  jwt.verify(token.token, process.env.JWT_SECRET as string, err => {
    if (err && err.name === "TokenExpiredError") {
      isExpired = true
    }
  })

  return isExpired
}

export default mongoose.model<IRefreshToken, RefreshTokenModel>(
  "RefreshToken",
  refreshTokenSchema
)
