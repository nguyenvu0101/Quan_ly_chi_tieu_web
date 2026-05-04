import { useState } from "react";
import { Download, X, ChevronDown } from "lucide-react";

export default function MemberQRViewer({ members, roomName }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const downloadQR = async (member) => {
    if (!member.qr_url) {
      alert("Thành viên này chưa cập nhật QR ngân hàng");
      return;
    }

    try {
      // Fetch ảnh dưới dạng blob để đảm bảo download
      const response = await fetch(member.qr_url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-${member.full_name || member.username}.png`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Lỗi tải QR. Vui lòng thử lại!");
    }
  };

  return (
    <div className="mb-8">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full card bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            👥 Thành viên phòng
          </h2>
          <ChevronDown
            size={24}
            className={`text-gray-600 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Member List - Expanded */}
      {isExpanded && (
        <div className="mt-3 card">
          <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="text-center hover:opacity-75 transition cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                {/* Avatar */}
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-xl mb-2 overflow-hidden border-2 border-gray-200">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    member.full_name?.charAt(0).toUpperCase() || "?"
                  )}
                </div>

                {/* Name */}
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {member.full_name || member.username}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal - Chi tiết thành viên */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedMember.full_name || selectedMember.username}
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Avatar */}
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-2xl mb-4 overflow-hidden">
              {selectedMember.avatar_url ? (
                <img
                  src={selectedMember.avatar_url}
                  alt={selectedMember.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                selectedMember.full_name?.charAt(0).toUpperCase() || "?"
              )}
            </div>

            {/* Info */}
            {/* <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">
                Tên đăng nhập: {selectedMember.username}
              </p>
            </div> */}

            {/* QR Code */}
            {selectedMember.qr_url ? (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
                <img
                  src={selectedMember.qr_url}
                  alt="QR Ngân hàng"
                  className="w-48 h-48 mx-auto"
                />
                <p className="text-gray-600 text-sm mt-2">
                  QR Ngân hàng - Quét để chuyển khoản
                </p>

                {/* Download Button */}
                <button
                  onClick={() => downloadQR(selectedMember)}
                  className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Download size={18} />
                  Tải QR về
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center text-gray-500">
                Thành viên chưa cập nhật QR ngân hàng
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
