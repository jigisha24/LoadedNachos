import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from 'lucide-react';

export function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setIsSuccess(false);
      setError(null);
    }
  };



  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError(null);
    setIsSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed from backend");
      }

      setIsSuccess(true);
    } catch (error: any) {
      console.error(error);
      setError("We are experiencing an error right now, please try again later.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Dataset</h1>
        <p className="text-gray-400">Upload your historical loan data (CSV) to analyze for potential bias.</p>
      </div>

      <Card className="text-center">
        <div
          className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 flex flex-col items-center justify-center
            ${isDragging ? 'border-neon-teal bg-neon-teal/5' : 'border-charcoal-700 bg-charcoal-800/50'}
            ${file ? 'border-neon-green/50 bg-neon-green/5' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-charcoal-900 rounded-full">
                <FileType className="w-10 h-10 text-neon-green" />
              </div>
              <div>
                <p className="text-white font-medium text-lg">{file.name}</p>
                <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Remove file
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 bg-charcoal-900 rounded-full mb-4">
                <UploadCloud className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Drag & drop your file here</h3>
              <p className="text-gray-400 mb-6">or click to browse your computer</p>
              <label className="cursor-pointer">
                <span className="relative inline-flex items-center justify-center font-medium rounded-lg px-6 py-2.5 transition-all duration-300 bg-charcoal-800 text-white hover:bg-charcoal-700 hover:text-neon-green border border-charcoal-700">Browse Files</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    console.log("Selected file:", selectedFile);
                    setFile(selectedFile);
                  }}
                />
              </label>
            </>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-center space-x-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg text-left">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center">
          {!isSuccess && (
            <Button 
              className="w-full md:w-auto min-w-[200px]" 
              disabled={!file || isUploading}
              onClick={handleUpload}
              isLoading={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Dataset"}
            </Button>
          )}
          
          {isSuccess && (
            <div className="flex items-center space-x-2 text-neon-green animate-in slide-in-from-bottom-2 fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>Dataset successfully uploaded! You can now view the Dashboard.</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
