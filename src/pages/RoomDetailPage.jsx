import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  roomService,
  expenseService,
  balanceService,
} from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, EmptyState, LoadingSpinner } from "@/components/Common";
import { Trash2, Plus, ChevronDown, X } from "lucide-react";
import MemberQRViewer from "@/components/MemberQRViewer";

const TIME_PERIODS = [
  { value: null, label: "Tất cả" },
  { value: "week", label: "1 tuần" },
  { value: "month", label: "1 tháng" },
  { value: "3months", label: "3 tháng" },
  { value: "6months", label: "6 tháng" },
  { value: "year", label: "1 năm" },
];

// 🔧 Hàm format ngày theo tiếng Việt (DD/MM/YYYY)
const formatDateVN = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [period, setPeriod] = useState("week"); // 🔧 Mặc định 1 tuần
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expandedExpense, setExpandedExpense] = useState(null);
  const [expenseDetails, setExpenseDetails] = useState({});
  const [showAllExpenses, setShowAllExpenses] = useState(false); // 🔧 Mới
  const [showBalances, setShowBalances] = useState(false); // 🔧 Mở/đóng danh sách nợ
  const [myTotal, setMyTotal] = useState(0); // Chi tiêu cá nhân
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "food",
    paid_by: "",
    participant_ids: [],
    split_type: "equal",
    custom_split: {},
    split_amounts: {}, // 🔧 Thêm để lưu số tiền cho từng người
    expense_date: new Date().toISOString().split("T")[0], // 🔧 Ngày chi tiêu (mặc định hôm nay)
  });

  // 🔧 Hàm tái sử dụng để fetch dữ liệu
  const refetchData = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      console.log(
        "🔄 Fetching room details for roomId:",
        roomId,
        "period:",
        period,
      );

      const [roomRes, balancesRes] = await Promise.all([
        roomService.getRoomDetail(roomId, period),
        balanceService.getBalances(roomId),
      ]);

      console.log("📦 Room response:", roomRes.data);
      console.log("📦 Balances response:", balancesRes.data);

      // Handle different response formats
      const roomData = roomRes.data?.room || roomRes.data;
      const membersData = roomRes.data?.members || roomData?.members || [];
      const expensesData = (roomRes.data?.expenses || []).sort(
        (a, b) => new Date(b.expense_date) - new Date(a.expense_date),
      );
      const expensesSummary = roomRes.data?.expenses_summary || {};
      const balancesData =
        balancesRes.data?.balances ||
        balancesRes.data?.data ||
        balancesRes.data ||
        [];

      setRoom(roomData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setBalances(Array.isArray(balancesData) ? balancesData : []);

      // Tinh myTotal: tổng amount của những expense mà user là payer
      const calculatedMyTotal = (
        Array.isArray(expensesData) ? expensesData : []
      ).reduce((sum, exp) => {
        return sum + (exp.is_payer ? parseFloat(exp.amount || 0) : 0);
      }, 0);
      setMyTotal(calculatedMyTotal);

      // Reset form khi fetch xong
      setNewExpense((prev) => ({
        ...prev,
        paid_by: user?.id?.toString() || "",
        participant_ids: [],
        custom_split: {},
        expense_date: new Date().toISOString().split("T")[0],
      }));

      console.log("✅ Data loaded successfully");
    } catch (err) {
      console.error("❌ Error fetching room data:", err);
      setError("Không thể tải dữ liệu phòng");
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  // Fetch dữ liệu lần đầu
  useEffect(() => {
    refetchData();
  }, [roomId, period]);

  // 🔧 Auto-refresh dữ liệu mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("⏱️ Auto-refreshing data...");
      refetchData(false); // Không hiển thị loading spinner khi auto-refresh
    }, 30000); // 30 giây

    return () => clearInterval(interval); // Cleanup khi component unmount
  }, [roomId, period]);

  // Lấy chi tiết chi tiêu khi click
  const handleExpandExpense = async (expenseId) => {
    if (expandedExpense === expenseId) {
      setExpandedExpense(null);
      return;
    }

    try {
      if (expenseDetails[expenseId]) {
        setExpandedExpense(expenseId);
        return;
      }

      const res = await expenseService.getExpenseDetail(expenseId);
      const detail = res.data?.expense || res.data?.data || {};
      const participants = res.data?.participants || [];

      setExpenseDetails((prev) => ({
        ...prev,
        [expenseId]: { ...detail, participants },
      }));
      setExpandedExpense(expenseId);
    } catch (err) {
      console.error("❌ Error fetching expense detail:", err);
      setError("Không thể tải chi tiết chi tiêu");
    }
  };

  // Xử lý thêm chi tiêu
  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (
      !newExpense.amount ||
      !newExpense.description ||
      !newExpense.paid_by ||
      newExpense.participant_ids.length === 0
    ) {
      setError("Vui lòng nhập đủ thông tin");
      return;
    }

    try {
      const payload = {
        room_id: parseInt(roomId),
        amount: parseFloat(newExpense.amount),
        description: newExpense.description.trim(),
        category: newExpense.category,
        paid_by: parseInt(newExpense.paid_by),
        participant_ids: newExpense.participant_ids.map((id) => parseInt(id)),
        split_type: newExpense.split_type,
        expense_date: newExpense.expense_date, // 🔧 Thêm ngày chi tiêu
      };

      // Xử lý chia theo số tiền cố định
      if (newExpense.split_type === "amount") {
        const totalAmount = parseFloat(newExpense.amount);
        const customSplit = {};
        let splitTotal = 0;

        // Tính tổng số tiền được chia và phần trăm
        for (const userId of newExpense.participant_ids) {
          const amount = parseFloat(newExpense.split_amounts[userId]) || 0;
          splitTotal += amount;
          const percent = (amount / totalAmount) * 100;
          customSplit[userId] = percent;
        }

        // Kiểm tra tổng số tiền có bằng total không
        if (Math.abs(splitTotal - totalAmount) > 0.01) {
          setError(
            `Lỗi: Tổng chia (${splitTotal.toLocaleString()} đ) không bằng tổng chi tiêu (${totalAmount.toLocaleString()} đ). Vui lòng điều chỉnh!`,
          );
          return;
        }

        payload.split_type = "custom";
        payload.custom_split = customSplit;
      }
      // Xử lý chia theo phần trăm
      else if (
        newExpense.split_type === "custom" &&
        Object.keys(newExpense.custom_split).length > 0
      ) {
        payload.custom_split = newExpense.custom_split;
      }

      console.log("📤 Adding expense:", payload);
      const response = await expenseService.addExpense(payload);
      console.log("✅ Expense added successfully!");
      setSuccess("✅ Thêm giao dịch thành công!");
      setTimeout(() => setSuccess(""), 2000);

      // Reset form
      setNewExpense({
        amount: "",
        description: "",
        category: "food",
        paid_by: user?.id?.toString() || "",
        participant_ids: [],
        split_type: "equal",
        custom_split: {},
        split_amounts: {},
        expense_date: new Date().toISOString().split("T")[0],
      });
      setShowAddExpense(false);
      setError("");

      // 🔄 Auto-refresh dữ liệu ngay lập tức
      await refetchData(false);
    } catch (err) {
      console.error("❌ Error adding expense:", err);
      setError(err.response?.data?.message || "Không thể thêm chi tiêu");
    }
  };

  // Xóa chi tiêu
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Xác nhận xóa chi tiêu này?")) return;

    try {
      await expenseService.deleteExpense(expenseId);
      setSuccess("✅ Xóa giao dịch thành công!");
      setTimeout(() => setSuccess(""), 2000);
      setError("");

      // 🔄 Auto-refresh dữ liệu ngay lập tức
      await refetchData(false);
    } catch (err) {
      console.error("❌ Error deleting expense:", err);
      setError("Không thể xóa chi tiêu");
    }
  };

  // Settle balance (thanh toán nợ)
  const handleSettleBalance = async (balanceId) => {
    if (!window.confirm("Xác nhận đã thanh toán?")) return;

    try {
      await balanceService.settleBalance(balanceId);
      setBalances((prev) => prev.filter((b) => b.id !== balanceId));
      setError("");
    } catch (err) {
      console.error("❌ Error settling balance:", err);
      setError("Không thể cập nhật thanh toán");
    }
  };

  // Toggle participant
  const toggleParticipant = (userId) => {
    const userIdStr = userId.toString();
    setNewExpense((prev) => {
      const isSelected = prev.participant_ids.includes(userIdStr);
      const newParticipants = isSelected
        ? prev.participant_ids.filter((id) => id !== userIdStr)
        : [...prev.participant_ids, userIdStr];

      // Nếu là custom split, cập nhật custom_split
      let newCustomSplit = { ...prev.custom_split };
      if (prev.split_type === "custom") {
        if (!isSelected) {
          newCustomSplit[userIdStr] = 100 / newParticipants.length;
          // Redistribute cho những người khác
          Object.keys(newCustomSplit).forEach((id) => {
            if (id !== userIdStr && newParticipants.includes(id)) {
              newCustomSplit[id] = 100 / newParticipants.length;
            }
          });
        } else {
          delete newCustomSplit[userIdStr];
        }
      }

      return {
        ...prev,
        participant_ids: newParticipants,
        custom_split: newCustomSplit,
      };
    });
  };

  // Cập nhật custom split
  const updateCustomSplit = (userId, percent) => {
    const userIdStr = userId.toString();
    const value = percent === "" ? 0 : parseFloat(percent) || 0;
    setNewExpense((prev) => ({
      ...prev,
      custom_split: {
        ...prev.custom_split,
        [userIdStr]: value,
      },
    }));
  };

  // Cập nhật split theo số tiền cố định
  const updateSplitAmount = (userId, amount) => {
    const userIdStr = userId.toString();
    const value = amount === "" ? 0 : parseFloat(amount) || 0;
    setNewExpense((prev) => ({
      ...prev,
      split_amounts: {
        ...prev.split_amounts,
        [userIdStr]: value,
      },
    }));
  };

  if (loading) return <LoadingSpinner />;
  if (!room) return <div className="container py-8">Không tìm thấy phòng</div>;

  const myDebt = balances.filter((b) => b.debtor_id === user?.id);
  const myCredit = balances.filter((b) => b.creditor_id === user?.id);

  return (
    <div className="container py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{room.room_name}</h1>
        <p className="text-gray-600">Mã phòng: {room.room_code}</p>
      </div>

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

      {/* Filter theo thời gian */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {TIME_PERIODS.map((tp) => (
          <button
            key={tp.value || "all"}
            onClick={() => setPeriod(tp.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === tp.value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tp.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <p className="text-gray-600 text-sm">Chi tiêu của bạn</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {myTotal.toLocaleString()} đ
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Bạn nợ</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            {(
              Math.round(myDebt.reduce((sum, b) => sum + b.amount, 0) / 1000) *
              1000
            ).toLocaleString()}{" "}
            đ
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Người nợ bạn</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {(
              Math.round(
                myCredit.reduce((sum, b) => sum + b.amount, 0) / 1000,
              ) * 1000
            ).toLocaleString()}{" "}
            đ
          </p>
        </div>
      </div>

      {/* Add Expense Button */}
      {!showAddExpense && (
        <button
          onClick={() => setShowAddExpense(true)}
          className="btn-primary w-full mb-8 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Thêm chi tiêu
        </button>
      )}

      {/* Form Thêm Chi Tiêu */}
      {showAddExpense && (
        <div className="card mb-8 bg-blue-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Thêm chi tiêu mới</h3>
            <button
              onClick={() => setShowAddExpense(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-4">
            {/* Số tiền */}
            <div className="input-group">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Số tiền (đ) *
              </label>
              <input
                id="amount"
                type="number"
                min="0"
                step="1000"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mô tả */}
            <div className="input-group">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Mô tả *
              </label>
              <input
                id="description"
                type="text"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Ăn cơm trưa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Danh mục */}
            <div className="input-group">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Danh mục
              </label>
              <select
                id="category"
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="food">🍽️ Ăn uống</option>
                <option value="transport">🚗 Giao thông</option>
                <option value="entertainment">🎬 Giải trí</option>
                <option value="shopping">🛍️ Mua sắm</option>
                <option value="other">📦 Khác</option>
              </select>
            </div>

            {/* Ngày chi tiêu */}
            <div className="input-group">
              <label
                htmlFor="expense_date"
                className="block text-sm font-medium text-gray-700"
              >
                Ngày chi tiêu
              </label>
              <input
                id="expense_date"
                type="date"
                value={newExpense.expense_date}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    expense_date: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Người thanh toán */}
            <div className="input-group">
              <label
                htmlFor="paid_by"
                className="block text-sm font-medium text-gray-700"
              >
                Người thanh toán *
              </label>
              <select
                id="paid_by"
                value={newExpense.paid_by}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    paid_by: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn người --</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.full_name || member.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Người tham gia */}
            <div className="input-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người tham gia *
              </label>

              <div className="border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
                {members.map((member) => {
                  const isChecked = newExpense.participant_ids.includes(
                    member.user_id.toString(),
                  );

                  return (
                    <label
                      key={member.user_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f3f4f6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleParticipant(member.user_id)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "#374151" }}>
                        {member.full_name || member.username}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            {/* Cách chia tiền */}
            <div className="input-group">
              <label
                htmlFor="split_type"
                className="block text-sm font-medium text-gray-700"
              >
                Cách chia tiền
              </label>
              <select
                id="split_type"
                value={newExpense.split_type}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    split_type: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="equal">Chia đều</option>
                <option value="custom">Chia tùy chỉnh (%)</option>
                <option value="amount">Chia theo số tiền</option>
              </select>
            </div>

            {/* Custom Split */}
            {newExpense.split_type === "custom" &&
              newExpense.participant_ids.length > 0 && (
                <div className="input-group bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Phần trăm chia cho từng người:
                  </p>
                  <div className="space-y-2">
                    {newExpense.participant_ids.map((userId) => {
                      const member = members.find(
                        (m) => m.user_id.toString() === userId,
                      );
                      const percent =
                        newExpense.custom_split[userId] ||
                        100 / newExpense.participant_ids.length;
                      return (
                        <div key={userId} className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 flex-1 min-w-32">
                            {member?.full_name || member?.username}
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={percent === 0 ? "" : percent}
                            placeholder="0"
                            onChange={(e) =>
                              updateCustomSplit(userId, e.target.value)
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600 w-4">%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Split Amount - Chia theo số tiền */}
            {newExpense.split_type === "amount" &&
              newExpense.participant_ids.length > 0 && (
                <div className="input-group bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Nhập số tiền cho từng người (tổng:{" "}
                    {(parseFloat(newExpense.amount) || 0).toLocaleString()} đ):
                  </p>
                  <div className="space-y-2">
                    {newExpense.participant_ids.map((userId) => {
                      const member = members.find(
                        (m) => m.user_id.toString() === userId,
                      );
                      const amount = newExpense.split_amounts[userId] || 0;
                      return (
                        <div key={userId} className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 flex-1 min-w-32">
                            {member?.full_name || member?.username}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={amount === 0 ? "" : amount}
                            placeholder="0"
                            onChange={(e) =>
                              updateSplitAmount(userId, e.target.value)
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600 w-8">đ</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn-primary flex-1">
                Thêm chi tiêu
              </button>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="btn-secondary flex-1"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách nợ */}
      {balances.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="w-full card bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                💰 Thanh toán
              </h2>
              <ChevronDown
                size={24}
                className={`text-gray-600 transition-transform ${
                  showBalances ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {/* Danh sách nợ mở rộng */}
          {showBalances && (
            <div className="space-y-3 mt-3">
              {balances.map((balance) => (
                <div
                  key={balance.id}
                  className="card bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm mb-2">
                        <span className="font-bold text-red-600">
                          {balance.debtor_name}
                        </span>
                        <span className="text-gray-500 mx-2">nợ</span>
                        <span className="font-bold text-green-600">
                          {balance.creditor_name}
                        </span>
                      </p>
                      <p className="text-orange-600 font-bold text-xl">
                        {(
                          Math.round(balance.amount / 1000) * 1000
                        ).toLocaleString()}{" "}
                        đ
                      </p>
                    </div>
                    {balance.creditor_id === user?.id && (
                      <button
                        onClick={() => handleSettleBalance(balance.id)}
                        className="btn-primary whitespace-nowrap bg-green-600 hover:bg-green-700"
                      >
                        Đã nhận
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Danh sách thành viên với QR */}
      <MemberQRViewer members={members} roomName={room.room_name} />

      {/* Danh sách chi tiêu */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Chi tiêu</h2>

        {expenses.length === 0 ? (
          <EmptyState
            title="Chưa có chi tiêu"
            description="Thêm chi tiêu đầu tiên cho phòng"
          />
        ) : (
          <>
            <div className="space-y-3">
              {(showAllExpenses ? expenses : expenses.slice(0, 5)).map(
                (expense) => (
                  <div key={expense.id} className="card">
                    <div
                      onClick={() => handleExpandExpense(expense.id)}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {expense.category === "food"
                              ? "🍽️"
                              : expense.category === "transport"
                                ? "🚗"
                                : expense.category === "entertainment"
                                  ? "🎬"
                                  : expense.category === "shopping"
                                    ? "🛍️"
                                    : "📦"}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {expense.description}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold text-blue-600">
                                {expense.paid_by_name || expense.payer_name}
                              </span>{" "}
                              thanh toán • {formatDateVN(expense.expense_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-bold text-red-600 min-w-32 text-right">
                          {expense.amount.toLocaleString()} đ
                        </p>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${
                            expandedExpense === expense.id ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Chi tiết mở rộng */}
                    {expandedExpense === expense.id &&
                      expenseDetails[expense.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600">
                                Người tham gia:
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {expenseDetails[expense.id].participants?.map(
                                  (p) => (
                                    <div
                                      key={p.user_id}
                                      className="bg-blue-100 px-3 py-1 rounded-full text-sm"
                                    >
                                      <p className="font-medium text-gray-800">
                                        {p.full_name}
                                      </p>
                                      <p className="text-blue-600">
                                        {p.share_amount.toLocaleString()} đ
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Cách chia:{" "}
                              {expense.split_type === "equal"
                                ? "Chia đều"
                                : "Chia tùy chỉnh"}
                            </p>
                          </div>

                          {/* Nút xóa */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="btn-danger flex items-center gap-2 w-full justify-center"
                            >
                              <Trash2 size={16} /> Xóa chi tiêu
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                ),
              )}
            </div>

            {/* Nút xem tất cả / Thu gọn */}
            {expenses.length > 5 && (
              <button
                onClick={() => setShowAllExpenses(!showAllExpenses)}
                className="btn-secondary w-full mt-4"
              >
                {showAllExpenses ? "📌 Thu gọn" : "📂 Xem tất cả"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
