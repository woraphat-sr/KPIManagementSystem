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

## สูตรการคำนวณสถานะของ KPI

สถานะของ KPI จะถูกคำนวณจากค่าที่ได้เทียบกับเป้าหมาย (Target) ตามสูตรดังนี้

### ค่า Progress Percentage
```
Progress Percentage = (Actual Value / Target Value) × 100
```

### ค่า Time Ratio  
```
Time Ratio = (เวลาที่ผ่านไป / เวลาทั้งหมด) × 100
```

### การกำหนดสถานะ KPI

#### 1. กรณีพิเศษ
- **หาก Progress ≥ 100%** → สถานะเป็น **"On Track"** (บรรลุเป้าหมายแล้ว)
- **หาก Time Ratio ≥ 100%** → สถานะเป็น **"Off Track"** (หมดเวลาแล้วแต่ยังไม่ถึงเป้า)

#### 2. การคำนวณตามสูตรมาตรฐาน
เมื่อไม่เข้าข่ายกรณีพิเศษ ระบบจะเปรียบเทียบ Progress กับ Time Ratio ดังนี้:

**On Track (เป็นไปตามแผน)**
```
Progress ≥ (Time Ratio - 5%)
```
- หาก Progress สูงกว่าหรือเท่ากับ Time Ratio ลบด้วย 5%
- หมายถึง: การทำงานดีกว่าหรือเป็นไปตามแผนที่กำหนด

**At Risk (มีความเสี่ยง)**  
```
(Time Ratio - 20%) ≤ Progress < (Time Ratio - 5%)
```
- หาก Progress อยู่ในช่วงระหว่าง Time Ratio ลบ 20% ถึง Time Ratio ลบ 5%
- หมายถึง: ยังสามารถบรรลุเป้าหมายได้แต่ต้องเพิ่มความพยายาม

**Off Track (ไม่เป็นไปตามแผน)**
```
Progress < (Time Ratio - 20%)
```
- หาก Progress ต่ำกว่า Time Ratio ลบ 20%
- หมายถึง: มีความเสี่ยงสูงที่จะไม่บรรลุเป้าหมาย



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
- **สำหรับการเข้าใช้งานหน้าเว็บ**: user default 
    user:admin
    password: admin123

## เอกสาร API
> **ดูรายละเอียดเพิ่มเติมหรือทดสอบ API ได้จากไฟล์ Postman collection:**  
> `KPI Management API V1.postman_collection.json`


## ภาพหน้าจอแอปพลิเคชัน

ดูตัวอย่างภาพหน้าจอเพิ่มเติมได้ที่โฟลเดอร์ `screenshots`

## ทดลองใช้งาน Demo

สามารถเข้าไปลอง demo web ได้ที่ [http://43.229.133.8/](http://43.229.133.8/)

- **user:** admin  
- **password:** P@ssw0rd

