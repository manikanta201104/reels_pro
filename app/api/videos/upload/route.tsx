// app/api/videos/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import ImageKit from "imagekit";

// Initialize ImageKit (if you're using it)
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  try {
    // Get userId from the request header
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the FormData
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const videoFile = formData.get("videoFile") as File;
    const thumbnailFile = formData.get("thumbnailFile") as File;

    if (!title || !description || !videoFile || !thumbnailFile) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Upload video to ImageKit
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const videoUploadResponse = await imagekit.upload({
      file: videoBuffer,
      fileName: videoFile.name,
      folder: "/videos",
    });

    // Upload thumbnail to ImageKit
    const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
    const thumbnailUploadResponse = await imagekit.upload({
      file: thumbnailBuffer,
      fileName: thumbnailFile.name,
      folder: "/thumbnails",
    });

    // Connect to the database
    await connectToDatabase();

    // Save the video to MongoDB
    const newVideo = new Video({
      title,
      description,
      videoUrl: videoUploadResponse.url,
      thumbnailUrl: thumbnailUploadResponse.url,
      userId,
      transformation: {
        height: 1080,
        width: 1920,
        quality: 80,
      },
    });

    await newVideo.save();

    return NextResponse.json(
      { message: "Video uploaded successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Failed to upload video", details: errorMessage },
      { status: 500 }
    );
  }
}