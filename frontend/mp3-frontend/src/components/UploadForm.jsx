import React, { useState } from "react"

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setMessage("");

      const response = await fetch("http://mp3converter.com/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT manually set "Content-Type" for FormData
        },
        body: formData,
      });

      const data = await response.text(); // Or use .json() if backend returns JSON

      if (response.ok) {
        setMessage("Upload successful!");
        setFile(null);
      } else {
        setMessage(`Upload failed: ${data}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
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
      {message && <p className="mt-2 text-center">{message}</p>}
    </form>
  );
}
