/**
 * AI Service for GroundTruth.
 * Communicates with hosted instruction-tuned open-weight models (e.g., Gemma 2 9B-IT)
 * via OpenAI-compatible inference APIs (Groq, OpenRouter, Together AI, Ollama).
 */

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Validates the parsed AI response structure against GroundTruth report schema.
 */
function validateStructuredReport(data, fallbackCategory, fallbackLocation) {
  if (!data || typeof data !== 'object') {
    throw new Error('AI output is not a valid JSON object.');
  }

  const title = typeof data.title === 'string' && data.title.trim().length > 0
    ? data.title.trim()
    : 'Public-Space Observation Report';

  const category = typeof data.category === 'string' && data.category.trim().length > 0
    ? data.category.trim()
    : fallbackCategory;

  const location = typeof data.location === 'string' && data.location.trim().length > 0
    ? data.location.trim()
    : fallbackLocation;

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    throw new Error('AI report is missing a valid description.');
  }

  const description = data.description.trim();

  const suggestedAction = typeof data.suggestedAction === 'string' && data.suggestedAction.trim().length > 0
    ? data.suggestedAction.trim()
    : 'Review report details and share with responsible facility coordinators or civic maintenance team.';

  let missingInformation = [];
  if (Array.isArray(data.missingInformation)) {
    missingInformation = data.missingInformation
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => item.trim());
  }

  return {
    title,
    category,
    location,
    description,
    suggestedAction,
    missingInformation
  };
}

/**
 * Robust JSON extractor that handles markdown code blocks or surrounding text.
 */
function extractAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response received from AI model.');
  }

  const trimmed = rawText.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch (err) {
    // Continue to regex extraction
  }

  // Look for JSON block in markdown ```json ... ``` or ``` ... ```
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = trimmed.match(jsonBlockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (err) {
      // Continue to bracket search
    }
  }

  // Look for outermost { ... }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (err) {
      throw new Error('Failed to parse AI output as structured JSON.');
    }
  }

  throw new Error('AI response did not contain a valid JSON document.');
}

/**
 * Builds the system and user instructions for the Gemma model.
 */
function buildPrompt({ category, location, observation, additionalDetails, language }) {
  const systemPrompt = `You are GroundTruth AI, an objective public-space reporting assistant.
Your job is to convert real-world civic observations into clear, structured, actionable reports for local authorities, campus facilities, or civic bodies.

CRITICAL RULES:
1. Preserve the user's actual observation faithfully. Never invent or hallucinate facts, damages, or occurrences not mentioned.
2. Improve clarity, coherence, and professional grammar.
3. Use neutral, objective, professional civic-tech language.
4. Distinguish observed facts from recommendations.
5. Identify any relevant information that may be missing (e.g., exact room number, time of day, whether passage is completely blocked or partially passable) as items for the reporter to verify.
6. Suggest exactly one reasonable, constructive next step (e.g., "Submit work order to campus facilities department", "Notify municipal sanitation division").
7. NEVER claim that the issue has been verified, inspected, or resolved.
8. Avoid making unsupported legal, financial, or safety-critical judgments.
9. Return ONLY a valid JSON object matching the exact schema below. Do not include introductory text, conversational remarks, or closing commentary.

LANGUAGE INSTRUCTION:
Output the values of "title", "description", "suggestedAction", and "missingInformation" in ${language}. Keep the JSON keys in English.

SCHEMA:
{
  "title": "Short descriptive title of the issue",
  "category": "${category}",
  "location": "${location}",
  "description": "Clear, objective, and well-structured description of the observed problem",
  "suggestedAction": "One clear, constructive next step for sharing or reporting",
  "missingInformation": [
    "Relevant detail user may want to verify (if any)",
    "Another detail (if any)"
  ]
}`;

  const userPrompt = `Please structure this public-space observation:
- Issue Category: ${category}
- Location / Landmark: ${location}
- User's Observation: ${observation}
${additionalDetails ? `- Additional Details: ${additionalDetails}` : ''}
- Requested Language: ${language}

Generate the structured JSON report now:`;

  return { systemPrompt, userPrompt };
}

/**
 * Generates a structured civic report using the hosted Gemma model.
 */
export async function generateReport({ category, location, observation, additionalDetails, language }) {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gemma2-9b-it';
  const baseUrl = (process.env.AI_API_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
  const timeoutMs = parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) || DEFAULT_TIMEOUT_MS;

  if (!apiKey || apiKey.trim().length === 0 || apiKey === 'your_api_key_here') {
    const error = new Error('AI API key is not configured in the backend environment.');
    error.status = 503;
    error.code = 'MISSING_API_KEY';
    throw error;
  }

  const { systemPrompt, userPrompt } = buildPrompt({
    category,
    location,
    observation,
    additionalDetails,
    language
  });

  const requestBody = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 1024
  };

  // Add response_format json_object if supported by the provider
  if (!baseUrl.includes('anthropic')) {
    requestBody.response_format = { type: 'json_object' };
  }

  const endpointUrl = `${baseUrl}/chat/completions`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    if (fetchErr.name === 'AbortError') {
      const error = new Error(`AI inference request timed out after ${timeoutMs / 1000} seconds.`);
      error.status = 504;
      error.code = 'TIMEOUT';
      throw error;
    }
    const error = new Error(`Failed to connect to AI inference provider: ${fetchErr.message}`);
    error.status = 502;
    error.code = 'NETWORK_ERROR';
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson?.error?.message || JSON.stringify(errorJson);
    } catch (e) {
      errorDetail = await response.text();
    }

    if (response.status === 401 || response.status === 403) {
      const error = new Error('Invalid or unauthorized AI provider credentials.');
      error.status = 401;
      error.code = 'AUTHENTICATION_FAILED';
      throw error;
    }

    if (response.status === 429) {
      const error = new Error('The AI inference provider rate limit was reached. Please try again in a few moments.');
      error.status = 429;
      error.code = 'RATE_LIMITED';
      throw error;
    }

    if (response.status === 404 || errorDetail.toLowerCase().includes('model')) {
      const error = new Error(`Model "${model}" is not available or unrecognized at ${baseUrl}.`);
      error.status = 502;
      error.code = 'MODEL_NOT_FOUND';
      throw error;
    }

    const error = new Error(`AI provider responded with HTTP ${response.status}: ${errorDetail.slice(0, 150)}`);
    error.status = 502;
    error.code = 'PROVIDER_ERROR';
    throw error;
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (jsonErr) {
    const error = new Error('AI provider returned non-JSON payload.');
    error.status = 502;
    error.code = 'MALFORMED_PROVIDER_RESPONSE';
    throw error;
  }

  const content = responseData?.choices?.[0]?.message?.content;
  if (!content) {
    const error = new Error('AI provider returned an empty completion.');
    error.status = 502;
    error.code = 'EMPTY_RESPONSE';
    throw error;
  }

  // Extract JSON and validate structure
  const parsedData = extractAndParseJSON(content);
  const validatedReport = validateStructuredReport(parsedData, category, location);

  return {
    ...validatedReport,
    modelUsed: model,
    generatedAt: new Date().toISOString()
  };
}
