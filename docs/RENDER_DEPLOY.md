# KinoTV'ni telefondan Render'ga joylash

Bu Blueprint quyidagi asosiy xizmatlarni avtomatik yaratadi:

- `kinotv-api-jdjdjkdkdjdje-019ffa27` — NestJS REST API;
- `kinotv-admin-jdjdjkdkdjdje-019ffa27` — Next.js admin panel;
- `kinotv-db-jdjdjkdkdjdje-019ffa27` — PostgreSQL;
- `kinotv-cache-jdjdjkdkdjdje-019ffa27` — Redis/Render Key Value.

## Telefon orqali bajariladigan qadamlar

1. [Deploy to Render](https://render.com/deploy?repo=https://github.com/jdjdjkdkdjdje-maker/kino.uz/tree/arena/019ffa27-kino-uz) havolasini oching.
2. Render hisobiga kiring yoki bepul hisob yarating va GitHub repositoryga ruxsat bering.
3. `ADMIN_PASSWORD` maydoniga kamida 12 belgili, boshqa joyda ishlatilmagan kuchli parol kiriting. Parolni GitHub yoki chatga yozmang.
4. Blueprint xizmatlarini tasdiqlang va deploy yakunlanishini kuting. Birinchi build hamda bepul serverning uyg‘onishi bir necha daqiqa olishi mumkin.
5. Quyidagi manzillarni tekshiring:
   - API health: https://kinotv-api-jdjdjkdkdjdje-019ffa27.onrender.com/api/v1/health
   - Swagger: https://kinotv-api-jdjdjkdkdjdje-019ffa27.onrender.com/docs
   - Admin: https://kinotv-admin-jdjdjkdkdjdje-019ffa27.onrender.com
6. Admin login: `admin@kinotv.uz`; parol — 3-qadamda o‘zingiz kiritgan parol.

Android production manzili ushbu APIga sozlangan. Deploy muvaffaqiyatli tugagach,
GitHub Actions'dagi eng so‘nggi `kinotv-debug-apk` shu serverdan katalog oladi.

## Muhim cheklovlar

- Bepul Render web xizmati harakatsizlikdan keyin uxlaydi. Birinchi so‘rovda
  uyg‘onish 30–60 soniya olishi mumkin; ilovada `Qayta urinish`ni bosing.
- Render bepul PostgreSQL muddati va limitlari Render tarifiga bog‘liq. Doimiy
  production uchun pulli, backup qo‘llaydigan tarifga o‘ting.
- Blueprint API, admin, PostgreSQL va Redis'ni ulaydi. Poster/subtitrlarni admin
  orqali fayl sifatida yuklash uchun alohida S3-compatible bucket (Cloudflare R2,
  AWS S3 yoki MinIO) credentials kerak. URL orqali poster/banner qo‘shish va
  CSV/JSON import S3'siz ham ishlaydi.
- Render yaratgan JWT secretlari va `ADMIN_PASSWORD`ni hech qachon repositoryga
  commit qilmang yoki chatga yubormang.
