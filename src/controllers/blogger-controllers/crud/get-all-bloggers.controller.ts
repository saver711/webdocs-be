import Blogger from "@models/blogger.model"
import { Request, Response } from "express"
import { SortOrder } from "mongoose" // Import SortOrder type
export const getAllBloggers = async (req: Request, res: Response) => {
  const {
    page = 1,
    perPage = 10,
    sortBy,
    sortOrder = "asc",
    populate,
    name
  } = req.query

  try {
    const pageNumber = +page
    const pageSize = +perPage

    // Construct the pipeline for aggregation
    const pipeline: any[] = []

    // Filtering logic
    const matchStage: any = {}
    if (name) {
      matchStage.name = { $regex: new RegExp(name as string, "i") } // Case-insensitive name search
    }
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    const sortOptions: { [key: string]: SortOrder } = {}
    if (sortBy) {
      sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1
    } else {
      sortOptions["_id"] = 1 // Default sort by insertion order
    }
    pipeline.push({
      $sort: sortOptions
    })

    // Pagination
    pipeline.push({
      $skip: (pageNumber - 1) * pageSize
    })
    pipeline.push({
      $limit: pageSize
    })

    // Add dynamic population if requested
    if (populate) {
      const fieldsToPopulate = (populate as string).split(",")
      fieldsToPopulate.forEach(field => {
        pipeline.push({
          $lookup: {
            from: field,
            localField: field,
            foreignField: "_id",
            as: field
          }
        })
      })
    }

    const bloggers = await Blogger.aggregate(pipeline)

    const totalBloggers = await Blogger.countDocuments(matchStage) // Use matchStage for total count

    res.status(200).json({
      data: bloggers,
      pagination: {
        total: totalBloggers,
        currentPage: pageNumber,
        pageSize: pageSize
      },
      message: "Bloggers fetched successfully"
    })
  } catch (error) {
    res.status(500).json({
      error,
      message: "Failed to fetch bloggers"
    })
  }
}
