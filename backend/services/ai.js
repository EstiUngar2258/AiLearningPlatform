require('dotenv').config();
const OpenAI = require('openai');

let client = null;
let _hasValidKey = false;
// Normalize and trim API key to avoid issues with accidental spaces or surrounding quotes.
const rawKey = process.env.OPENAI_API_KEY;
let apiKey = undefined;
if (rawKey && typeof rawKey === 'string') {
  // trim whitespace and remove surrounding quotes if present
  apiKey = rawKey.trim().replace(/^\"|\"$/g, '').replace(/^\'|\'$/g, '');
}

// Validate key: must start with 'sk-' and not be a project placeholder 'sk-proj-'
if (apiKey && apiKey.startsWith && apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-')) {
  try {
    client = new OpenAI({ apiKey });
    _hasValidKey = true;
  } catch (e) {
    console.warn('Failed to initialize OpenAI client:', e && e.message);
    client = null;
    _hasValidKey = false;
  }
} else {
  if (apiKey && apiKey.startsWith && apiKey.startsWith('sk-proj-')) {
    console.warn('OPENAI_API_KEY appears to be a project/placeholder key; using mock AI for local testing.');
  } else if (apiKey) {
    console.warn('OPENAI_API_KEY does not look valid; using mock AI for local testing.');
  } else {
    console.log('No OPENAI_API_KEY set; using mock AI for local testing.');
  }
}

const SYSTEM_INSTRUCTION = `You are an expert educational content generator. When given a user request, return ONLY a JSON object (no explanatory text) with the following fields: title (string), lesson (string), steps (array of strings), examples (array of strings), exercises (array of strings), summary (string). Use Hebrew. If some fields are missing, set them to empty array or empty string. Return valid JSON only.`;

async function generateLesson(userMeta, userPrompt) {
  const userMessage = `User: ${userMeta.userName || 'User'}; Category: ${userMeta.categoryName || ''}; SubCategory: ${userMeta.subCategoryName || ''}; Instruction: ${userPrompt}`;
  if (!client) {
    // mock structured JSON response
    const mock = {
      title: `MOCK: ${userMeta.subCategoryName || userMeta.categoryName || 'Lesson'}`,
      lesson: `This is a mocked lesson for: ${userPrompt}`,
      steps: ['Step 1', 'Step 2'],
      examples: ['Example 1'],
      exercises: ['Exercise 1'],
      summary: 'Mock summary'
    };
    return { raw: JSON.stringify(mock), parsed: mock };
  }

  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 800
    });

    const raw = resp.choices && resp.choices[0] && resp.choices[0].message.content;

    // try parse JSON
    try {
      const parsed = JSON.parse(raw);
      return { raw, parsed };
    } catch (e) {
      // if parse fails, attempt to extract JSON substring
      const m = raw && raw.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          const parsed = JSON.parse(m[0]);
          return { raw, parsed };
        } catch (e2) {
          return { raw, parsed: null };
        }
      }
      return { raw, parsed: null };
    }
  } catch (err) {
    // rethrow with a clearer message for the caller to handle
    const msg = (err && err.message) ? err.message : String(err);
    const isAuth = /auth|api key|401|invalid/i.test(msg);
    const error = new Error(isAuth ? `OPENAI_API_KEY_INVALID: ${msg}` : `OPENAI_ERROR: ${msg}`);
    error.original = err;
    throw error;
  }
}

module.exports = { generateLesson, hasValidKey: () => _hasValidKey };
