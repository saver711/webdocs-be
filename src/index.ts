import "./config/env.config"

// src/index.ts
import connectDB from "@utils/db.util"
import express from "express"
// ROUTES
import DashboardUser from "@models/dashboard-user.model"
import authRoutes from "@routes/auth.routes"
import bloggerRoutes from "@routes/blogger.routes"
import dashboardUserRoutes from "@routes/dashboard-user-management.routes"
import bcrypt from "bcryptjs"
import { DashboardUserRole } from "@models/user-role.enum"
import cors from "cors"

const app = express()

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // your Next.js URL
    credentials: true // ✅ allow cookies
  })
)
app.use(express.json())

// Routes

// dashboard-users routes
app.use("/api/dashboard-users", dashboardUserRoutes)

// app-users routes
app.use("/api/auth", authRoutes)

// Blogger routes
app.use("/api/bloggers", bloggerRoutes)

// Database connection
connectDB()

// Start the server
const PORT = process.env.PORT || "5000"
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const seedSuperAdmin = async () => {
  const superAdmin = await DashboardUser.findOne({
    email: process.env.SUPER_ADMIN_EMAIL
  })
  if (!superAdmin) {
    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD!,
      10
    )
    await DashboardUser.create({
      name: "Super",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: DashboardUserRole.SUPER_ADMIN
    })
    console.log(`${process.env.SUPER_ADMIN_EMAIL} user created.`)
  }
}

seedSuperAdmin()
