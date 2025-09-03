import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectName, projectDescription, questionAnswers, previousFeatures = [] } = await request.json();

    // Basic validation
    if (!projectName || !projectDescription) {
      return NextResponse.json({ error: "Project name and description are required" }, { status: 400 });
    }

    // Format question answers nicely for prompt
    const answersText =
      questionAnswers && questionAnswers.length > 0
        ? questionAnswers
            .map(
              (qa: any, index: number) =>
                `Question ${index + 1}: ${qa.questionText}\nAnswer: ${qa.answer}`
            )
            .join("\n\n")
        : "No additional answers provided.";
        
    // Format previous features for context
    const previousFeaturesText = previousFeatures.length > 0
      ? `\nPreviously Generated Features (DO NOT DUPLICATE THESE):\n${previousFeatures.map((feature: string, index: number) => `${index + 1}. ${feature}`).join('\n')}`
      : "";

    const prompt = `
You are an expert product manager and software architect. Based on the following project information, generate exactly ONE high-quality feature that would be essential for this project.

Project Name: ${projectName}
Project Description: ${projectDescription}

Additional Context:
${answersText}${previousFeaturesText}

Requirements:
1. Generate exactly ONE feature that is directly relevant to the project goals
2. The feature must be technically feasible
3. The feature must provide clear user value
4. The feature should be unique and valuable
5. DO NOT duplicate any of the previously generated features listed above

Format your response as a JSON object with the following structure:
{
  "features": [
    {
      "title": "Feature Name",
      "description": "Clear description of what the feature does and why it's valuable",
      "priority": "High|Medium|Low|Critical",
      "effort": "Small|Medium|Large|XL",
      "category": "Core|Enhancement|Integration|UI/UX|Performance|Security"
    }
  ]
}

Make sure each feature is unique, valuable, and implementable. Focus on quality over quantity.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert product manager who generates high-quality, implementable features for software projects. Always respond with valid JSON. Generate exactly ONE feature per request that does not duplicate any previously generated features.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      console.error("Empty response from OpenAI");
      return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 });
    }

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", response);
      return NextResponse.json({ error: "Invalid JSON response from OpenAI" }, { status: 500 });
    }

    if (
      !parsedResponse.features ||
      !Array.isArray(parsedResponse.features) ||
      parsedResponse.features.length === 0
    ) {
      console.error("Invalid features format:", parsedResponse);
      return NextResponse.json({ error: "Invalid features format from OpenAI" }, { status: 500 });
    }

    // Normalize features with defaults - we only expect one feature
    let validatedFeatures = parsedResponse.features.map((feature: any) => ({
      title: feature.title || "Untitled Feature",
      description: feature.description || "",
      priority: feature.priority || "Medium",
      effort: feature.effort || "Medium",
      category: feature.category || "Core",
    }));
    
    // Ensure we have exactly one feature
    if (validatedFeatures.length > 1) {
      // If we have too many, take only the first one
      validatedFeatures = validatedFeatures.slice(0, 1);
      console.warn("OpenAI returned more than one feature, using only the first one");
    }

    return NextResponse.json({ features: validatedFeatures });
  } catch (error: any) {
    console.error("Error generating features:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate features" },
      { status: 500 }
    );
  }
}
