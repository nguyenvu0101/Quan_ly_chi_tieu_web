# P405 Web - Frontend

Ứng dụng web quản lý chi tiêu nhóm được xây dựng với React + Vite.

## 📋 Yêu cầu

- Node.js 16+
- npm hoặc yarn

## 🚀 Cài đặt

```bash
cd p405-web
npm install
```

## 🔧 Cấu hình

Tạo file `.env` dựa trên `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường:

```
VITE_API_BASE_URL=http://localhost:3003
```

## 📝 Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 🏗️ Build production

```bash
npm run build
```

## 📁 Cấu trúc project

```
src/
├── components/        # React components tái sử dụng
├── contexts/         # React Context (Auth)
├── pages/            # Trang chính
├── services/         # API services
├── styles/           # CSS styles
├── App.jsx           # App root
└── main.jsx          # Entry point

```

## ✨ Features

- ✅ Đăng ký / Đăng nhập
- ✅ Quản lý phòng chi tiêu
- ✅ Thêm/xóa chi tiêu
- ✅ Xem thống kê
- ✅ Quản lý hồ sơ
- ✅ Responsive design

## 🔌 API Integration

Frontend tự động kết nối đến backend tại `http://localhost:3003`

## 📚 Công nghệ sử dụng

- React 18
- Vite
- Tailwind CSS
- React Router v6
- Axios
- Lucide React Icons

## 📄 License

MIT
