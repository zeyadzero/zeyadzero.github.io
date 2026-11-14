# رفع البورتفوليو على GitHub Pages (مجاناً)

## 1) عدّل بياناتك
افتح `data.js` وعدّل **ده الملف الوحيد المطلوب**:
- `name`, `handle`, `roles`, `tagline`: اسمك واللي بتشتغل فيه.
- `email`: لو كتبته، بيظهر زرار **Email me** و**Copy email** في قسم Contact.
- `about`, `facts`, `skills`, `projects`, `timeline`, `links`: كلها بتظهر في الموقع تلقائياً.
- في `skills`: `level` إما `"running"` (متمكّن) أو `"learning"` (بتتعلّم). كن صريح، شكله أحلى من الادّعاء.
- روابط GitHub: غيّر `YOUR-GITHUB-USERNAME` باسم حسابك.

اختياري: في `index.html` غيّر `<title>` و`description` (بيظهروا في جوجل ومشاركة اللينك).
الألوان في أول `assets/style.css` (متغيّرات `--accent` وغيرها).

## 2) جرّبه عندك
```bash
cd portfolio
python3 -m http.server 8000
```
وافتح `http://localhost:8000`. (أو افتح `index.html` مباشرة.)

## 3) ارفعه
**الأسهل (رابط باسمك):**
1. اعمل ريبو Public اسمه **بالظبط** `USERNAME.github.io`.
2. ارفع كل الملفات في الجذر (`index.html` و`data.js` و`assets/`...).
3. Settings ← Pages ← Source: **Deploy from a branch** ← Branch: `main` / `(root)` ← Save.
4. بعد دقيقة الموقع على `https://USERNAME.github.io`.

**أو في أي ريبو تاني:** نفس الخطوات والرابط هيبقى `https://USERNAME.github.io/REPO`.

**دومين خاص (اختياري):** Settings ← Pages ← Custom domain، وضبط DNS عند مزوّد الدومين.

## ملاحظات
- الموقع كله ملفات ثابتة: مفيش سيرفر ولا مكتبات خارجية ولا طلبات شبكة، فبيفتح بسرعة وآمن.
- البوت (شاشة الإقلاع) بيظهر مرة واحدة كل جلسة، وأي زر بيتخطّاه.
- لو المستخدم مفعّل "تقليل الحركة" في جهازه، الحركات بتتقلّص تلقائياً.
- الترمنال التفاعلي بيطبع مدخلات الزائر كنص عادي فقط، فمفيش خطر حقن كود.
- مفيش فورم تواصل (الموقع ثابت): التواصل عن طريق الإيميل والروابط.
