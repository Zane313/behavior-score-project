# ระบบบันทึกคะแนนความประพฤตินักเรียน (Behavior Score App)

Term Project วิชา 968-362 Front-end Development

## ความสามารถของระบบ

| Role | ทำอะไรได้บ้าง |
|---|---|
| ผู้ดูแลระบบ (admin) | ทุกอย่างของครู + เพิ่ม / แก้ไข / ลบ นักเรียน |
| ครู (teacher) | ดูภาพรวม, ค้นหานักเรียน, เพิ่ม/หักคะแนน, แก้ไข/ลบบันทึก, ดูประวัติทั้งหมด |
| นักเรียน (student) | ดูคะแนนและประวัติพฤติกรรมของตัวเองเท่านั้น |

- นักเรียนทุกคนเริ่มต้นที่ 100 คะแนน ระบบคำนวณคะแนนจากบันทึกให้อัตโนมัติ
- ระดับคะแนน: 90 ขึ้นไป = ดีเยี่ยม (เขียว), 70-89 = ปกติ (น้ำเงิน), 50-69 = เฝ้าระวัง (ส้ม), ต่ำกว่า 50 = ต้องปรับปรุง (แดง)

### บัญชีทดลอง (รหัสผ่าน 123456 ทุกบัญชี)
`admin`, `teacher`, `student`
(หน้า Login แสดงชื่อบัญชีทดลองไว้ให้ พิมพ์เข้าสู่ระบบเอง)

---

## วิธีรันในเครื่อง

### 1) รัน Mock API (JSON Server) — บทที่ 6
```
$ cd behavior-server
$ npm install
$ npm start
```
API จะอยู่ที่ http://localhost:3000 (users, students, records)

> ถ้าต้องการล้างข้อมูลกลับเป็นค่าเริ่มต้น ให้ copy `db.backup.json` ทับ `db.json` แล้วรัน json-server ใหม่

### 2) รัน Front-end — บทที่ 1
เปิด Terminal อีกหน้าต่าง
```
$ cd behavior-app
$ npm install
$ quasar dev
```

ไฟล์ `.env` 
```
QCLI_API_URL=http://localhost:3000
```

---

## Deploy ขึ้น Cloud 

