# KinoTV — Android kino va jonli telekanal platformasi

KinoTV — Flutter Android ilovasi, NestJS REST API, PostgreSQL/Prisma bazasi,
Redis keshi, MinIO fayl ombori va Next.js admin panelidan iborat to‘liq monorepo.
Kontent mobil kodga yozilmaydi: kino, kanal, stream va EPG ma’lumotlarining
barchasi API orqali PostgreSQL bazasidan olinadi.

## Kompyutersiz Render'ga joylash

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jdjdjkdkdjdje-maker/kino.uz/tree/arena/019ffa27-kino-uz)

Telefon brauzerida tugmani ochish API, admin panel, PostgreSQL va Redis'ni bitta
Blueprint orqali yaratadi. Render so‘raganda kamida 12 belgili yangi
`ADMIN_PASSWORD` kiriting. Batafsil yo‘riqnoma:
[docs/RENDER_DEPLOY.md](docs/RENDER_DEPLOY.md).

## Loyiha tuzilmasi

```text
kino.uz/
├── mobile/       Flutter, Riverpod, GoRouter, Dio, video_player/Chewie
├── backend/      NestJS, Prisma, PostgreSQL, JWT, Redis, Swagger, S3
├── admin/        Next.js 16, React 19, TypeScript, Tailwind CSS
├── database/     DBA uchun SQL sxema nusxasi
├── docs/         API, arxitektura, deploy, import va test hujjatlari
└── docker-compose.yml
```

## Ishlaydigan imkoniyatlar

- JWT access/refresh token rotatsiyasi, bcrypt hash, `USER`/`ADMIN` rollari;
- sahifalangan kino va telekanal katalogi, filter va kuchli qidiruv;
- haqiqiy film metadata katalogi: poster, yil, reyting, janr, aktyor, rejissyor va treyler;
- to‘liq video uchun `isLicensedVideo` huquq nazorati va public URL himoyasi;
- kino/kanal sevimlilari, ko‘rish tarixi va davom ettirish;
- HLS/MP4 player, live holati, fullscreen/landscape, xato va qayta ulanish;
- TV dastur jadvali: hozirgi/keyingi ko‘rsatuv va admin CRUD;
- admin dashboard, kino/kanal/kategoriya/janr/dastur/user/statistika CRUD;
- 10 000 qatorgacha CSV/JSON ommaviy import va qator xatolari hisoboti;
- S3/MinIO presigned upload, Redis home keshi, PostgreSQL indekslari;
- Swagger/OpenAPI, Docker Compose, Prisma migration va idempotent demo seed.

## Tez ishga tushirish (Docker)

Talablar: Docker 24+, Docker Compose v2, kamida 4 GB RAM.

```bash
cp .env.example .env
# JWT_* va barcha parollarni productionda albatta almashtiring
docker compose up --build
```

Birinchi ishga tushishda migratsiya va demo seed avtomatik bajariladi.

| Xizmat | Manzil |
|---|---|
| Admin panel | http://localhost:3000 |
| REST API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/docs |
| MinIO Console | http://localhost:9001 |

Demo admin: `admin@kinotv.uz` / `KinoTV_Admin_2026!`  
Demo user: `demo@kinotv.uz` / `Demo_User_2026!`

> Bu loginlar faqat lokal demo uchun. Productionga chiqarishdan oldin parollarni
> almashtiring va seed adminini o‘chiring.

## Alohida development

```bash
cp .env.example .env
npm install
# PostgreSQL, Redis va MinIO'ni yoqish
docker compose up -d postgres redis minio create-bucket
cd backend
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
# boshqa terminal
cd admin && npm run dev
```

## Android ilova

```bash
cd mobile
flutter pub get
# Android emulator: default 10.0.2.2:4000 ishlaydi
flutter run
# fizik qurilma yoki production API:
flutter run --dart-define=API_BASE_URL=https://api.example.uz/api/v1
flutter build apk --debug --dart-define=API_BASE_URL=https://api.example.uz/api/v1
flutter build apk --release --dart-define=API_BASE_URL=https://api.example.uz/api/v1
flutter build appbundle --release --dart-define=API_BASE_URL=https://api.example.uz/api/v1
```

Release imzosi uchun `mobile/android/key.properties.example`dan
`key.properties` yarating. Batafsil: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Test va tekshiruv

```bash
npm run build
npm test
API_URL=http://localhost:4000/api/v1 node backend/test/smoke.mjs
cd mobile && flutter analyze && flutter test
```

Smoke test ro‘yxatdan o‘tish, login/refresh/logout, RBAC, katalog, qidiruv,
sevimlilar, tarix, EPG va barcha asosiy admin CRUD oqimlarini real DB bilan
tekshiradi. [docs/TESTING.md](docs/TESTING.md)ga qarang.

## Kontent huquqi

Seed haqiqiy mashhur filmlarning katalog metadata, TMDB poster/backdrop rasmlari va
rasmiy treyler havolalarini saqlaydi; mualliflik huquqi bilan himoyalangan to‘liq
filmlar qo‘shilmaydi. To‘liq video faqat admin `isLicensedVideo` belgisini huquq
hujjatlari asosida yoqqanda foydalanuvchiga ochiladi. Demo TV oqimlari ommaviy HLS
sinov manbalaridir. TMDB tasvirlaridan foydalanilganda TMDB attribution va amaldagi
image usage shartlariga rioya qilish platforma operatorining majburiyatidir.
