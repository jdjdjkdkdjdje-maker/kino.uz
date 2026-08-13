# CSV / JSON import

Admin panelning **Sozlamalar va import** sahifasidan `.csv` yoki `.json` yuklanadi.
20 MB va 10 000 qator limiti bor. Import davom etadi; noto‘g‘ri qatorlar `errors`
ro‘yxatiga qator raqami bilan yoziladi.

## Kino ustunlari

Majburiy: `title`, `description`, `posterUrl`, `bannerUrl`, `releaseYear`,
`durationMinutes`, `language`, `country`, `categories`, `genres`.
Ixtiyoriy: `originalTitle`, `rating`, `videoUrl`, `isLicensedVideo`, `trailerUrl`,
`subtitleUrl`, `metadataSource`, `externalId`, `actors`, `directors`, `status`,
`isFeatured`, `isPopular`. Ko‘p qiymat: `Drama|Oilaviy`.

`videoUrl` bo‘sh qolishi mumkin. `isLicensedVideo=true` faqat to‘liq filmni tarqatish
huquqi tekshirilgan va `videoUrl` mavjud bo‘lganda ishlatiladi. Aks holda backend
video manzilini foydalanuvchiga bermaydi va mobil ilova faqat treylerni ko‘rsatadi.

## Kanal ustunlari

Majburiy: `name`, `logoUrl`, `country`, `language`, `streamUrl`, `categories`.
Ixtiyoriy: `bannerUrl`, `description`, `streamType`, `epgUrl`, `status`, `order`,
`isPopular`. Stream turi: `HLS`, `DASH`, `MP4`, `OTHER`.

Import yangi kategoriya/janr/aktyor/rejissyor nomini zarur bo‘lsa yaratadi. URL,
yil va davomiylik tekshiriladi. Template fayllar shu papkada.
