import mongoose, { Document, Schema } from "mongoose"

export interface IBlogger extends Document {
  name: string
  bio: string
  image: string
  // TODO: platform should be enum
  socialLinks: { platform: string; url: string }[]
}

const BloggerSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  bio: { type: String, required: true },
  image: { type: String }, // URL to blogger's image
  socialLinks: [
    {
      platform: { type: String },
      url: { type: String }
    }
  ]
})

// Post hook to handle cleanup after blogger deletion
// BloggerSchema.post(
//   ["findOneAndDelete", "deleteMany"],
//   async function (doc: IBlogger) {
//     try {
//       const bloggers: IBlogger[] = doc
//         ? [doc]
//         : await this.model.find(this.getFilter())

//       // Loop through each blogger and handle deletions
//       for (const blogger of bloggers) {
//         // 1. Delete blogger's image from GCS
//         if (blogger.image) {
//           const oldImageFileName = path.basename(blogger.image)
//           await deleteFileFromGCS(`bloggers/${oldImageFileName}`)
//         }

//         // 2. Find and delete all recommendations associated with the blogger
//         const recommendationIds = blogger.recommendations.map(id =>
//           id.toString()
//         )
//         await Recommendation.deleteMany({ _id: { $in: recommendationIds } })
//         // This will trigger any post hooks on the Recommendation model for further cleanup.
//       }
//     } catch (err) {
//       console.error("Error during blogger post-delete cleanup:", err)
//     }
//   }
// )

export default mongoose.model<IBlogger>("Blogger", BloggerSchema)
