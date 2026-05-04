import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { roomService, expenseService } from "@/services/authService";
import { Alert, EmptyState, LoadingSpinner } from "@/components/Common";
import { TrendingDown, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({ totalExpense: 0, roomCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const roomsRes = await roomService.getAllRooms(user.id);
          setRooms(roomsRes.data || []);

          // Tính toán thống kê
          let totalExpense = 0;
          for (const room of roomsRes.data || []) {
            try {
              const expensesRes = await expenseService.getExpenses(room.id);
              const roomTotal =
                expensesRes.data?.reduce(
                  (sum, exp) => sum + (exp.amount || 0),
                  0,
                ) || 0;
              totalExpense += roomTotal;
            } catch (err) {
              console.error(
                `Error fetching expenses for room ${room.id}:`,
                err,
              );
            }
          }

          setStats({
            totalExpense,
            roomCount: roomsRes.data?.length || 0,
          });
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

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng chi tiêu</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalExpense.toLocaleString()} đ
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown size={32} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Số phòng</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.roomCount}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users size={32} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Trung bình/phòng</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.roomCount > 0
                  ? (stats.totalExpense / stats.roomCount).toLocaleString()
                  : 0}{" "}
                đ
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign size={32} className="text-green-600" />
            </div>
          </div>
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
                  Số thành viên: {room.member_count || 0}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
