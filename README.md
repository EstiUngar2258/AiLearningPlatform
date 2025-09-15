# AI Learning Platform# AI Learning Platform# AI Learning Project



## 🎓 על הפרויקט



AI Learning Platform הינה פלטפורמה חדשנית המשלבת את כוחה של הבינה המלאכותית בעולם הלמידה. הפלטפורמה מאפשרת חווית למידה אינטראקטיבית, מותאמת אישית ומתקדמת.פלטפורמה ללמידה בעזרת בינה מלאכותית, המאפשרת למשתמשים לשאול שאלות ולקבל תשובות מותאמות אישית.This project contains:



המערכת מאפשרת למשתמשים לשאול שאלות בשפה טבעית, לקבל הסברים מפורטים ומותאמים אישית, ולעקוב אחר התקדמותם בתהליך הלמידה. בין אם אתם סטודנטים, מורים, או אנשי מקצוע - הפלטפורמה מספקת כלים חכמים להעשרת הידע והבנת נושאים מורכבים.- **Frontend**: React (Vite)



## ✨ תכונות עיקריות## 🏗️ מבנה הפרויקט- **Backend**: Node.js (Express, Mongoose)



- **למידה מותאמת אישית**: - **Database**: MongoDB (Atlas or local)

  - התאמה אוטומטית לסגנון הלמידה האישי

  - מעקב אחר התקדמות והתאמת רמת הקושיהפרויקט מחולק לשני חלקים עיקריים:

  - המלצות מותאמות לנושאי למידה נוספים

## Setup

- **אינטראקציה חכמה**:

  - שאילת שאלות בשפה טבעית### Frontend (React + Vite)

  - קבלת הסברים מפורטים ומובנים

  - אפשרות לשאלות המשך והבהרות```Clone the repository and install dependencies for both frontend and backend:



- **מעקב והתקדמות**:frontend/

  - היסטוריית למידה מפורטת

  - ניתוח דפוסי למידה├── src/```bash

  - סטטיסטיקות והמלצות לשיפור

│   ├── components/     # רכיבי React# Install frontend dependenciesnpm run dev

- **ממשק משתמש**:

  - עיצוב נקי ואינטואיטיבי│   │   ├── auth/      # רכיבי אותנטיקציהnpm install

  - תמיכה מלאה בעברית ואנגלית

  - נגישות מכל מכשיר│   │   ├── common/    # רכיבים משותפים



## 🎯 למי זה מתאים?│   │   ├── history/   # רכיבי היסטוריית למידה# Install backend dependencies



- **סטודנטים**:│   │   └── prompt/    # רכיבי שאילת שאלותcd backend

  - עזרה בהבנת חומר לימודי

  - פתרון תרגילים והכנה למבחנים│   ├── context/       # Context Providersnpm install

  - העמקה בנושאים מורכבים│   ├── hooks/         # Custom Hooks

│   ├── services/      # שירותי API

- **מורים ומרצים**:│   ├── styles/        # קבצי CSS

  - יצירת חומרי לימוד│   └── utils/         # פונקציות עזר

  - התאמת תוכן לתלמידים```

  - מעקב אחר התקדמות

### Backend (Node.js + Express)

- **אנשי מקצוע**:```

  - למידה מתמדת והתעדכנותbackend/

  - הבנת נושאים חדשים├── config/           # הגדרות קונפיגורציה

  - פיתוח מיומנויות מקצועיות├── controllers/      # בקרי API

├── middleware/       # Middleware functions

## 🌟 יתרונות המערכת├── models/          # מודלים של MongoDB

├── routes/          # הגדרות נתיבי API

- **זמינות 24/7**: למידה בכל זמן ומקום├── services/        # שירותים חיצוניים

- **תשובות מיידיות**: מענה מהיר ומדויק└── utils/           # פונקציות עזר

