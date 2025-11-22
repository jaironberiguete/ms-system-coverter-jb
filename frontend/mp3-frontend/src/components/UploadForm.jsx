import React, { useState, useRef } from "react";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const isSubmitting = useRef(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("access", '{"some":"data"}'); // exact text field
    formData.append("file", file);

    try {
      isSubmitting.current = true;
      setUploading(true);
      setMessage("");
      setProgress(0);

      const response = await fetch("http://mp3converter.com/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.text();

      if (response.ok) {
        setMessage("Upload successful!");
        setFile(null);
        setProgress(100);
      } else {
        setMessage(`Upload failed: ${data}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="block w-full border p-2"
      />
      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Video"}
      </button>

      {uploading && progress > 0 && (
        <div className="w-full bg-gray-200 rounded mt-2">
          <div
            className="bg-blue-600 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {message && <p className="mt-2 text-center">{message}</p>}
    </form>
  );
}
