import Blogger from "@models/blogger.model"
import { Request, Response } from "express"
import { SortOrder } from "mongoose"

export const getAllBloggers = async (req: Request, res: Response) => {
  const {
    page = 1,
    perPage = 10,
    sortBy,
    sortOrder = "asc",
    populate,
    name,
    dateFrom,
    dateTo
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

    // Date range filtering
    if (dateFrom || dateTo) {
      matchStage.createdAt = {}

      if (dateFrom) {
        matchStage.createdAt.$gte = new Date(dateFrom as string)
      }

      if (dateTo) {
        matchStage.createdAt.$lte = new Date(dateTo as string)
      }
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

    // Project to include createdAt and other fields
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        bio: 1,
        image: 1,
        socialLinks: 1,
        createdAt: 1,
        updatedAt: 1
      }
    })

    const bloggers = await Blogger.aggregate(pipeline)

    const totalBloggers = await Blogger.countDocuments(matchStage) // Use matchStage for total count

    res.status(200).json({
      data: bloggers,
      pagination: {
        total: totalBloggers,
        currentPage: pageNumber,
        pageSize: pageSize,
        pageCount: Math.ceil(totalBloggers / pageSize)
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
