import { ErrorCode } from "@models/api/error-code.enum"
import DashboardUser from "@models/dashboard-user.model"
import { DashboardUserRole } from "@models/user-role.enum"
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

// Middleware to check if the user is authenticated
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tokenFromAuthHeader = req.header("Authorization")?.split(" ")[1] // Bearer token // Temp for Postman

  const cookies = req.headers.cookie?.split(";").reduce((acc: any, cookie) => {
    const [key, value] = cookie.trim().split("=")
    acc[key] = value
    return acc
  }, {})
  const tokenFromCookies = cookies?.accessToken
  const token = tokenFromAuthHeader || tokenFromCookies
  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
      errorCode: ErrorCode.NO_TOKEN_PROVIDED
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      message: "Token is not valid",
      error,
      errorCode: ErrorCode.INVALID_TOKEN
    })
  }
}

// Middleware for authorizing roles and checking verification status
export const authorizeUser = (roles: DashboardUserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboardUser = await DashboardUser.findById(req.user?.userId)

      // Check if the user exists and is one of the allowed roles
      if (
        !dashboardUser ||
        !roles.includes(dashboardUser.role as DashboardUserRole)
      ) {
        return res.status(403).json({
          message: "Access denied",
          errorCode: ErrorCode.ACCESS_DENIED
        })
      }

      // Proceed to the next middleware if all checks pass
      next()
    } catch (error) {
      return res.status(500).json({
        message: "Server error during authorization",
        error
      })
    }
  }
}
