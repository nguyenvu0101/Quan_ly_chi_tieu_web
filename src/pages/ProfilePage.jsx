import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/authService";
import { Alert } from "@/components/Common";
import { User, Mail, Lock } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
              <label htmlFor="username">Tên người dùng</label>
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
