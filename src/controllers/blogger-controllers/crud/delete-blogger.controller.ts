import { NextFunction, Request, Response } from "express"
import Blogger from "@models/blogger.model"
import { ErrorCode } from "@models/api/error-code.enum"

// Delete multiple bloggers (SUPER_ADMIN only)
export const deleteBloggers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { ids } = req.body // Expecting an array of IDs in the request body

  try {
    // Validate that ids is an array and not empty
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Invalid input: 'ids' must be a non-empty array",
        errorCode: ErrorCode.MISSING_DATA
      })
    }

    // Delete bloggers and get the result
    const deleteResult = await Blogger.deleteMany({
      _id: { $in: ids }
    })

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        message: "No bloggers found with the provided IDs",
        errorCode: ErrorCode.BLOGGER_NOT_FOUND
      })
    }

    res.status(200).json({
      message: "Bloggers deleted successfully",
      deletedCount: deleteResult.deletedCount
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}
