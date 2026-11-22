# ระบบบันทึกคะแนนความประพฤตินักเรียน (Behavior Score App)

Term Project วิชา 968-362 Front-end Development

## ลิงก์
| | |
|---|---|
| เว็บไซต์ (Production) | https://behavior-score-app.vercel.app |
| API | https://behavior-score-api.vercel.app (เช่น `/students`, `/records`) |
| Source Code | https://github.com/Zane313/behavior-score-project |

## บัญชีทดลอง (รหัสผ่าน `123456` ทุกบัญชี)
| บทบาท | ชื่อผู้ใช้ | ทำอะไรได้บ้าง |
|---|---|---|
| ผู้ดูแลระบบ | `admin` | ทุกอย่างของครู + เพิ่ม / แก้ไข / ลบ นักเรียน |
| ครู | `teacher` | ดูภาพรวม, ค้นหานักเรียน, เพิ่ม/หักคะแนน, แก้ไข/ลบบันทึก, ดูประวัติทั้งหมด |
| นักเรียน | `student` | ดูคะแนนและประวัติพฤติกรรมของตัวเอง |

นักเรียนทุกคนเริ่มต้นที่ 100 คะแนน ระบบคำนวณคะแนนจากบันทึกพฤติกรรมให้อัตโนมัติ

## เทคโนโลยีที่ใช้
- **Front-end:** Vue 3 (Composition API), Quasar Framework, Vue Router, Pinia, Axios
- **API:** Serverless Function บน Vercel + MockAPI (เก็บข้อมูลนักเรียนและบันทึกคะแนน)
- **Deploy:** Vercel (ดึงโค้ดจาก GitHub อัตโนมัติ)

## โครงสร้าง Repository
```
behavior-score-project/
├── behavior-app/      หน้าเว็บ (Vue 3 + Quasar) — รายละเอียดใน behavior-app/README.md
├── behavior-server/   Mock API
│   ├── db.json        ข้อมูลตั้งต้น (users, students, records)
│   ├── api/index.js   API บน Vercel: users จาก db.json, students/records จาก MockAPI
│   └── vercel.json
└── screenshots/       ภาพหน้าจอของระบบ
```

## การทำงานของระบบ
```
หน้าเว็บ (Vercel) ──► API (Vercel) ──┬─ /users             → db.json (อ่านอย่างเดียว)
                                     └─ /students, /records → MockAPI (เก็บถาวร)
```

## รันในเครื่อง
```
# Terminal 1 — Mock API (json-server) ที่ http://localhost:3000
cd behavior-server
npm install
npm start

# Terminal 2 — หน้าเว็บ
cd behavior-app
npm install
quasar dev
```
ไฟล์ `behavior-app/.env`
```
QCLI_API_URL=http://localhost:3000
```

