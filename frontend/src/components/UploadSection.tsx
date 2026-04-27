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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setIsSuccess(false);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setIsSuccess(false);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setIsSuccess(true);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
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
                <Button variant="secondary" as="span">Browse Files</Button>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv"
                  onChange={handleFileChange}
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
          <Button 
            className="w-full md:w-auto min-w-[200px]" 
            disabled={!file && !isUploading}
            isLoading={isUploading}
            onClick={handleUpload}
          >
            {isUploading ? 'Uploading...' : 'Upload & Analyze'}
          </Button>
          
          {isSuccess && (
            <div className="mt-4 flex items-center space-x-2 text-neon-green animate-in slide-in-from-bottom-2 fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>Dataset successfully uploaded! You can now view the Dashboard.</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
