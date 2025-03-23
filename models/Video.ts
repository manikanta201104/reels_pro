// models/Video.ts
import mongoose, { model, models, Schema } from "mongoose";

export const VIDEO_DIMENSIONS = {
  height: 1080,
  width: 1920,
};

export interface IVideo {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  controls?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId: mongoose.Types.ObjectId; // Add userId to associate videos with users
  transformation: {
    height: number;
    width: number;
    quality: number;
  };
}

const videoSchema = new mongoose.Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    controls: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Associate the video with a user
    },
    transformation: {
      height: {
        type: Number,
        default: VIDEO_DIMENSIONS.height,
      },
      width: {
        type: Number,
        default: VIDEO_DIMENSIONS.width,
      },
      quality: {
        type: Number,
        min: 1,
        max: 100,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Video = models.Video || model<IVideo>("Video", videoSchema);

export default Video;