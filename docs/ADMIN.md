# KinoTV Admin

Production admin: https://kinotv-admin-jdjdjkdkdjdje-019ffa27.onrender.com

KinoTV Admin Next.js/React/TypeScript/Tailwind ilovasi bo‘lib, barcha ma’lumotni
NestJS REST API orqali PostgreSQL bazasidan oladi. Admin o‘zgarishi Redis home
keshini bekor qiladi; Android keyingi API so‘rovida yangi ma’lumotni oladi.

## Rollar

- `SUPER ADMIN`: barcha amallar, admin rollari va foydalanuvchi o‘chirish.
- `ADMIN`: kino, kanal, kategoriya, EPG, import, upload va statistika.
- `MODERATOR`: kontent qo‘shish/tahrirlash; o‘chirish va rollarni boshqarish yo‘q.

Rollar `admins.permissions` JSON profillari bilan saqlanadi. Asosiy `users.role`
`ADMIN` yoki `USER` bo‘lib qoladi, shuning uchun mavjud Android/JWT oqimi buzilmaydi.

## Xavfsizlik

Admin access va refresh tokenlari Next.js server proxy tomonidan `HttpOnly`,
`Secure`, `SameSite=Lax` cookie ichida saqlanadi. Brauzer JavaScript kodi tokenni
o‘qiy olmaydi. Backend har bir admin API uchun JWT, rol va permission tekshiradi.

## Rasm yuklash

`POST /uploads/image` poster/banner/logo faylini yuklaydi. S3/MinIO sozlangan
bo‘lsa obyekt o‘sha bucketga yuboriladi. S3 vaqtincha mavjud bo‘lmasa, ishlashni
to‘xtatmaslik uchun rasm PostgreSQL `media_assets` jadvalida saqlanib,
`GET /media/:id` orqali beriladi. Katta production katalogida S3/R2/MinIO tavsiya
qilinadi.

## Ommaviy import

`POST /admin/imports/MOVIES` va `POST /admin/imports/CHANNELS` `.csv` yoki `.json`
fayl qabul qiladi. Limit 10 000 qator. Import tarixi har bir xato uchun qator,
maydon va sababni saqlaydi.

## Sozlamalar va FCM

Ilova nomi, logo, bannerlar, aloqa, ilova haqida, texnik xizmat va bildirishnoma
holati `app_settings` jadvalida saqlanadi va `/app-settings` hamda `/home`
javoblarida Android uchun mavjud. `FCM_SERVER_KEY` berilsa notification API FCMga
yuboradi; berilmasa xabar audit/navbat jurnaliga xavfsiz saqlanadi.
