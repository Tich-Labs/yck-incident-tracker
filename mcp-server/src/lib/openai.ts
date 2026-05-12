import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

let client: OpenAI | null = null;

if (apiKey && apiKey !== "sk-your-key-here") {
  client = new OpenAI({ apiKey });
}

export function getOpenAI(): OpenAI | null {
  return client;
}

export function hasOpenAI(): boolean {
  return client !== null;
}
