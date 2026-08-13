# Production deployment

1. `.env.example`dan secret manager orqali environment yarating. JWT secretlar
   kamida 32 tasodifiy bayt, DB/MinIO parollari alohida bo‘lsin.
2. TLS reverse proxyda `admin.example.uz` va `api.example.uz`ni yoqing.
3. `ADMIN_ORIGIN=https://admin.example.uz`, S3 public URL va CORSni sozlang.
4. `docker compose up --build -d`; health: `/api/v1/health`.
5. Admin demo parolini almashtiring; DB va MinIO versioned backupini yoqing.
6. Androidda faqat HTTPS URLni `--dart-define=API_BASE_URL=...` bilan bering.

## Android release signing

```bash
keytool -genkeypair -v -keystore ~/kinotv-release.jks \
  -keyalg RSA -keysize 4096 -validity 10000 -alias kinotv
cp mobile/android/key.properties.example mobile/android/key.properties
# key.properties ichidagi mutlaq manzil va parollarni kiriting
cd mobile
flutter clean && flutter pub get
flutter build apk --release --dart-define=API_BASE_URL=https://api.example.uz/api/v1
flutter build appbundle --release --dart-define=API_BASE_URL=https://api.example.uz/api/v1
```

`key.properties` va `.jks` Gitga kiritilmaydi. Google Play uchun AAB tavsiya etiladi.

## Kuzatuv va backup

PostgreSQL `pg_dump` kundalik, MinIO bucket versioning, Redis persistent AOF,
reverse proxy request loglari va 5xx alertlari tavsiya etiladi. `/health` liveness
uchun, DB migratsiya esa deploydan oldin `prisma migrate deploy` bilan bajariladi.
