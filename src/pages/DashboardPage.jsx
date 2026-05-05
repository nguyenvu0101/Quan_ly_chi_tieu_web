import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { roomService, expenseService } from "@/services/authService";
import { Alert, EmptyState, LoadingSpinner } from "@/components/Common";
import PersonalNotesCard from "@/components/PersonalNotesCard";
import { Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const VI_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

function groupExpensesByMonth(expenses) {
  const map = {};
  for (const exp of expenses) {
    const d = new Date(exp.expense_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map[key]) map[key] = 0;
    // Dùng share_amount thay vì amount để phản ánh đúng chi tiêu cá nhân
    map[key] += exp.share_amount || 0;
  }
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .map(([key, total]) => {
      const [year, month] = key.split("-");
      return { label: `${VI_MONTHS[parseInt(month) - 1]} ${year}`, total };
    });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [memberCounts, setMemberCounts] = useState({});
  const [stats, setStats] = useState({ totalExpense: 0, roomCount: 0 });
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const roomsRes = await roomService.getAllRooms(user.id);
          const fetchedRooms = roomsRes.data || [];
          setRooms(fetchedRooms);

          const counts = {};
          const allExpenses = [];

          const countPromises = fetchedRooms.map(async (room) => {
            try {
              const count = await roomService.getMemberCount(room.id);
              counts[room.id] = count;
            } catch {
              counts[room.id] = 0;
            }
          });

          for (const room of fetchedRooms) {
            try {
              const expensesRes = await expenseService.getExpenses(room.id);
              const expenses =
                expensesRes.data?.expenses || expensesRes.data || [];
              allExpenses.push(...expenses);
            } catch (err) {
              console.error(
                `Error fetching expenses for room ${room.id}:`,
                err,
              );
            }
          }

          const grouped = groupExpensesByMonth(allExpenses);

          await Promise.all(countPromises);
          setMemberCounts(counts);

          setStats({
            totalExpense: grouped[0]?.total || 0,
            roomCount: fetchedRooms.length,
          });

          setMonthlyExpenses(grouped);
          setSelectedMonth(grouped[0] || null);
        }
      } catch (err) {
        setError("Không thể tải dữ liệu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Xin chào, {user?.fullname}!
        </h1>
        <p className="text-gray-600">Tổng quan về chi tiêu của bạn</p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {/* Stats Cards - Balanced Layout */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Left Column - Monthly Expense + Room Count (Vertical Stack) */}
        <div className="flex flex-col gap-4">
          {/* Monthly Expense Card */}
          <div className="card bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-400 flex-1">
            <div className="flex items-start justify-between h-full">
              <div className="flex-1">
                <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                  Chi tiêu theo tháng
                </p>
                {monthlyExpenses.length === 0 ? (
                  <p className="text-gray-400 text-sm italic mt-2">
                    Chưa có chi tiêu
                  </p>
                ) : (
                  <>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-200 mt-2"
                      value={selectedMonth?.label || ""}
                      onChange={(e) => {
                        const sel = monthlyExpenses.find(
                          (m) => m.label === e.target.value,
                        );
                        setSelectedMonth(sel || null);
                      }}
                    >
                      {monthlyExpenses.map((m) => (
                        <option key={m.label} value={m.label}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    {selectedMonth && (
                      <p className="text-3xl font-bold text-red-600 mt-3">
                        {selectedMonth.total.toLocaleString()} đ
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="bg-red-100 p-2.5 rounded-full flex-shrink-0 ml-3">
                <Calendar size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          {/* Room Count Card */}
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-400 flex-1">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                  Số phòng
                </p>
                <p className="text-4xl font-bold text-blue-600 mt-3">
                  {stats.roomCount}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                <Users size={28} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Personal Notes Card */}
        <div>
          <PersonalNotesCard userId={user?.id} />
        </div>
      </div>

      {/* Rooms Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Phòng của bạn</h2>
          <Link to="/rooms/create" className="btn-primary">
            + Tạo phòng mới
          </Link>
        </div>

        {rooms.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Chưa có phòng"
            description="Tạo phòng mới để bắt đầu quản lý chi tiêu với nhóm của bạn"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/rooms/${room.id}`}
                className="card hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {room.room_name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Mã phòng: {room.room_code}
                </p>
                <p className="text-gray-500 text-sm">
                  Số thành viên: {memberCounts[room.id] || 0}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
