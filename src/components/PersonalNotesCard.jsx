import { useEffect, useState } from "react";
import { noteService } from "@/services/authService";
import { FileText, Save, Trash2, Plus } from "lucide-react";

export default function PersonalNotesCard({ userId = null }) {
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load notes when component mounts
  useEffect(() => {
    if (userId) {
      loadNotes();
    }
  }, [userId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await noteService.getNotes(userId);
      setNotes(res.data?.notes || []);
    } catch (err) {
      console.error("Lỗi khi tải ghi chú:", err);
      setError("Không thể tải ghi chú");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      setError("Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await noteService.createNote(userId, newNoteContent);
      setNotes([res.data.note, ...notes]);
      setNewNoteContent("");
    } catch (err) {
      console.error("Lỗi khi tạo ghi chú:", err);
      setError("Không thể tạo ghi chú");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingContent.trim()) {
      setError("Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await noteService.updateNote(noteId, editingContent);
      setNotes(
        notes.map((n) =>
          n.id === noteId ? { ...n, content: editingContent } : n,
        ),
      );
      setEditingId(null);
      setEditingContent("");
    } catch (err) {
      console.error("Lỗi khi cập nhật ghi chú:", err);
      setError("Không thể cập nhật ghi chú");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ghi chú này?")) return;

    try {
      setSaving(true);
      setError("");
      await noteService.deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Lỗi khi xóa ghi chú:", err);
      setError("Không thể xóa ghi chú");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditingContent(note.content);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
    setError("");
  };

  if (loading) {
    return (
      <div className="card">
        <p className="text-gray-400 text-sm">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm">Ghi chú cá nhân</p>
        </div>
        <div className="bg-purple-100 p-3 rounded-full">
          <FileText size={32} className="text-purple-600" />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-3 p-2 bg-red-50 rounded-lg">
          {error}
        </p>
      )}

      {/* Form thêm ghi chú mới */}
      <div className="mb-4">
        <div className="flex gap-2">
          <textarea
            value={newNoteContent}
            onChange={(e) => {
              setNewNoteContent(e.target.value);
              setError("");
            }}
            disabled={saving}
            placeholder="Thêm ghi chú mới..."
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none disabled:bg-gray-50"
            rows="2"
          />
          <button
            onClick={handleAddNote}
            disabled={saving || !newNoteContent.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            <Plus size={18} />
            Thêm
          </button>
        </div>
      </div>

      {/* Danh sách ghi chú - chỉ hiển thị 2 gần nhất, scroll để xem thêm */}
      <div className="border border-gray-200 rounded-lg bg-white max-h-56 overflow-y-auto">
        <div className="space-y-2 p-3">
          {notes.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-4">
              Chưa có ghi chú nào
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        <Save size={16} />
                        Lưu
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-gray-700 break-words line-clamp-3">
                        {note.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(note.created_at).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(note)}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={saving}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs transition disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
