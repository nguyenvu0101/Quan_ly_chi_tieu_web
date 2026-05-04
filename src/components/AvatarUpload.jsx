import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X } from "lucide-react";
import { storageService } from "@/services/storageService";

export default function AvatarUpload({
  userId,
  currentAvatar,
  onAvatarChange,
}) {
  const [preview, setPreview] = useState(currentAvatar || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update preview khi currentAvatar prop thay đổi (từ API call)
  useEffect(() => {
    if (currentAvatar) {
      setPreview(currentAvatar);
    }
  }, [currentAvatar]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError("");

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const { filePath } = await storageService.uploadAvatar(file, userId);
      onAvatarChange(filePath);
    } catch (err) {
      setError(err.message);
      setPreview(currentAvatar || null);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    onAvatarChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera size={48} className="text-gray-400" />
        )}

        {/* Upload Button Overlay */}
        <label
          htmlFor="avatar-input"
          className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center cursor-pointer"
        >
          <Upload size={24} className="text-white" />
        </label>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id="avatar-input"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={loading}
        className="hidden"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          <Upload size={18} />
          {loading ? "Đang tải..." : "Chọn ảnh"}
        </button>

        {preview && (
          <button
            onClick={handleRemoveAvatar}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            <X size={18} />
            Xóa
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
    </div>
  );
}
