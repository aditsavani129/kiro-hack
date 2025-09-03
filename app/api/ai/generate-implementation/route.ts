import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { featureTitle, featureDescription, projectContext, techStack } = await request.json();

    if (!featureTitle || !featureDescription) {
      return NextResponse.json(
        { error: 'Feature title and description are required' },
        { status: 400 }
      );
    }

    const prompt = `
You are a senior software engineer and technical architect. Generate a detailed implementation guide for the following feature:

Feature: ${featureTitle}
Description: ${featureDescription}
Project Context: ${projectContext || 'General web application'}
Tech Stack: ${techStack || 'React, TypeScript, Node.js'}

Provide:
1. Detailed implementation steps (4-6 steps)
2. Technical considerations and best practices
3. Potential challenges and solutions
4. Code structure recommendations
5. A comprehensive AI prompt for developers

Return the response as JSON with this structure:
{
  "implementationSteps": [
    "Step 1: Description of what to do",
    "Step 2: Next step...",
    // ... more steps
  ],
  "technicalConsiderations": [
    "Important technical point 1",
    "Important technical point 2",
    // ... more considerations
  ],
  "challenges": [
    {
      "challenge": "Potential challenge description",
      "solution": "How to solve this challenge"
    }
    // ... more challenges
  ],
  "codeStructure": "Recommended file structure and architecture approach",
  "aiPrompt": "Comprehensive prompt for AI coding assistants that includes all necessary context, requirements, and technical specifications"
}

Make the implementation guide practical, detailed, and actionable for developers.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a senior software engineer who creates detailed, practical implementation guides. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let implementationGuide;
    try {
      implementationGuide = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response);
      throw new Error('Invalid JSON response from OpenAI');
    }

    return NextResponse.json({ implementationGuide });

  } catch (error) {
    console.error('Error generating implementation guide:', error);
    return NextResponse.json(
      { error: 'Failed to generate implementation guide' },
      { status: 500 }
    );
  }
}