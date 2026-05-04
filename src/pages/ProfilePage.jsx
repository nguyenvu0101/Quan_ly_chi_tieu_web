import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/authService";
import { Alert } from "@/components/Common";
import { User, Mail, Lock } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
import BankQRUpload from "@/components/QRCodeDisplay";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userAvatar, setUserAvatar] = useState(user?.avatar_url || null);
  const [userQR, setUserQR] = useState(user?.qr_url || null);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    username: user?.username || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load user profile data from API khi component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log("🔄 Loading profile for user ID:", user?.id);

        const response = await userService.getProfile();

        console.log("📦 Full response object:", response);
        console.log("📦 response.data:", response.data);
        console.log(
          "   Keys:",
          response.data ? Object.keys(response.data) : "null",
        );

        const profileData = response.data;

        console.log("🔍 Detailed profile data:");
        console.log("   id:", profileData?.id);
        console.log("   avatar_url:", profileData?.avatar_url);
        console.log("   qr_url:", profileData?.qr_url);
        console.log("   avatar_url type:", typeof profileData?.avatar_url);
        console.log("   qr_url type:", typeof profileData?.qr_url);

        // Update avatar từ API
        if (profileData?.avatar_url && profileData.avatar_url !== "null") {
          console.log("✅ Setting avatar from API");
          setUserAvatar(profileData.avatar_url);
        } else {
          console.warn("⚠️ No avatar_url or it's null");
        }

        // Update QR từ API
        if (profileData?.qr_url && profileData.qr_url !== "null") {
          console.log("✅ Setting QR from API");
          setUserQR(profileData.qr_url);
        } else {
          console.warn("⚠️ No qr_url or it's null");
        }
      } catch (err) {
        console.error(
          "❌ Error loading profile:",
          err.response?.data || err.message,
        );
      }
    };

    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await userService.updateProfile(formData);
      setSuccess("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Thay đổi mật khẩu thành công!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Thay đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (avatarUrl) => {
    try {
      setError("");
      setUserAvatar(avatarUrl);
      await userService.updateAvatar(avatarUrl);
      setSuccess("Cập nhật avatar thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật avatar thất bại");
      // Reload từ API nếu lỗi
      const response = await userService.getProfile();
      setUserAvatar(response.data?.avatar_url || null);
    }
  };

  const handleQRChange = async (qrUrl) => {
    try {
      setError("");
      setUserQR(qrUrl);
      await userService.updateQR(qrUrl);
      setSuccess("Cập nhật QR ngân hàng thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật QR thất bại");
      // Reload từ API nếu lỗi
      const response = await userService.getProfile();
      setUserQR(response.data?.qr_url || null);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Hồ sơ cá nhân</h1>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {/* Profile Info */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Thông tin cá nhân
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn-${isEditing ? "secondary" : "primary"}`}
          >
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="input-group">
              <label htmlFor="fullname" className="flex items-center gap-2">
                <User size={16} />
                Họ và tên
              </label>
              <input
                id="fullname"
                value={formData.fullname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullname: e.target.value }))
                }
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="username">Tên Đăng Nhập</label>
              <input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Họ và tên</p>
              <p className="text-gray-800 text-lg font-semibold">
                {user?.fullname}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tên người dùng</p>
              <p className="text-gray-800 text-lg font-semibold">
                {user?.username}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-800 text-lg font-semibold">
                {user?.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Avatar Upload */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Avatar</h2>
        <AvatarUpload
          userId={user?.id}
          currentAvatar={userAvatar}
          onAvatarChange={handleAvatarChange}
        />
      </div>

      {/* QR Ngân Hàng */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">QR Ngân hàng</h2>
        <BankQRUpload
          userId={user?.id}
          currentQRUrl={userQR}
          onQRChange={handleQRChange}
        />
      </div>

      {/* Change Password */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Thay đổi mật khẩu
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="input-group">
            <label
              htmlFor="currentPassword"
              className="flex items-center gap-2"
            >
              <Lock size={16} />
              Mật khẩu hiện tại
            </label>
            <input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="newPassword" className="flex items-center gap-2">
              <Lock size={16} />
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label
              htmlFor="confirmPassword"
              className="flex items-center gap-2"
            >
              <Lock size={16} />
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Đang thay đổi..." : "Thay đổi mật khẩu"}
          </button>
        </form>
      </div>

      {/* Logout */}
      <button onClick={logout} className="btn-danger w-full">
        Đăng xuất
      </button>
    </div>
  );
}
