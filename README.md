# ระบบจัดการ KPI (KPI Management System)

ระบบจัดการ KPI ที่พัฒนาด้วย Vue.js และ Express.js สำหรับการติดตามและจัดการ Key Performance Indicators ขององค์กร

## 📋 ฟีเจอร์หลัก

- 🔐 ระบบยืนยันตัวตนด้วย JWT
- 👥 การจัดการผู้ใช้และบทบาท
- 📊 การสร้างและจัดการ KPI
- 📈 Dashboard แสดงสถิติและกราฟ
- 🔍 ระบบค้นหาและกรองข้อมูล
- 📤 การส่งออกข้อมูลเป็น PDF/Excel
- 📱 Responsive Design รองรับทุกอุปกรณ์

## 🛠️ เทคโนโลยีที่ใช้

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

## 📦 การติดตั้งและตั้งค่า

### ความต้องการของระบบ
- Node.js (เวอร์ชัน 16 หรือสูงกว่า)
- MongoDB (เวอร์ชัน 4.4 หรือสูงกว่า)
- npm หรือ yarn

### 1. Clone Repository
```bash
git clone <repository-url>
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

#### เริ่มต้น MongoDB
```bash
# สำหรับ Windows
mongod

# สำหรับ macOS/Linux
sudo systemctl start mongod
```

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

## 📚 เอกสาร API

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### สมัครสมาชิก
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "ชื่อ-นามสกุล",
  "email": "email@example.com",
  "password": "password123",
  "role": "user"
}
```

#### เข้าสู่ระบบ
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "password123"
}
```

#### ดูข้อมูลโปรไฟล์
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### KPI Management Endpoints

#### สร้าง KPI ใหม่
```http
POST /api/v1/kpis
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "ชื่อ KPI",
  "description": "คำอธิบาย",
  "targetValue": 100,
  "currentValue": 0,
  "unit": "บาท",
  "category": "category_id",
  "assignedTo": "user_id",
  "dueDate": "2024-12-31",
  "status": "active"
}
```

#### ดึงข้อมูล KPI ทั้งหมด
```http
GET /api/v1/kpis
Authorization: Bearer <token>
```

#### ดึงข้อมูล KPI ตาม ID
```http
GET /api/v1/kpis/:id
Authorization: Bearer <token>
```

#### อัปเดต KPI
```http
PUT /api/v1/kpis/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "ชื่อ KPI ที่อัปเดต",
  "targetValue": 150,
  "status": "completed"
}
```

#### อัปเดตค่าปัจจุบันของ KPI
```http
PUT /api/v1/kpis/:id/update-value
Authorization: Bearer <token>
Content-Type: application/json

{
  "actualValue": 75,
  "notes": "ความคืบหน้าล่าสุด"
}
```

#### ลบ KPI
```http
DELETE /api/v1/kpis/:id
Authorization: Bearer <token>
```

### User Management Endpoints

#### ดึงข้อมูลผู้ใช้ทั้งหมด
```http
GET /api/v1/users
Authorization: Bearer <token>
```

#### ดึงข้อมูลผู้ใช้ตาม ID
```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

#### อัปเดตข้อมูลผู้ใช้
```http
PUT /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ชื่อใหม่",
  "role": "admin"
}
```

#### ลบผู้ใช้
```http
DELETE /api/v1/users/:id
Authorization: Bearer <token>
```

### Category Management Endpoints

#### สร้างหมวดหมู่ใหม่
```http
POST /api/v1/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ชื่อหมวดหมู่",
  "description": "คำอธิบายหมวดหมู่"
}
```

#### ดึงข้อมูลหมวดหมู่ทั้งหมด
```http
GET /api/v1/categories
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### ดึงข้อมูลสถิติ Dashboard
```http
GET /api/v1/dashboard/stats
Authorization: Bearer <token>
```

#### ดึงข้อมูลกราฟ
```http
GET /api/v1/dashboard/charts
Authorization: Bearer <token>
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // ข้อมูลที่ส่งกลับ
  },
  "message": "ดำเนินการสำเร็จ"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "ข้อความข้อผิดพลาด",
  "details": "รายละเอียดเพิ่มเติม"
}
```

## 📱 ภาพหน้าจอแอปพลิเคชัน

### วิธีเพิ่มภาพหน้าจอ

1. **สร้างโฟลเดอร์สำหรับรูปภาพ**:
```bash
mkdir screenshots
```

2. **เพิ่มรูปภาพในโฟลเดอร์ screenshots/**:
   - `screenshots/login.png` - หน้าเข้าสู่ระบบ
   - `screenshots/dashboard.png` - หน้า Dashboard
   - `screenshots/kpi-management.png` - หน้าจัดการ KPI
   - `screenshots/user-management.png` - หน้าจัดการผู้ใช้

3. **เพิ่มรูปภาพใน README.md**:
```markdown
![Login Page](./screenshots/login.png)
![Dashboard](./screenshots/dashboard.png)
```

### ตัวอย่างภาพหน้าจอ

#### หน้าเข้าสู่ระบบ
![Login Page](./screenshots/login.png)
- ฟอร์มเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
- ลิงก์สำหรับสมัครสมาชิก

#### Dashboard
![Dashboard](./screenshots/dashboard.png)
- แสดงสถิติรวมของ KPI
- กราฟแสดงความคืบหน้าของ KPI
- รายการ KPI ล่าสุด

#### การจัดการ KPI
![KPI Management](./screenshots/kpi-management.png)
- ตารางแสดงรายการ KPI
- ระบบค้นหาและกรองข้อมูล
- ฟอร์มสร้างและแก้ไข KPI

#### การจัดการผู้ใช้
![User Management](./screenshots/user-management.png)
- รายการผู้ใช้ทั้งหมด
- การกำหนดบทบาทและสิทธิ์
- การแก้ไขข้อมูลผู้ใช้

### เคล็ดลับการถ่ายภาพหน้าจอ

1. **ขนาดภาพ**: แนะนำให้ใช้ขนาด 1920x1080 หรือ 1366x768
2. **รูปแบบไฟล์**: ใช้ PNG สำหรับภาพที่มีข้อความ, JPG สำหรับภาพสี
3. **การบีบอัด**: ใช้เครื่องมือออนไลน์เพื่อลดขนาดไฟล์
4. **การตั้งชื่อไฟล์**: ใช้ชื่อภาษาอังกฤษและอธิบายชัดเจน

### เครื่องมือแนะนำ

- **Windows**: Snipping Tool, Snagit
- **macOS**: Screenshot (Cmd+Shift+4), CleanShot X
- **Linux**: Flameshot, KSnapshot
- **ออนไลน์**: Lightshot, Greenshot

## 🚀 การ Deploy

### Production Environment
1. ตั้งค่า `NODE_ENV=production`
2. เปลี่ยน `JWT_SECRET` เป็นค่าใหม่ที่ปลอดภัย
3. ตั้งค่า MongoDB Atlas หรือเซิร์ฟเวอร์ฐานข้อมูล
4. ใช้ PM2 หรือ Docker สำหรับจัดการ process

### Build Frontend
```bash
cd web
npm run build
```
