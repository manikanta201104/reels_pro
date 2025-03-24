// app/videos/[id]/page.tsx
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image"; // Import Image component

interface VideoPageProps {
  params: Promise<{ id: string }>; // Type params as a Promise
}

export default async function VideoPage({ params }: VideoPageProps) {
  // Resolve the params Promise
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Get userId from cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login"); // Redirect to login if userId is not found
  }

  // Connect to the database
  await connectToDatabase();

  // Fetch the video
  const video = await Video.findById(id);
  if (!video) {
    notFound(); // Returns a 404 if the video doesn't exist
  }

  // Server action to handle deletion
  const handleDelete = async () => {
    "use server";
    // Reconnect to the database in the server action
    await connectToDatabase();

    // Refetch the video to ensure it still exists
    const videoToDelete = await Video.findById(id);
    if (!videoToDelete) {
      throw new Error("Video not found");
    }

    // Check if the user owns the video
    if (videoToDelete.userId && videoToDelete.userId.toString() !== userId) {
      throw new Error("Forbidden");
    }

    // Delete the video
    await Video.findByIdAndDelete(id);
    redirect("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Video Details</h1>
      <p>
        <strong>Title:</strong> {video.title || "Untitled"}
      </p>
      <p>
        <strong>Description:</strong> {video.description || "No description"}
      </p>
      <Image
        src={video.thumbnailUrl}
        alt={video.title || "Video thumbnail"}
        className="w-full max-w-lg mt-4"
        width={640} // Adjust based on your design
        height={360} // Adjust based on your design
      />
      <video
        controls={video.controls ?? true}
        className="w-full max-w-lg mt-4"
        height={video.transformation?.height || 1080}
        width={video.transformation?.width || 1920}
      >
        <source src={video.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <form action={handleDelete} className="mt-4">
        <button type="submit" className="btn btn-error">
          Delete Video
        </button>
      </form>
    </div>
  );
}