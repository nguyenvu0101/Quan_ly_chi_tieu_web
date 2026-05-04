import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓" : "✗");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const storageService = {
  // Upload avatar lên Supabase Storage
  async uploadAvatar(file, userId) {
    try {
      if (!file) throw new Error("Chọn tệp ảnh");

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Chỉ hỗ trợ tệp ảnh");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Kích thước ảnh không vượt quá 5MB");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatar/${fileName}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      return {
        filePath: publicData.publicUrl,
        fileName: fileName,
      };
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw new Error(error.message || "Upload avatar thất bại");
    }
  },

  // Upload QR code lên Supabase Storage
  async uploadQRCode(qrBlob, userId) {
    try {
      if (!qrBlob) throw new Error("QR code không hợp lệ");

      const fileName = `qr-${userId}-${Date.now()}.png`;
      const filePath = `qr/${fileName}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, qrBlob, { upsert: true });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (error) {
      console.error("QR upload error:", error);
      throw new Error(error.message || "Upload QR code thất bại");
    }
  },

  // Delete file from storage
  async deleteFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from("images")
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error("Delete file error:", error);
      throw new Error(error.message || "Xóa tệp thất bại");
    }
  },
};