### 1) Deploy API ขึ้น Vercel + MockAPI
- **MockAPI** (https://mockapi.io) เก็บข้อมูลจริงแบบถาวร: resource `students` และ `records` (แพ็กเกจฟรีได้ 2 resource พอดี)
- **users** (บัญชีเข้าระบบ) อ่านอย่างเดียวจาก `behavior-server/db.json`
- `behavior-server/api/index.js` เป็น Serverless Function บน Vercel ทำหน้าที่รวมทั้งสองอย่างให้อยู่ใน URL เดียว
  หน้าเว็บจึงเรียก `/users`, `/students`, `/records` ได้เหมือน json-server เดิมทุกอย่าง

ขั้นตอน
- MockAPI → New project → สร้าง resource `students` และ `records` แล้วใส่ข้อมูลจาก `db.json`
- Vercel → Add New Project → เลือก repo นี้ → Root Directory: `behavior-server` → Application Preset: **Other** → Deploy
- (ถ้าใช้ MockAPI โปรเจคอื่น) ตั้ง Environment Variable `MOCKAPI_URL` = `https://xxxxxxxx.mockapi.io/api`
- ได้ URL ของ API เช่น `https://behavior-score-api.vercel.app` (ลองเปิด `/students` ดูได้)

### 2) Push ขึ้น GitHub
```
$ git init
$ git add .
$ git commit -m "first commit"
$ git branch -M main
$ git remote add origin <GIT_URL>
$ git push -u origin main
```

### 3) Vercel
- Root Directory: `behavior-app`
- Application Preset: **Other**
- Build Command: `npm run build`
- Install Command: `npm install --ignore-scripts`
- Output Directory: `dist/spa`
- Environment Variables: `QCLI_API_URL` = URL ของ API เช่น `https://behavior-score-api.vercel.app`
- มีไฟล์ `vercel.json` แล้ว (แก้ปัญหา 404 ตอน Refresh)

---

## โครงสร้างโปรเจค และที่มาของโค้ด 

```
src/
├── boot/
│   ├── pinia.js          Pinia + persistedstate          (บทที่ 5)
│   ├── axios.js          Axios instance + Interceptor    (บทที่ 6, 7, 8)
│   └── auth.js           ตรวจสอบ Token ตอนเปิดแอป        (บทที่ 7 หัวข้อ 9)
├── config/
│   └── app-config.js     ค่าตั้งค่ากลาง: คะแนนเริ่มต้น, ระดับคะแนน, รายการพฤติกรรม, ห้องเรียน
├── css/
│   ├── app.scss          Font Sarabun                    (บทที่ 4 Custom Theming)
│   └── quasar.variables.scss  Color Palette             (บทที่ 1, 4)
├── router/
│   ├── routes.js         Routes + meta.requiresAuth/roles (บทที่ 3, 5, 7)
│   └── index.js          Route Guard + Role Guard        (บทที่ 5, 7)
├── services/
│   └── auth.service.js   เรียก Login API                 (บทที่ 7)
├── stores/
│   ├── auth-store.js     Login / Logout / checkAuth      (บทที่ 5, 7)
│   ├── student-store.js  GET/POST/PUT/DELETE นักเรียน     (บทที่ 6)
│   └── record-store.js   GET/POST/PUT/DELETE บันทึก + คำนวณคะแนน (บทที่ 6)
├── layouts/
│   └── MainLayout.vue    Header / Drawer / Logout Dialog (บทที่ 2, 7)
├── components/
│   ├── SummaryCard.vue   Props + slot                    (บทที่ 3, 4)
│   ├── ScoreAvatar.vue   Props + computed                (บทที่ 3)
│   ├── RecordList.vue    q-list + Props + Emit           (บทที่ 3, 4)
│   ├── RecordForm.vue    q-form validation + Emit        (บทที่ 4)
│   └── StudentForm.vue   q-form validation + Emit        (บทที่ 4)
└── pages/
    ├── LoginPage.vue         (บทที่ 7)
    ├── DashboardPage.vue     SummaryCard, Loading/Error  (บทที่ 4, 6)
    ├── StudentsPage.vue      ค้นหาด้วย computed, q-dialog (บทที่ 3, 4)
    ├── StudentDetailPage.vue route.params.id, CRUD        (บทที่ 3, 6)
    ├── RecordsPage.vue       q-table + body-cell slot     (บทที่ 4)
    ├── MyScorePage.vue       GET /records?studentId=      (บทที่ 6)
    └── ErrorNotFound.vue
```

### ตรงตามเกณฑ์ Term Project
| เกณฑ์ | อยู่ที่ไหน |
|---|---|
| Application Design & UI/UX | Responsive (col-12 col-md-*), Font Sarabun, สีตามระดับคะแนน, ปุ่มบันทึกขนาดใหญ่, Empty state |
| Component & Structure | components/, pages/, layouts/, router/ |
| State Management | stores/ (Pinia 3 stores + persist) |
| GET / POST / PUT / DELETE | student-store.js, record-store.js |
| Loading / Error / Request Status | q-spinner-dots, q-banner, Notify ทุกหน้า |
| Authentication / Authorization | Login, Token, Interceptor, Route Guard, Role Guard |
| Deployment | .env, vercel.json, package.json scripts |

> อยากปรับหน้าตา/ข้อความ/เกณฑ์ ดูคู่มือ `UI-GUIDE.md` ว่าต้องแก้ไฟล์ไหน

### หมายเหตุเรื่องเวอร์ชัน Quasar
Quasar รุ่นใหม่ (@quasar/app-vite v3) ใช้ `import { defineBoot } from '#q-app'`
ส่วนในเอกสารประกอบการสอนใช้ `'#q-app/wrappers'` (รุ่นก่อนหน้า)
ถ้าโปรเจคที่สร้างด้วย `npm init quasar` ของคุณเป็นรุ่นเดียวกับเอกสาร ให้เปลี่ยนกลับเป็น `'#q-app/wrappers'` ในไฟล์ `src/boot/axios.js` และ `src/router/index.js`
