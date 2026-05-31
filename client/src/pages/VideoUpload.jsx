import React, { useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { UploadCloud, FileVideo, CheckCircle2, AlertOctagon, RefreshCw, Eye } from "lucide-react";
import { useApp } from "../contexts/AppContext";

function VideoUpload() {
  const { token } = useApp();

  // Form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  // Status indicators
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const fileInputRef = useRef(null);

  // Client-Side Validation
  const validateFile = (selectedFile) => {
    setErrorMsg("");
    setSuccessMsg("");
    setUploadedVideo(null);

    if (!selectedFile) return false;

    // Allowed formats: mp4, webm, mov, mkv
    const allowedExtensions = ["mp4", "webm", "mov", "mkv"];
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    
    // Check extension
    if (!allowedExtensions.includes(fileExtension)) {
      setErrorMsg("Validation Error: Only MP4, WebM, MOV, and MKV video formats are supported.");
      return false;
    }

    // Check size limit: 100MB max
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxSize) {
      setErrorMsg("Validation Error: File size exceeds the 100MB maximum limit.");
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Final Validation check
    if (!title.trim()) {
      setErrorMsg("Validation Error: Please provide a video title.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Validation Error: Please provide a video description.");
      return;
    }
    if (!file) {
      setErrorMsg("Validation Error: Please select a video file to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", file);

    try {
      const res = await axios.post("/api/video/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      if (res.data?.success) {
        setSuccessMsg("Success! Video file uploaded successfully and optimized on Cloudinary!");
        setUploadedVideo(res.data.data);
        setFile(null);
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || "Failed to upload video to Cloudinary.";
      setErrorMsg(`Upload Failed: ${serverMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-stone-200 pb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <UploadCloud className="text-[#C84B31]" /> Cloudinary Studio
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            Upload new video assets directly to cloud storage with automatic resolution and compression optimizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form details column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Error alerts cards */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex gap-3 text-xs items-center font-bold">
                <AlertOctagon className="shrink-0 text-red-650" size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success message cards */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-xl p-4 flex gap-3 text-xs items-center font-bold">
                <CheckCircle2 className="shrink-0 text-emerald-750" size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="glass-panel p-6 rounded-2xl border border-stone-200/60 space-y-5 text-xs font-semibold text-stone-700 shadow-sm">
              
              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Video Title</label>
                <input
                  type="text"
                  placeholder="e.g. Real Madrid vs FC Barcelona Promo"
                  value={title}
                  disabled={uploading}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] font-bold shadow-sm placeholder-stone-350"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Short Description</label>
                <textarea
                  rows={4}
                  placeholder="Enter video summary details..."
                  value={description}
                  disabled={uploading}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] resize-none leading-relaxed font-bold shadow-sm placeholder-stone-350"
                />
              </div>

              {/* Drag and drop zone */}
              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Select Video File</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`w-full py-10 px-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    dragActive
                      ? "border-[#C84B31] bg-[#C84B31]/5"
                      : file
                      ? "border-emerald-500/40 bg-emerald-50/50"
                      : "border-stone-300 bg-white hover:border-[#C84B31]"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                    className="hidden"
                  />
                  {file ? (
                    <>
                      <FileVideo className="text-emerald-700 animate-bounce" size={32} />
                      <div className="text-center">
                        <p className="text-xs text-stone-900 font-bold max-w-xs truncate">{file.name}</p>
                        <p className="text-[10px] text-stone-500 mt-1 uppercase">
                          Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-stone-500 hover:text-stone-700" size={32} />
                      <div className="text-center space-y-1">
                        <p className="text-xs text-stone-900 font-bold">Drag and drop file here</p>
                        <p className="text-[10px] text-stone-500">or click to browse local storage</p>
                      </div>
                      <span className="text-[9px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                        MP4, WebM, MOV, MKV up to 100MB
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress HUD bar */}
              {uploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-stone-600">
                    <span className="flex items-center gap-1.5 uppercase font-bold">
                      <RefreshCw className="animate-spin" size={10} /> Uploading Content...
                    </span>
                    <span className="text-stone-900 font-black">{progress}%</span>
                  </div>
                  <div className="w-full bg-stone-250 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      style={{ width: `${progress}%` }}
                      className="bg-[#C84B31] h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={uploading || (!file && !title)}
                className="w-full py-4 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploading ? (
                  <>Processing Streaming Optimization...</>
                ) : (
                  <>Initiate Studio Upload</>
                )}
              </button>

            </form>
          </div>

          {/* Upload preview column */}
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-stone-200/60 space-y-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-3">
                <Eye size={14} className="text-[#C84B31]" /> Playback Preview
              </h3>

              {uploadedVideo ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-stone-200/60 shadow-2xl">
                    <video
                      key={uploadedVideo.videoUrl}
                      controls
                      poster={uploadedVideo.thumbnail}
                      className="w-full h-full object-cover"
                    >
                      <source src={uploadedVideo.videoUrl} type="video/mp4" />
                      Your browser does not support playing optimized streams.
                    </video>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-stone-900">{uploadedVideo.title}</h4>
                    <p className="text-[10px] text-stone-500 leading-relaxed font-bold line-clamp-3">
                      {uploadedVideo.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                      f_auto, q_auto optimized
                    </span>
                    <span className="text-[9px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                      {Math.floor(uploadedVideo.duration / 60)}m {Math.round(uploadedVideo.duration % 60)}s
                    </span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center text-center p-4 bg-stone-50">
                  <FileVideo size={24} className="text-stone-400 mb-2" />
                  <p className="text-[10px] text-stone-550 leading-normal max-w-xs font-semibold">
                    Once upload is complete, your optimized cloud video player preview will render here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}

export default VideoUpload;
