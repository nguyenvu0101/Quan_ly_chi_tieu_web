export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Expense Tracker</h3>
            <p className="text-gray-400">Quản lý chi tiêu nhóm dễ dàng và hiệu quả</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition">Trang chủ</a></li>
              <li><a href="/rooms" className="hover:text-white transition">Phòng</a></li>
              <li><a href="/profile" className="hover:text-white transition">Hồ sơ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
            <p className="text-gray-400">support@quanlychitieu.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Expense Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
