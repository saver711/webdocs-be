import jwt from "jsonwebtoken"
import RefreshToken from "../models/refresh-token.model"
import { DashboardUserRole } from "../models/user-role.enum"

// Generate access token
export const generateAccessToken = (
  userId: string,
  role: DashboardUserRole
) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1h"
  })
}

// Generate refresh token
export const generateRefreshToken = async (
  userId: string,
  role: DashboardUserRole
) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
  })

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 7) // Set refresh token expiry to 7 days

  // Save refresh token to database
  const refreshToken = new RefreshToken({
    userId,
    token,
    expiryDate,
    role
  })

  await refreshToken.save()

  return token
}
