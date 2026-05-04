import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt, toolType } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let systemInstruction = "You are Sahayak AI, an expert educational assistant for teachers and students. Provide helpful, accurate, and structured educational content.";

    // Contextualize the prompt based on the tool
    if (toolType === "quiz") {
      systemInstruction = "Generate a multiple-choice quiz based on the provided topic. Output the result in a clean, readable format with the correct answers clearly marked at the end.";
    } else if (toolType === "eli5") {
      systemInstruction = "Explain the provided concept as if the reader is 5 years old (ELI5). Keep it simple, engaging, and use a relatable analogy.";
    } else if (toolType === "lesson_plan") {
      systemInstruction = "Create a structured 45-minute lesson plan for the provided topic, including objectives, introduction, core activity, and assessment.";
    } else if (toolType === "story") {
      systemInstruction = "Write an engaging educational story about the topic provided. Make it suitable for school children.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in AI API Route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
