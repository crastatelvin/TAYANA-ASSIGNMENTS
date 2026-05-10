import React, { useState } from "react";
import "./FileUpload.css";

interface FileUploadProps {
  token: string;
}

export default function FileUpload({ token }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"info" | "success" | "error" | "">("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("");
      setStatusType("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    if (!token) {
      alert("Please provide a JWT token!");
      return;
    }

    setUploading(true);
    setStatus("Ingesting knowledge into the vector store...");
    setStatusType("info");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`Successfully ingested ${result.data.fileName}. ${result.data.chunksCount} vectors created.`);
        setStatusType("success");
        setFile(null);
      } else {
        setStatus(`Error: ${result.message}`);
        setStatusType("error");
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setStatusType("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <h3>
        <span className="upload-icon">📁</span> Ingest Knowledge
      </h3>
      
      <div className="upload-area">
        <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
        <p>{file ? "Change file" : "Drop files here or click to browse"}</p>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PDF, DOCX or TXT</span>
        {file && <div className="file-name">Selected: {file.name}</div>}
      </div>

      <button 
        className="upload-btn" 
        onClick={handleUpload} 
        disabled={uploading || !file}
      >
        {uploading ? "Ingesting..." : "Process Document"}
      </button>

      {status && (
        <div className={`upload-status status-${statusType}`}>
          {status}
        </div>
      )}
    </div>
  );
}