- **למידה רציפה**: המערכת מתעדכנת ומשתפרת```

- **אבטחה**: הגנה על פרטיות המשתמשים

## 🛠️ דרישות מקדימות

## 🏗️ מבנה הפרויקט

1. **Node.js** - גרסה 18 ומעלה

הפרויקט מחולק לשני חלקים עיקריים:2. **Docker** - להרצת הפרויקט בקונטיינרים

3. **MongoDB** - מסד נתונים

### Frontend (React + Vite)4. **Git** - לניהול קוד

```

frontend/## ⚙️ התקנה

├── src/

│   ├── components/     # רכיבי React1. שכפול המאגר:

│   │   ├── auth/      # רכיבי אותנטיקציה```bash

│   │   ├── common/    # רכיבים משותפיםgit clone https://github.com/EstiUngar2258/AiLearningPlatform.git

│   │   ├── history/   # רכיבי היסטוריית למידהcd AiLearningPlatform

│   │   └── prompt/    # רכיבי שאילת שאלות```

│   ├── context/       # Context Providers

│   ├── hooks/         # Custom Hooks2. התקנת תלויות בצד הלקוח:

│   ├── services/      # שירותי API```bash

│   ├── styles/        # קבצי CSScd frontend

│   └── utils/         # פונקציות עזרnpm install

``````



### Backend (Node.js + Express)3. התקנת תלויות בצד השרת:

``````bash

backend/cd ../backend

├── config/           # הגדרות קונפיגורציהnpm install

├── controllers/      # בקרי API```

├── middleware/       # Middleware functions

├── models/          # מודלים של MongoDB## 🚀 הרצה

├── routes/          # הגדרות נתיבי API

├── services/        # שירותים חיצוניים### הרצה עם Docker:

└── utils/           # פונקציות עזר```bash

```docker-compose up --build

```

## 🛠️ דרישות מקדימות

### הרצה ללא Docker:

1. **Node.js** - גרסה 18 ומעלה

2. **Docker** - להרצת הפרויקט בקונטיינריםבצד השרת:

3. **MongoDB** - מסד נתונים```bash

4. **Git** - לניהול קודcd backend

npm start

## ⚙️ התקנה```



1. שכפול המאגר:בצד הלקוח:

```bash```bash

git clone https://github.com/EstiUngar2258/AiLearningPlatform.gitcd frontend

cd AiLearningPlatformnpm run dev

``````



2. התקנת תלויות בצד הלקוח:## 🌐 נקודות קצה

```bash

cd frontendהפרויקט יהיה זמין ב:

npm install- Frontend: http://localhost:3000

```- Backend API: http://localhost:5000



3. התקנת תלויות בצד השרת:## 🔑 משתני סביבה

```bash

cd ../backend### Backend (.env)

npm install```

```NODE_ENV=development

PORT=5000

## 🚀 הרצהMONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

### הרצה עם Docker:```

```bash

docker-compose up --build### Frontend (.env)

``````

VITE_API_URL=http://localhost:5000

### הרצה ללא Docker:```



בצד השרת:## 👥 תרומה לפרויקט

```bash

cd backend1. צור fork למאגר

npm start2. צור branch חדש לתכונה שלך

```3. Commit את השינויים שלך

4. Push ל-branch שיצרת

בצד הלקוח:5. פתח Pull Request

```bash

cd frontend## 📝 רישיון

npm run dev

```פרויקט זה מופץ תחת רישיון MIT. ראה קובץ `LICENSE` לפרטים נוספים.



## 🌐 נקודות קצה## 📞 תמיכה



הפרויקט יהיה זמין ב:אם נתקלת בבעיות או שיש לך שאלות, אנא פתח issue במאגר GitHub.
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔑 משתני סביבה

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## 👥 תרומה לפרויקט

1. צור fork למאגר
2. צור branch חדש לתכונה שלך
3. Commit את השינויים שלך
4. Push ל-branch שיצרת
5. פתח Pull Request

## 📝 רישיון

פרויקט זה מופץ תחת רישיון MIT. ראה קובץ `LICENSE` לפרטים נוספים.

## 📞 תמיכה

אם נתקלת בבעיות או שיש לך שאלות, אנא פתח issue במאגר GitHub.