// app/api/videos/upload/route.tsx
import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";

// Initialize ImageKit with environment variables
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT || "",
});


export async function POST(request: Request) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be logged in to upload a video" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Connect to the database
    await connectToDatabase();

    // Parse the form data
    const formData = await request.formData();
    const videoFile = formData.get("video") as File;
    const thumbnailFile = formData.get("thumbnail") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!videoFile || !thumbnailFile || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert files to buffers
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());

    // Upload video to ImageKit
    const videoUploadResponse = await imagekit.upload({
      file: videoBuffer,
      fileName: `video-${Date.now()}.mp4`,
      folder: "/videos",
    });

    // Upload thumbnail to ImageKit
    const thumbnailUploadResponse = await imagekit.upload({
      file: thumbnailBuffer,
      fileName: `thumbnail-${Date.now()}.jpg`,
      folder: "/thumbnails",
    });

    // Create a new video document
    const video = new Video({
      userId,
      title,
      description,
      videoUrl: videoUploadResponse.url,
      thumbnailUrl: thumbnailUploadResponse.url,
    });

    // Save the video to the database
    await video.save();

    return NextResponse.json({ success: true, video }, { status: 201 });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}