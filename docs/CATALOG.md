# Haqiqiy kino katalogi va huquq siyosati

Boshlang‘ich seed quyidagi haqiqiy filmlarni PostgreSQL bazasiga yozadi:

| Film | Yil | Reyting* | Tashqi ID | To‘liq video |
|---|---:|---:|---|---|
| The Shawshank Redemption | 1994 | 9.3 | IMDb `tt0111161` | yo‘q, rasmiy treyler bor |
| The Dark Knight | 2008 | 9.1 | IMDb `tt0468569` | yo‘q, rasmiy treyler bor |
| Inception | 2010 | 8.8 | IMDb `tt1375666` | yo‘q, rasmiy treyler bor |
| Interstellar | 2014 | 8.7 | IMDb `tt0816692` | yo‘q, rasmiy treyler bor |
| Parasite | 2019 | 8.5 | IMDb `tt6751668` | yo‘q, rasmiy treyler bor |
| Oppenheimer | 2023 | 8.3 | IMDb `tt15398776` | yo‘q, rasmiy treyler bor |

\* Reytinglar seed tayyorlangan 2026-08-13 sanasidagi katalog qiymatlaridir va
vaqt o‘tishi bilan manbada o‘zgarishi mumkin. Admin yoki keyingi metadata sync
ularni yangilashi mumkin.

## Metadata va media

- nom, yil, davomiylik, aktyor va rejissyorlar IMDb/TMDB identifikatori bilan;
- poster va backdrop: `image.tmdb.org`;
- treylerlar: film studiyasi/distributori tarqatgan YouTube havolalari;
- qisqacha mazmunlar: o‘zbek tilida yozilgan katalog tavsiflari;
- mualliflik huquqi bilan himoyalangan to‘liq film URLlari seedga kiritilmagan.

Bu mahsulot TMDB tomonidan tasdiqlanmagan yoki sertifikatlanmagan. Productionda
TMDB attribution logotipi va amaldagi API/image usage shartlarini ko‘rsatish kerak.
Hotlink o‘rniga huquq shartlari ruxsat etsa posterlarni MinIO/S3ga import qilish
tavsiya etiladi.

## Qonuniy video nazorati

`movies.videoUrl` nullable. `movies.isLicensedVideo` alohida huquq tasdig‘i:

1. URL mavjud, lekin `isLicensedVideo=false` — backend URLni public APIga bermaydi.
2. `isLicensedVideo=true`, lekin URL yo‘q — backend create/update/importni rad etadi.
3. Ikkalasi mavjud — detail API `hasFullVideo=true` va URLni qaytaradi.
4. Mobil ilova 1–2 holatda **Ko‘rish**ni yashiradi va mavjud bo‘lsa
   **Treylerni ko‘rish**ni ko‘rsatadi.
5. `/movies/:id/view` va `/history` litsenziyasiz film uchun 400 qaytaradi.

Admin paneldagi litsenziya checkboxi faqat tarqatish huquqi hujjat bilan
tekshirilgandan keyin yoqilishi kerak.
