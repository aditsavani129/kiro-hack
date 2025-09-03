// app/api/ai/generate-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectName, projectDescription } = await request.json();

    if (!projectName || !projectDescription) {
      return NextResponse.json(
        { error: 'Project name and description are required' },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert project manager and business analyst. Based on the following project information, generate exactly 3 smart, insightful questions that will help better understand the project requirements, target audience, technical needs, and business goals.

Project Name: ${projectName}
Project Description: ${projectDescription}

Please generate 3 questions that cover different aspects:
1. One question about the target users/audience or business goals
2. One question about technical requirements, constraints, or integrations
3. One question about specific features, functionality, or user experience

Return the response as a JSON array with this exact structure:
[
  {
    "questionText": "Your question here?",
    "section": "business",
    "inputType": "textarea",
    "placeholderText": "Describe your answer...",
    "isRequired": true,
    "orderIndex": 1
  }
]

Section types should be: "business", "technical", or "user_experience"
Input types should be: "text" or "textarea"
Make questions specific, actionable, and relevant to the project described.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert project manager who generates insightful questions to understand project requirements better. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate the response structure
    if (!Array.isArray(questions) || questions.length !== 3) {
      throw new Error('Invalid questions format');
    }

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}