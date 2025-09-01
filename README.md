
# Shiba Shift Bot 🐕📅 (Render edition)

- LINE OA บอทกะงาน + แจ้งเตือน 20:00 + Small talk (OpenRouter DeepSeek)
- รองรับหลายคน/หลายทีม/หลายสาขา (ตั้งค่าด้วยคำสั่งในแชท)
- Health check: `/healthz`
- Export .ics รายเดือน: `/ics/:userId/:year/:month`

## ติดตั้ง (Docker)
```bash
docker compose up -d --build
```

## Render Deploy
ใช้ไฟล์ `render.yaml` ที่แนบไว้ (บริการ web + mongo pserv)
- Health check path: `/healthz`
- ตั้ง ENV ใน Render Dashboard ให้ครบ
- ตั้ง Custom Domain: `shibabot.slipwake.online`

## คำสั่งในแชท
- `Start`
- ส่งตารางเดือน (อย่างน้อย 2 บรรทัด): หัวเดือน/ปี + รหัสกะเรียงวัน
- `กะวันนี้` / `กะพรุ่งนี้`
- `ตารางของฉัน`
- `ตั้งเตือน on|off`
- `ลบตาราง September 2025`
- `ตั้งทีม <ชื่อทีม>` / `ตั้งสาขา <ชื่อสาขา>` / `ข้อมูลทีม`

## .ics Export
ดาวน์โหลด:
```
GET /ics/:userId/:year/:month
```

## ความปลอดภัย
- เปลี่ยน/Rotate คีย์ใน `.env` เมื่อใช้จริง
