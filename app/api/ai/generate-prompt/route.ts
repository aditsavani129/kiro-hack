import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, project, feature } = body;
    
    if (!type || !project) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const { projectName, projectDescription } = project;
    const allFeatures = project.features || [];

    let promptContent = "";

    if (type === "project") {
      // Generate a prompt for the entire project
      promptContent = await generateProjectPrompt(projectName, projectDescription, allFeatures);
    } else if (type === "feature" && feature) {
      // Generate a prompt for a specific feature
      promptContent = await generateFeaturePrompt(projectName, projectDescription, feature, allFeatures);
    } else {
      return NextResponse.json(
        { error: "Invalid prompt type or missing feature details" },
        { status: 400 }
      );
    }

    return NextResponse.json({ prompt: promptContent });
  } catch (error) {
    console.error("Error generating prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate prompt" },
      { status: 500 }
    );
  }
}

async function generateProjectPrompt(
  projectName: string,
  projectDescription: string,
  features: any[]
) {
  const featuresText = features
    .map((f) => `- ${f.title}: ${f.description || "No description"}`)
    .join("\n");

  const systemPrompt = `You are an expert software developer and technical writer. 
  Your task is to create a comprehensive, detailed prompt that will guide the implementation of a software project.
  The prompt should be structured, clear, and provide enough technical details for a developer to understand what needs to be built.`;

  const userPrompt = `Create a detailed implementation prompt for the following project:

Project Name: ${projectName}
Project Description: ${projectDescription}

Features:
${featuresText}

Your prompt should:
1. Start with a high-level overview of the project
2. Break down the technical requirements
3. Suggest a suitable architecture and technology stack if not already specified
4. Outline implementation steps in a logical order
5. Highlight potential challenges and how to address them
6. Include any best practices that should be followed

Format the prompt in a clear, structured way that a developer can easily follow.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || "Failed to generate prompt";
}

async function generateFeaturePrompt(
  projectName: string,
  projectDescription: string,
  featureDetails: any,
  allFeatures: any[]
) {
  const systemPrompt = `You are an expert software developer and technical writer.
  Your task is to create a detailed implementation prompt for a specific feature of a software project.
  The prompt should be structured, clear, and provide enough technical details for a developer to implement the feature.`;

  const userPrompt = `Create a detailed implementation prompt for the following feature:

Project Name: ${projectName}
Project Description: ${projectDescription}

Feature: ${featureDetails.title}
Description: ${featureDetails.description || "No description"}
Priority: ${featureDetails.priority || "Not specified"}
Effort: ${featureDetails.effort || "Not specified"}

Your prompt should:
1. Start with a clear description of what this feature should accomplish
2. Detail the technical requirements for implementing this feature
3. Suggest implementation approaches and potential libraries/tools to use
4. Outline step-by-step implementation instructions
5. Describe how this feature should integrate with other parts of the project
6. Include considerations for testing, edge cases, and performance

Format the prompt in a clear, structured way that a developer can easily follow.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0].message.content || "Failed to generate prompt";
}
