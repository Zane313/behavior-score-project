# คู่มือ: อยากปรับอะไร ให้แก้โค้ดตรงไหน

> ทุก path ด้านล่างอยู่ใต้ `behavior-app/` · แก้แล้วบันทึกไฟล์ `quasar dev` จะรีโหลดเองทันที

## 1. ตั้งค่าระบบ (แก้ที่เดียวจบ) → `src/config/app-config.js`

| อยากเปลี่ยน | ตัวแปร |
|---|---|
| คะแนนเริ่มต้น (100) | `START_SCORE` |
| เกณฑ์ "ต้องเฝ้าระวัง" หน้า Dashboard (ต่ำกว่า 70) | `WATCH_THRESHOLD` |
| ระดับคะแนน ชื่อระดับ สี ไอคอน (ดีเยี่ยม/ปกติ/เฝ้าระวัง/ต้องปรับปรุง) | `SCORE_LEVELS` |
| รายการพฤติกรรมเพิ่มคะแนน + คะแนนแนะนำ | `PLUS_REASONS` |
| รายการพฤติกรรมหักคะแนน + คะแนนแนะนำ | `MINUS_REASONS` |
| ปุ่มคะแนนเร็ว (5 / 10 / 20) | `QUICK_POINTS` |
| คะแนนสูงสุดต่อครั้ง (50) | `MAX_POINTS` |
| รายชื่อชั้น/ห้องในฟอร์มนักเรียน | `CLASSROOM_OPTIONS` |
| รูปแบบวันที่ที่แสดงทั้งระบบ | `formatDate` |

ตัวอย่าง: เพิ่มพฤติกรรม "ส่งการบ้านครบทั้งเทอม" ให้ 10 คะแนน
```js
export const PLUS_REASONS = [
  { label: 'ส่งการบ้านครบทั้งเทอม', points: 10 },
  ...
]
```

## 2. สีและฟอนต์

| อยากเปลี่ยน | ไฟล์ |
|---|---|
| สีหลักของทั้งแอป (primary, secondary, positive, negative, warning ...) | `src/css/quasar.variables.scss` |
| ความโค้งของมุมการ์ด/ปุ่มทั้งระบบ | `src/css/quasar.variables.scss` → `$generic-border-radius` |
| ฟอนต์ | `src/css/app.scss` (บรรทัด `@import url(...)` + `font-family`) |
| ขนาดหัวข้อหน้า (`.page-title`) / ความกว้างสูงสุดของเนื้อหา (`.page-container`) | `src/css/app.scss` |
| ความเร็ว Animation ตอนเปลี่ยนหน้า | `src/css/app.scss` → `.page-fade-*` (ค่า `0.15s`) |
| สีป้าย Role (admin/ครู/นักเรียน) | `src/layouts/MainLayout.vue` → `roleColor` (และ `demoAccounts` ใน `LoginPage.vue`) |

## 3. แต่ละหน้า

| หน้า | ไฟล์ | จุดที่มักแก้ |
|---|---|---|
| Login | `src/pages/LoginPage.vue` | ข้อความหัวการ์ด, ปุ่มบัญชีทดลอง `demoAccounts`, สีพื้นหลังไล่สี `.login-bg`, ความใส/ความเบลอของการ์ด `.login-card`, แสงรอบโลโก้ `.logo-glow` |
| แถบบน + เมนูซ้าย | `src/layouts/MainLayout.vue` | ชื่อแอปบนมือถือ `shortTitle`, รายการเมนู `menus`, ข้อความยืนยันออกจากระบบ `onLogout` |
| หน้าหลัก (ครู/admin) | `src/pages/DashboardPage.vue` | การ์ดสรุป 4 ใบ (`<SummaryCard ...>`), จำนวนบันทึกล่าสุด → `recentRecords` ใน `src/stores/record-store.js` (`.slice(0, 5)`) |
| รายชื่อนักเรียน | `src/pages/StudentsPage.vue` | ตัวเลือกเรียงลำดับ `sortOptions` + `sorters`, ปุ่ม +/− ในแต่ละแถว |
| รายละเอียดนักเรียน | `src/pages/StudentDetailPage.vue` | ปุ่มเพิ่ม/หักคะแนน, แถบปุ่มล่างจอบนมือถือ `.action-bar`, ปุ่ม "เลิกทำ" หลังลบ `onDeleteRecord` |
| ประวัติการบันทึก | `src/pages/RecordsPage.vue` | คอลัมน์ `columns`, คอลัมน์ที่โชว์ตามขนาดจอ `visibleColumns`, จำนวนแถวต่อหน้า `pagination.rowsPerPage` |
| คะแนนของฉัน (นักเรียน) | `src/pages/MyScorePage.vue` | ข้อความ "อีก X คะแนน..." `nextLevel`, ป้ายอธิบายระดับ `levelLegend` |
| หน้า 404 | `src/pages/ErrorNotFound.vue` | |

