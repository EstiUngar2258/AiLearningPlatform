const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
let client = null;

try {
    client = new OpenAI({ 
        apiKey,
        maxRetries: 5,
        timeout: 60000  // increased timeout to 60 seconds
    });
    console.log('OpenAI client initialized successfully');
} catch (e) {
    console.error('Failed to initialize OpenAI client:', e.message);
    client = null;
}

function hasValidKey() {
  return !!client;
}


// Function to generate a lesson using OpenAI
async function generateLesson(meta = {}, promptText = '') {
  if (!client) {
    // mock fallback for development
    const mock = {
      title: `MOCK: ${meta.subCategoryName || meta.categoryName || 'Lesson'}`,
      lesson: `זהו שיעור מדומה עבור: ${promptText}`,
      steps: ['שלב 1', 'שלב 2']
    };
    return { raw: JSON.stringify(mock), parsed: mock };
  }

  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        { 
          role: 'system', 
          content: `אתה מורה מומחה שיוצר תוכן חינוכי. 
עליך להחזיר את התוכן בפורמט הבא (טקסט בלבד, לא JSON):

# [נושא השיעור]

[תיאור קצר של הנושא]

## מושגים וקביעות
* [מושג 1] - [הסבר]
* [מושג 2] - [הסבר]

## דוגמאות מעשיות
* [דוגמה מפורטת עם פתרון]
* [דוגמה נוספת עם פתרון]

## תרגול
1. [שאלה 1]
2. [שאלה 2]

## סיכום
[סיכום קצר של הנקודות העיקריות]

---
הנחיות:
* כתוב בשפה ברורה ופשוטה
* הוסף דוגמאות מהחיים
* תן הסברים מפורטים צעד אחר צעד
* השתמש בפורמט Markdown לכותרות ורשימות
* הקפד על עיצוב נקי ומסודר---

הנחיות:
1. כתוב פסקאות קצרות וברורות.
2. השתמש בכותרות מודגשות ו־Markdown.
3. שלב דוגמאות בתוך הטקסט.
4. הוסף תמיד תרגול.
5. כתוב בעברית מותאמת לרמת המשתמש.`
    },
    { 
      role: 'user', 
      content: `משתמש: ${meta.userName || 'תלמיד'}
קטגוריה: ${meta.categoryName || 'כללי'}
תת קטגוריה: ${meta.subCategoryName || ''}
בקשה: ${promptText}`
    }
  ],
  max_tokens: 2000,
  temperature: 0.7
});
    const raw = resp.choices?.[0]?.message?.content || JSON.stringify(resp);
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch (e) { /* not JSON */ }
    return { raw, parsed };
  } catch (err) {
    console.error('OpenAI generateLesson error:', err);
    throw err;
  }
}

module.exports = { hasValidKey, generateLesson };