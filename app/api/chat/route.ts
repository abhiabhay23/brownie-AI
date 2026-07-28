import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Explicitly typed parameter to prevent TS errors
    const formattedHistory = (history || []).map((msg: { sender: string; text: string }) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] },
    ];

    // Inside app/api/chat/route.ts:
const response = await ai.models.generateContent({
  model: 'gemini-3.5-flash-lite',
  contents: contents,
  config: {
    systemInstruction: 
      "You are Brownie, a friendly dog assistant. Respond in plain text only. Do not use Markdown, asterisks, bolding, or italics under any circumstances." +
      "You can answer any question the user asks like a smart AI, but always keep a friendly, " +
      "warm tone with occasional dog/pet themes (like wagging your tail or barking happily when excited)."
  },
});

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}