## 4. Component ที่ใช้ซ้ำหลายหน้า (แก้ที่เดียว เปลี่ยนทุกหน้า)

| Component | ใช้ที่ | แก้อะไรได้ |
|---|---|---|
| `src/components/RecordForm.vue` | ฟอร์มเพิ่ม/หัก/แก้ไขคะแนน | หน้าตาชิปพฤติกรรม, ช่องหมายเหตุ, กล่องแสดง "65 → 55" |
| `src/components/RecordList.vue` | รายการประวัติ (Dashboard, รายละเอียด, คะแนนของฉัน) | ไอคอน, ข้อความตอนว่าง `emptyText`, ปุ่มแก้ไข/ลบ (มือถือรวมไว้ในเมนู ⋮) |
| `src/components/SummaryCard.vue` | การ์ดตัวเลขสรุป | สีพื้นหลังไอคอน `softColor`, ขนาดตัวเลข |
| `src/components/ScoreAvatar.vue` | วงกลมคะแนน | ขนาดเริ่มต้น `size` |
| `src/components/StudentForm.vue` | ฟอร์มเพิ่ม/แก้ไขนักเรียน | ช่องกรอก, ข้อความตัวอย่าง `hint` |

## 5. การแจ้งเตือน / สิทธิ์ / เส้นทาง

| อยากเปลี่ยน | ไฟล์ |
|---|---|
| ตำแหน่งและเวลาแสดงแจ้งเตือน (Notify) ทุกอัน | `quasar.config.js` → `framework.config.notify` |
| ใครเข้าหน้าไหนได้ | `src/router/routes.js` → `meta.roles` |
| ข้อความ "กรุณาเข้าสู่ระบบก่อน" / "ไม่มีสิทธิ์" | `src/router/index.js` |
| ข้อความ Error จาก Server | `setError` ใน `src/stores/student-store.js` และ `record-store.js` |
| ชื่อแอป / URL ของ API | `.env` (`QCLI_APP_TITLE`, `QCLI_API_URL`) |

## 6. Quasar class ที่ใช้บ่อย (เวลาจะจัดหน้าเอง)

- ระยะห่าง: `q-pa-md` (padding รอบ), `q-mt-sm` (margin บน), `q-gutter-sm` (ช่องไฟระหว่างลูก)
- จัดคอลัมน์ตามจอ: `col-12 col-sm-6 col-md-4` = มือถือเต็มแถว / แท็บเล็ตครึ่ง / จอใหญ่ 1 ใน 3
- ซ่อน/แสดงตามจอ: `gt-xs` (ซ่อนบนมือถือ), `lt-md` (แสดงเฉพาะจอเล็กกว่า md)
- ในโค้ด: `$q.screen.xs` = true เมื่อเป็นจอมือถือ
- สี: `text-primary`, `bg-red-1`, `text-grey-7` ฯลฯ (ดูชื่อสีได้ที่ quasar.dev/style/color-palette)
