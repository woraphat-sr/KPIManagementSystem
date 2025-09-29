# ระบบจัดการ KPI (KPI Management System)

ระบบจัดการ KPI ที่พัฒนาด้วย Vue.js และ Express.js

## ฟีเจอร์หลัก

- ระบบยืนยันตัวตนด้วย JWT , Login , Signup
- การจัดการผู้ใช้และบทบาท
- การสร้างและจัดการ KPI แบ่งตามสิทธิ์การใช้งาน
- Dashboard แสดงสถิติและกราฟ
- ระบบค้นหาและกรองข้อมูล
- การส่งออกข้อมูลเป็น PDF/Excel

## เทคโนโลยีที่ใช้

### Backend (API)
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - ฐานข้อมูล
- **Mongoose** - ODM สำหรับ MongoDB
- **JWT** - การยืนยันตัวตน
- **bcryptjs** - การเข้ารหัสรหัสผ่าน

### Frontend (Web)
- **Vue.js 3** - Frontend Framework
- **Vite** - Build Tool
- **Tailwind CSS** - CSS Framework
- **Pinia** - State Management
- **Vue Router** - Routing
- **ApexCharts** - การแสดงผลกราฟ
- **Axios** - HTTP Client

## การติดตั้งและตั้งค่า

### ความต้องการของระบบ
- Node.js (เวอร์ชัน 20 หรือสูงกว่า)
- MongoDB (เวอร์ชัน 7.0 หรือสูงกว่า)
- npm หรือ yarn

### 1. Clone Repository
```bash
git clone https://github.com/woraphat-sr/KPIManagementSystem.git
cd KPIManagementSystem
```

### 2. ติดตั้ง Dependencies

#### Backend (API)
```bash
cd api
npm install
```

#### Frontend (Web)
```bash
cd web
npm install
```

### 3. การตั้งค่า Environment Variables

#### Backend (.env ในโฟลเดอร์ api/)
```env
# Environment Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/kpi-management-api

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_ROUNDS=12
```

#### Frontend (.env ในโฟลเดอร์ web/)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. เริ่มต้นเซิร์ฟเวอร์

#### เริ่มต้น Backend
```bash
cd api
npm run dev
```

#### เริ่มต้น Frontend
```bash
cd web
npm run dev
```

### 5. เข้าถึงแอปพลิเคชัน
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## เอกสาร API
> **ดูรายละเอียดเพิ่มเติมหรือทดสอบ API ได้จากไฟล์ Postman collection:**  
> `KPI Management API V1.postman_collection.json`


## ภาพหน้าจอแอปพลิเคชัน

ดูตัวอย่างภาพหน้าจอเพิ่มเติมได้ที่โฟลเดอร์ `screenshots`

## ทดลองใช้งาน Demo

สามารถเข้าไปลอง demo web ได้ที่ [http://43.229.133.8/](http://43.229.133.8/)

- **user:** admin  
- **password:** P@ssw0rd

