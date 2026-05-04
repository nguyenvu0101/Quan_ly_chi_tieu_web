import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Home, Menu, X } from 'lucide-react'
import { useState } from 'react'

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Expense Tracker
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
                <Home size={20} />
              </Link>
              <Link to="/rooms" className="text-gray-700 hover:text-blue-600 transition">
                Phòng
              </Link>
              <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                <User size={20} />
                {user?.fullname}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
              >
                <LogOut size={20} />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-secondary">
                Đăng ký
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && isAuthenticated && (
        <div className="md:hidden bg-gray-50 border-t">
          <div className="container py-4 space-y-4">
            <Link to="/" className="block text-gray-700 hover:text-blue-600">
              Trang chủ
            </Link>
            <Link to="/rooms" className="block text-gray-700 hover:text-blue-600">
              Phòng
            </Link>
            <Link to="/profile" className="block text-gray-700 hover:text-blue-600">
              Hồ sơ
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left text-red-600 hover:text-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
