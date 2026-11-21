export const START_SCORE = 100

export const WATCH_THRESHOLD = 70

export const SCORE_LEVELS = [
  { min: 90, label: 'ดีเยี่ยม', color: 'positive', icon: 'sentiment_very_satisfied' },
  { min: 70, label: 'ปกติ', color: 'primary', icon: 'sentiment_satisfied' },
  { min: 50, label: 'เฝ้าระวัง', color: 'warning', icon: 'sentiment_neutral' },
  { min: -Infinity, label: 'ต้องปรับปรุง', color: 'negative', icon: 'sentiment_very_dissatisfied' }
]

export const PLUS_REASONS = [
  { label: 'จิตอาสา / ช่วยงานโรงเรียน', points: 5 },
  { label: 'เก็บของได้ส่งคืน', points: 10 },
  { label: 'ได้รับรางวัล / ทำชื่อเสียง', points: 20 },
  { label: 'ช่วยเหลือเพื่อน / ครู', points: 5 },
  { label: 'เข้าร่วมกิจกรรม', points: 5 },
  { label: 'อื่น ๆ', points: 5 }
]

export const MINUS_REASONS = [
  { label: 'มาสาย', points: 5 },
  { label: 'แต่งกายผิดระเบียบ', points: 5 },
  { label: 'ไม่ส่งงาน', points: 5 },
  { label: 'ใช้โทรศัพท์ในเวลาเรียน', points: 10 },
  { label: 'หนีเรียน', points: 10 },
  { label: 'ทะเลาะวิวาท', points: 20 },
  { label: 'อื่น ๆ', points: 5 }
]

export const OTHER_REASON = 'อื่น ๆ'

export const QUICK_POINTS = [5, 10, 20]

export const MAX_POINTS = 50

export const CLASSROOM_OPTIONS = [
  'ม.1/1', 'ม.1/2', 'ม.2/1', 'ม.2/2', 'ม.3/1', 'ม.3/2',
  'ม.4/1', 'ม.4/2', 'ม.5/1', 'ม.5/2', 'ม.6/1', 'ม.6/2'
]

export const formatDate = (value) => {
  return new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}
