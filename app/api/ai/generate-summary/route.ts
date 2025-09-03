import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectName, projectDescription, features, questionAnswers } = await request.json();

    if (!projectName || !projectDescription || !features) {
      return NextResponse.json(
        { error: 'Project name, description, and features are required' },
        { status: 400 }
      );
    }

    // Format features for the prompt
    const featuresText = features.map((feature: any, index: number) => 
      `${index + 1}. ${feature.title}: ${feature.description} (Priority: ${feature.priority}, Effort: ${feature.effort})`
    ).join('\n');

    // Format question answers
    const answersText = questionAnswers && questionAnswers.length > 0 
      ? questionAnswers.map((qa: any) => 
          `Q: ${qa.questionText}\nA: ${qa.answer}`
        ).join('\n\n')
      : '';

    const prompt = `
You are a senior product manager creating a comprehensive project summary. Based on the following information, generate a detailed project summary that includes project overview, key objectives, features breakdown, and next steps.

Project Name: ${projectName}
Project Description: ${projectDescription}

Generated Features:
${featuresText}

Additional Context:
${answersText}

Generate a comprehensive summary that includes:
1. Project overview and vision
2. Key objectives and goals
3. Target audience and use cases
4. Features breakdown with priorities
5. Technical considerations
6. Recommended development phases
7. Success metrics

Return the response as JSON with this structure:
{
  "overview": "Comprehensive project overview",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "targetAudience": "Description of target users",
  "useCases": ["Use case 1", "Use case 2", "Use case 3"],
  "featuresBreakdown": {
    "phase1": ["Feature for MVP"],
    "phase2": ["Enhancement features"],
    "phase3": ["Advanced features"]
  },
  "technicalConsiderations": ["Tech consideration 1", "Tech consideration 2"],
  "developmentPhases": [
    {
      "phase": "Phase 1 - MVP",
      "duration": "Estimated timeline",
      "description": "What to accomplish in this phase"
    }
  ],
  "successMetrics": ["Metric 1", "Metric 2", "Metric 3"]
}

Make the summary comprehensive, actionable, and strategically valuable for project planning.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a senior product manager who creates comprehensive, strategic project summaries. Always respond with valid JSON."
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
    let summary;
    try {
      summary = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response);
      throw new Error('Invalid JSON response from OpenAI');
    }

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}