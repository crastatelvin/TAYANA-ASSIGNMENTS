import React, { useState, useEffect, useRef } from "react";
import "./FileUpload.css";

interface FileUploadProps {
  token: string;
}

export default function FileUpload({ token }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"info" | "success" | "error" | "">("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("");
      setStatusType("");
      setProcessingId(null);
    }
  };

  const startPolling = (fileId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    setProcessingId(fileId);
    setStatus("File uploaded. Background processing in progress...");
    setStatusType("info");

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/files/${fileId}/status`, {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        });

        const result = await response.json();

        if (result.status === "COMPLETED") {
          setStatus("Success! Knowledge extraction and vectorization complete.");
          setStatusType("success");
          setProcessingId(null);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (result.status === "FAILED") {
          setStatus("Error: Background processing failed.");
          setStatusType("error");
          setProcessingId(null);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (result.status === "PROCESSING") {
          setStatus("Still processing... (Extracting -> Chunking -> Embedding)");
        }
      } catch (error: any) {
        console.error("Polling error:", error);
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

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
    setStatus("Uploading file to server...");
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

      if (response.status === 202) {
        // Asynchronous flow started
        setFile(null);
        startPolling(result.fileId);
      } else if (response.ok) {
        // Fallback for synchronous response
        setStatus(`Successfully ingested ${result.data?.fileName || "file"}.`);
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
        className={`upload-btn ${processingId ? 'processing' : ''}`}
        onClick={handleUpload} 
        disabled={uploading || !!processingId || !file}
      >
        {uploading ? "Uploading..." : processingId ? "Processing..." : "Process Document"}
      </button>

      {status && (
        <div className={`upload-status status-${statusType}`}>
          {processingId && <div className="spinner-small"></div>}
          {status}
        </div>
      )}
    </div>
  );
}
