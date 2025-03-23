// app/components/VideoUploadForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "./Notification";

export default function VideoUploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !videoFile || !thumbnailFile) {
      showNotification("All fields are required", "error");
      return;
    }

    setUploading(true);

    try {
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1] || "";

      if (!userId) {
        showNotification("You must be logged in to upload a video", "error");
        setUploading(false);
        return;
      }

      // Create a FormData object to send the files
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("videoFile", videoFile);
      formData.append("thumbnailFile", thumbnailFile);

      const res = await fetch("/api/videos/upload", {
        method: "POST",
        headers: {
          "x-user-id": userId,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("Video uploaded successfully", "success");
        router.push("/");
      } else {
        showNotification(data.error || "Failed to upload video", "error");
      }
    } catch (error) {
      showNotification("An error occurred while uploading the video", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="videoFile" className="block mb-1">
            Video File
          </label>
          <input
            type="file"
            id="videoFile"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="thumbnailFile" className="block mb-1">
            Thumbnail File
          </label>
          <input
            type="file"
            id="thumbnailFile"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
}