import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useDropzone } from 'react-dropzone';
import { Upload, Link, Download } from 'lucide-react';

const ASPECT_RATIOS = {
  custom: undefined,
  original: undefined,
  story: 9 / 16,
  square: 1,
  landscape: 16 / 9,
  wide: 2,
  portrait: 2 / 3,
};

export default function ImageCropper() {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [selectedRatio, setSelectedRatio] = useState<keyof typeof ASPECT_RATIOS>('original');
  const [urlInput, setUrlInput] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => 
        setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(urlInput);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.addEventListener('load', () => 
        setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const getCroppedImg = () => {
    if (!imgRef.current || !crop) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'cropped-image.png';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Image Cropper</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400'}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <p className="text-lg">Drag & drop an image here, or click to select</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter image URL..."
                  className="flex-1 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  <Link className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Aspect Ratio</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(ASPECT_RATIOS).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setSelectedRatio(ratio as keyof typeof ASPECT_RATIOS)}
                    className={`px-4 py-2 rounded capitalize transition-colors
                      ${selectedRatio === ratio
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {imgSrc && crop && (
              <button
                onClick={getCroppedImg}
                className="w-full px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Cropped Image
              </button>
            )}
          </div>
        </div>

        {imgSrc && (
          <div className="bg-gray-800 rounded-lg p-4 overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={ASPECT_RATIOS[selectedRatio]}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Upload"
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>
        )}
      </div>
    </div>
  );
}