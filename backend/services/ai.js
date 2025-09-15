const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY || '';
let client = null;
const isDevelopment = process.env.NODE_ENV !== 'production';

// בפיתוח, נאפשר עבודה גם בלי OpenAI
if (isDevelopment) {
  console.log('Running in development mode - using mock AI responses');
} else if (apiKey && apiKey.startsWith('sk-')) {
  client = new OpenAI({ apiKey });
  console.log('OpenAI client initialized');
} else {
  console.warn('OpenAI API key not configured or invalid');
}

function hasValidKey() {
  return isDevelopment || !!client;
}

async function generateLesson(meta = {}, promptText = '') {
  if (!client || isDevelopment) {
    // תשובות מוכנות מראש למצב פיתוח
    const mockResponses = [
      {
        title: `שיעור ב${meta.subCategoryName || meta.categoryName || 'נושא כללי'}`,
        lesson: `הסבר מפורט: ${promptText}\n\nבשיעור זה נלמד על הנושא שביקשת. זוהי תשובת דמו שמדגימה את מבנה התשובה שתקבל מהמערכת כשהיא תהיה מחוברת ל-OpenAI.`,
        steps: [
          'ראשית, נבין את הבסיס של הנושא',
          'נתרגל עם דוגמאות פשוטות',
          'נעמיק להבנה מתקדמת יותר',
          'נסכם את מה שלמדנו'
        ],
        examples: [
          'דוגמה 1: הנה דוגמה פשוטה להמחשה',
          'דוגמה 2: וכאן דוגמה מתקדמת יותר'
        ],
        exercises: [
          'תרגיל 1: נסה ליישם את מה שלמדנו',
          'תרגיל 2: התמודד עם אתגר מורכב יותר'
        ],
        summary: 'בשיעור זה למדנו על הנושא שביקשת. תרגלנו דוגמאות ותרגילים והעמקנו בהבנה.'
      }
    ];

    const mockResponse = mockResponses[0];
    return { raw: JSON.stringify(mockResponse), parsed: mockResponse };
  }

  try {
    // Example using the OpenAI JS client - adjust model/method if your SDK version differs
    const resp = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: `אתה מורה מומחה שעוזר לתלמידים להבין נושאים מורכבים.
          עליך לענות במבנה JSON הבא:
          {
            "title": "כותרת השיעור",
            "lesson": "תוכן השיעור המלא",
            "steps": ["שלב 1", "שלב 2", "..."],
            "examples": ["דוגמה 1", "דוגמה 2", "..."],
            "exercises": ["תרגיל 1", "תרגיל 2", "..."],
            "summary": "סיכום קצר של השיעור"
          }` 
        },
        { 
          role: 'user', 
          content: `נושא: ${meta.categoryName || 'כללי'}
          תת-נושא: ${meta.subCategoryName || 'כללי'}
          שאלה: ${promptText}` 
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const raw = resp.choices?.[0]?.message?.content || JSON.stringify(resp);
    let parsed = null;
    try {
      if (typeof raw === 'string') {
        // נסה לחלץ JSON מהטקסט אם הוא לא ב-JSON
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          // אם אין JSON, יצור מבנה ברירת מחדל
          parsed = {
            title: meta.subCategoryName || meta.categoryName || 'שיעור',
            lesson: raw,
            steps: [],
            examples: [],
            exercises: [],
            summary: ''
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      // יצירת מבנה ברירת מחדל במקרה של שגיאה
      parsed = {
        title: meta.subCategoryName || meta.categoryName || 'שיעור',
        lesson: raw,
        steps: [],
        examples: [],
        exercises: [],
        summary: ''
      };
    }
    return { raw, parsed };
  } catch (err) {
    console.error('OpenAI generateLesson error:', err);
    if (err.response?.status === 429) {
      throw new Error('OPENAI_ERROR: Rate limit exceeded. Please try again in a few minutes.');
    }
    if (err.response?.status === 401) {
      throw new Error('OPENAI_API_KEY_INVALID: Invalid API key');
    }
    throw new Error(`OPENAI_ERROR: ${err.message || 'Unknown error occurred'}`)
  }
}

module.exports = { hasValidKey, generateLesson };