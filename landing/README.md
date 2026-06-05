# INTIZOM — Landing Page

INTIZOM shaxsiy o'sish daftari uchun to'liq landing page.

## Sahifalar

| Sahifa | Tavsif |
|--------|--------|
| `index.html` | Asosiy landing page |
| `order.html` | Buyurtma berish formasi |
| `success.html` | Buyurtma qabul qilindi |
| `admin.html` | Admin panel |

## Sozlash

`config.js` faylida backend URL ni o'zgartiring:

```js
window.INTIZOM_API_URL = 'https://your-backend.com/api';
```

## Deploy

Landing page oddiy static fayllar — istalgan hostingda ishlaydi:
- Vercel / Netlify (static site)
- Nginx yoki Apache

Backend (`../backend`) alohida deploy qilinadi.
