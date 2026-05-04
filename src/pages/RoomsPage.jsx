import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { roomService } from '@/services/authService'
import { Alert } from '@/components/Common'
import { Users, Code } from 'lucide-react'

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState('create')
  const [createForm, setCreateForm] = useState({ room_name: '' })
  const [joinForm, setJoinForm] = useState({ room_code: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!createForm.room_name) {
      setError('Vui lòng nhập tên phòng')
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await roomService.createRoom(createForm)
      alert('Tạo phòng thành công!')
      navigate(`/rooms/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo phòng')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (e) => {
    e.preventDefault()
    if (!joinForm.room_code) {
      setError('Vui lòng nhập mã phòng')
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await roomService.joinRoom(joinForm)
      alert('Tham gia phòng thành công!')
      navigate(`/rooms/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tham gia phòng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Phòng</h1>
      <p className="text-gray-600 mb-8">Quản lý các phòng chi tiêu của bạn</p>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => {
            setActiveTab('create')
            setError('')
          }}
          className={`pb-4 font-semibold ${
            activeTab === 'create'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Tạo phòng mới
        </button>
        <button
          onClick={() => {
            setActiveTab('join')
            setError('')
          }}
          className={`pb-4 font-semibold ${
            activeTab === 'join'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Tham gia phòng
        </button>
      </div>

      {/* Create Room Form */}
      {activeTab === 'create' && (
        <div className="max-w-md">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Tạo phòng mới</h2>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="input-group">
                <label htmlFor="room_name">Tên phòng</label>
                <input
                  id="room_name"
                  value={createForm.room_name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, room_name: e.target.value }))
                  }
                  placeholder="Nhóm du lịch Đà Nẵng"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo phòng'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Form */}
      {activeTab === 'join' && (
        <div className="max-w-md">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <Code size={24} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Tham gia phòng</h2>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="input-group">
                <label htmlFor="room_code">Mã phòng</label>
                <input
                  id="room_code"
                  value={joinForm.room_code}
                  onChange={(e) =>
                    setJoinForm((prev) => ({ ...prev, room_code: e.target.value }))
                  }
                  placeholder="ABC123"
                  disabled={loading}
                  maxLength="6"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Đang tham gia...' : 'Tham gia phòng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
