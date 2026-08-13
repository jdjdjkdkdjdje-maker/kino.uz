# REST API

Base URL: `/api/v1`. Interaktiv hujjat: `/docs`. Mashina uchun to‘liq sxema:
[`openapi.json`](openapi.json).

## Auth

- `POST /auth/register`, `/auth/login`, `/auth/admin/login`
- `POST /auth/refresh` — refresh token bir marta ishlatiladi va aylantiriladi
- `POST /auth/logout`

Himoyalangan endpoint: `Authorization: Bearer <accessToken>`.

## Public katalog

- `GET /home`, `/movies`, `/movies/:id`, `/channels`, `/channels/:id`
- kino detailida `hasFullVideo`; `videoUrl` faqat `isLicensedVideo=true` bo‘lsa qaytadi
- `GET /search?q=...`
- `GET /categories`, `/movie-categories`, `/tv-categories`, `/genres`
- `GET /channels/:id/programs`

Ro‘yxat querylari: `page`, `limit`, `q`, `category`, `genre`, `country`, `year`,
`sort`. Javob `{ data, meta: { total, page, limit, totalPages, hasNext } }`.

## User

- `GET|PUT /users/me`, `PUT /users/me/settings`, `PUT /users/me/password`
- `GET /favorites`; movie/channel uchun `POST` va `DELETE`
- `GET|POST|DELETE /history`
- `POST /movies/:id/view`, `POST /channels/:id/view`

## Admin (`ADMIN` roli)

- kino va kanal `POST / PUT / DELETE` CRUD;
- kategoriya va janr CRUD;
- TV dastur CRUD;
- `GET /admin/dashboard`, `/admin/statistics`, `/admin/users`;
- `GET /admin/movies`, `/admin/channels`, `/admin/catalog`, `/admin/programs`;
- `POST /admin/imports/MOVIES|CHANNELS` (`multipart/form-data`, `file`);
- `POST /uploads/presign`.

Xato javobi doim `{ statusCode, message, path, timestamp }` ko‘rinishida.
