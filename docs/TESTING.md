# Test rejasi

## Avtomatik

```bash
npm run build --workspace backend
npm test --workspace backend
npm run build --workspace admin
npm audit --omit=dev
API_URL=http://localhost:4000/api/v1 node backend/test/smoke.mjs
cd mobile && flutter pub get && flutter analyze && flutter test
```

2026-08-13 lokal real PostgreSQL bilan smoke natijasi: **27/27 muvaffaqiyatli**.
Unda register/login/refresh/logout, RBAC 403, kino/kanal ro‘yxati va detail,
qidiruv, dastur jadvali, ikkala sevimli turi, tarix/progress, litsenziyasiz videoni
bloklash, litsenziyalangan video access, admin dashboard, kategoriya, kino, kanal
va dastur create/update/delete tekshirildi.

Backend Jest: **5 suite, 9 test — passed**. Videosiz haqiqiy katalog JSON importi ham real DBda tekshirildi. Admin va backend production build — passed.
Production dependency audit: **0 vulnerability**.

## Android qo‘lda acceptance

Real Android qurilmada login/register, pastki 5 menyu, scroll pagination, airplane
mode Uzbek xatosi, MP4 seek/history, HLS live/reconnect, fullscreen landscape,
sevimli/history va dark/light rejim tekshiriladi. APK/AAB release imzosi alohida
Play signing kaliti bilan CI ichida qurilishi kerak.
