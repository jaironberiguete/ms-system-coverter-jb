import React, { useState, useRef } from "react";
import Mp3FlowAnimation from "../utils/Mp3FlowAnimation";
import { UploadCloud } from "lucide-react";
import { Loader2, Music } from "lucide-react";


export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const isSubmitting = useRef(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("File selected");
    setProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    if (!file) {
      setStatus("Please select a file first");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("access", '{"some":"data"}');
    formData.append("file", file);

    try {
      isSubmitting.current = true;
      setUploading(true);
      setStatus("Uploading video...");
      setProgress(25);

      const response = await fetch("http://mp3converter.com/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      setProgress(100);
      setStatus("Conversion complete ✔");

      // later: response could return mp3 URL
    } catch (err) {
      console.error(err);
      setStatus("Upload failed ❌");
    } finally {
      setUploading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-2">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Main Card */}
        <div className="md:col-span-2 bg-white/10 backdrop-blur rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-1">
            Convert Video to MP3
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            Upload a video file — conversion happens on the server.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border border-dashed border-white/20 rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                />
                <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-5 py-3 rounded-lg
                          bg-white/10 hover:bg-white/20 transition
                          border border-white/10"
              >
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium">
                  {file ? "Change file" : "Choose video file"}
                </span>
              </button>
            </div>

            <button
                type="submit"
                disabled={uploading}
                className="
                  flex items-center justify-center gap-2
                  bg-indigo-500 hover:bg-indigo-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  px-6 py-3 rounded-lg font-medium transition
                "
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5" />
                    Convert to MP3
                  </>
                )}
              </button>
          </form>

          {/* Progress */}
          {uploading && (
            <div className="mt-4 w-full bg-white/20 rounded">
              <div
                className="bg-indigo-400 h-2 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <h3 className="font-semibold mb-2">Quick tips</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Supported: mp4, mov, mkv, webm</li>
              <li>• Large files may take longer</li>
              <li>• Secure authenticated uploads</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <h3 className="font-semibold mb-2">Status</h3>
            <p className="text-sm text-gray-300">{status}</p>
          </div>
          
        </div>
        
      </div>
      <Mp3FlowAnimation />
    </div>
  );
}

