import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, Star, Plus } from 'lucide-react';
import { messService } from '../../services/messService';
import toast from 'react-hot-toast';

const ImageUpload = ({ images, setImages, coverImage, setCoverImage }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const data = await messService.uploadImage(file);
      if (data.success) {
        const newUrl = data.url;
        setImages(prev => [...prev, newUrl]);
        // If no cover image yet, set this one as cover
        if (!coverImage) {
          setCoverImage(newUrl);
        }
      }
    } catch (err) {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setImages(prev => prev.filter(img => img !== url));
    if (coverImage === url) {
      setCoverImage(images.find(img => img !== url) || '');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all text-slate-500 hover:text-orange-600 group"
        >
          <ImageIcon className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Gallery</span>
        </button>
        
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-slate-500 hover:text-emerald-600 group"
        >
          <Camera className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Camera</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
        <input
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
      </div>

      {/* Uploading State */}
      {uploading && (
        <div className="flex items-center justify-center py-4 bg-orange-50 rounded-2xl border border-orange-100">
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin mr-2" />
          <span className="text-xs font-bold text-orange-600">Uploading your photo...</span>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
            <img src={url} alt={`Mess preview ${idx}`} className="w-full h-full object-cover" />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCoverImage(url)}
                className={`p-2 rounded-full transition-all ${coverImage === url ? 'bg-orange-500 text-white' : 'bg-white text-slate-900 hover:bg-orange-500 hover:text-white'}`}
                title="Set as cover"
              >
                <Star className={`w-4 h-4 ${coverImage === url ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="p-2 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cover Badge */}
            {coverImage === url && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-[10px] font-black rounded-lg shadow-lg">
                COVER
              </div>
            )}
          </div>
        ))}
        
        {images.length < 6 && !uploading && (
           <button
             type="button"
             onClick={() => fileInputRef.current?.click()}
             className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
           >
             <Plus className="w-6 h-6 mb-1" />
             <span className="text-[10px] font-bold">Add More</span>
           </button>
        )}
      </div>

      {images.length === 0 && !uploading && (
        <div className="text-center py-8 bg-slate-50 rounded-[28px] border-2 border-dashed border-slate-100">
           <ImageIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
           <p className="text-xs text-slate-400 font-medium">No photos uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
