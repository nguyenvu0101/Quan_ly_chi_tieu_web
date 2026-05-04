import { useRef, useState, useEffect } from "react";
import { Download, Upload, X } from "lucide-react";
import { storageService } from "@/services/storageService";

export default function BankQRUpload({ userId, currentQRUrl, onQRChange }) {
  const [preview, setPreview] = useState(currentQRUrl || null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // Update preview khi currentQRUrl prop thay đổi (từ API call)
  useEffect(() => {
    if (currentQRUrl) {
      setPreview(currentQRUrl);
    }
  }, [currentQRUrl]);
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
      const { filePath } = await storageService.uploadAvatar(
        file,
        `qr-${userId}`,
      );
      onQRChange(filePath);
    } catch (err) {
      setError(err.message);
      setPreview(currentQRUrl || null);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveQR = () => {
    setPreview(null);
    onQRChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadQR = async () => {
    if (!preview) return;

    try {
      setDownloading(true);
      // Fetch ảnh dưới dạng blob để đảm bảo download từ Supabase URL
      const response = await fetch(preview);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-ngan-hang-${userId}.png`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Lỗi tải QR. Vui lòng thử lại!");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Preview */}
      <div className="w-64 h-64 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-purple-200">
        {preview ? (
          <img
            src={preview}
            alt="QR Ngân hàng"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <Upload size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Chưa có QR ngân hàng</p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
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
          {loading ? "Đang tải..." : "Upload QR"}
        </button>

        {preview && (
          <>
            <button
              onClick={downloadQR}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Download size={18} />
              {downloading ? "Đang tải..." : "Tải về"}
            </button>
            <button
              onClick={handleRemoveQR}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <X size={18} />
              Xóa
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}

      <p className="text-gray-600 text-sm text-center mt-2">
        Tải QR code ngân hàng lên để mọi người có thể chuyển khoản cho bạn
      </p>
    </div>
  );
}
