import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { roomService, expenseService, balanceService } from '@/services/authService'
import { Alert, EmptyState, LoadingSpinner } from '@/components/Common'
import { Trash2, Plus, BarChart3 } from 'lucide-react'

export default function RoomDetailPage() {
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'food',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, expensesRes, balancesRes] = await Promise.all([
          roomService.getRoomDetail(roomId),
          expenseService.getExpenses(roomId),
          balanceService.getBalances(roomId),
        ])

        setRoom(roomRes.data)
        setExpenses(expensesRes.data || [])
        setBalances(balancesRes.data || [])
      } catch (err) {
        setError('Không thể tải dữ liệu phòng')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roomId])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!newExpense.amount || !newExpense.description) {
      setError('Vui lòng nhập đủ thông tin')
      return
    }

    try {
      await expenseService.addExpense({
        room_id: roomId,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        category: newExpense.category,
      })

      setNewExpense({ amount: '', description: '', category: 'food' })
      setShowAddExpense(false)

      // Reload expenses
      const expensesRes = await expenseService.getExpenses(roomId)
      setExpenses(expensesRes.data || [])
    } catch (err) {
      setError('Không thể thêm chi tiêu')
      console.error(err)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Xác nhận xóa chi tiêu này?')) return

    try {
      await expenseService.deleteExpense(expenseId)
      setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId))
    } catch (err) {
      setError('Không thể xóa chi tiêu')
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!room) return <div className="container py-8">Không tìm thấy phòng</div>

  const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{room.room_name}</h1>
        <p className="text-gray-600">Mã phòng: {room.room_code}</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-600 text-sm">Tổng chi tiêu</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{totalExpense.toLocaleString()} đ</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Thành viên</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{room.member_count || 0}</p>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddExpense && (
        <div className="card mb-8 bg-blue-50">
          <h3 className="text-xl font-semibold mb-4">Thêm chi tiêu mới</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="input-group">
              <label htmlFor="amount">Số tiền (đ)</label>
              <input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="100000"
              />
            </div>
            <div className="input-group">
              <label htmlFor="description">Mô tả</label>
              <input
                id="description"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Ăn cơm trưa"
              />
            </div>
            <div className="input-group">
              <label htmlFor="category">Danh mục</label>
              <select
                id="category"
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="food">Ăn uống</option>
                <option value="transport">Giao thông</option>
                <option value="entertainment">Giải trí</option>
                <option value="shopping">Mua sắm</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                Thêm
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

      {!showAddExpense && (
        <button
          onClick={() => setShowAddExpense(true)}
          className="btn-primary mb-8 flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm chi tiêu
        </button>
      )}

      {/* Expenses List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách chi tiêu</h2>
        {expenses.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Chưa có chi tiêu"
            description="Thêm chi tiêu đầu tiên cho phòng"
          />
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="card flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h4 className="font-semibold text-gray-800">{expense.description}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(expense.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-red-600">
                    {expense.amount?.toLocaleString()} đ
                  </p>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Balances */}
      {balances.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Công nợ</h2>
          <div className="space-y-3">
            {balances.map((balance, idx) => (
              <div key={idx} className="card">
                <p className="text-gray-800">
                  <strong>{balance.from_user}</strong> nợ <strong>{balance.to_user}</strong>:{' '}
                  <span className="text-red-600 font-bold">{balance.amount?.toLocaleString()} đ</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
