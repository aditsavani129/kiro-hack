import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { jsPDF } from "jspdf";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectName, projectDescription, techStack, features, summary } = await request.json();

    // Basic validation
    if (!projectName || !projectDescription) {
      return NextResponse.json({ error: "Project name and description are required" }, { status: 400 });
    }
    
    // Format tech stack for the prompt
    let techStackName = "";
    if (techStack) {
      // Handle both string and object formats
      if (typeof techStack === 'object' && techStack !== null && 'name' in techStack) {
        techStackName = techStack.name;
      } else if (typeof techStack === 'string') {
        // Convert kebab-case to readable format
        switch(techStack) {
          case 'nextjs-supabase':
            techStackName = 'Next.js + Supabase';
            break;
          case 'nextjs-convex':
            techStackName = 'Next.js + Convex';
            break;
          case 'mern':
            techStackName = 'MERN Stack (MongoDB, Express, React, Node)';
            break;
          case 'reactjs-supabase':
            techStackName = 'React.js + Supabase';
            break;
          case 'reactjs-convex':
            techStackName = 'React.js + Convex';
            break;
          default:
            techStackName = techStack;
        }
      }
    }

    // Format features for the prompt
    const featuresText = features && features.length > 0
      ? features
          .map((feature: any, index: number) => 
            `Feature ${index + 1}: ${feature.title}
Description: ${feature.description}
Priority: ${feature.priority}
Effort: ${feature.effort}
Category: ${feature.category}
${feature.implementationDetails ? `Implementation Details: ${feature.implementationDetails}` : ''}`
          )
          .join("\n\n")
      : "No features provided.";

    const prompt = `
You are an expert technical documentation writer. Based on the following project information, generate comprehensive documentation for this software project.

Project Name: ${projectName}
Project Description: ${projectDescription}
Tech Stack: ${techStackName || "Not specified"}

Features:
${featuresText}

${summary ? `Project Summary: ${summary}` : ''}

Requirements:
1. Generate professional documentation that covers the project overview, architecture, features, and implementation guidelines
2. Structure the documentation with clear sections and headings
3. Include technical details relevant to the specified tech stack
4. Provide implementation guidance for each feature
5. Include a section on getting started with the project

Format your response as a well-structured document with markdown formatting. Include:
- Title and project overview
- Tech stack details and architecture
- Feature descriptions with implementation guidelines
- Setup and installation instructions
- Development workflow recommendations
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert technical documentation writer who creates comprehensive, well-structured documentation for software projects. Your documentation is clear, professional, and technically accurate.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      console.error("Empty response from OpenAI");
      return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 });
    }

    // Generate PDF from the markdown content
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `${projectName} Documentation`,
      subject: `Technical documentation for ${projectName}`,
      creator: 'TaskFlow Documentation Generator',
      author: 'TaskFlow',
    });
    
    // Add header with project name
    doc.setFillColor(40, 50, 78); // Dark blue header
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${projectName} Documentation`, 105, 20, { align: 'center' });
    
    // Add tech stack info
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    if (techStackName) {
      doc.text(`Tech Stack: ${techStackName}`, 105, 28, { align: 'center' });
    }
    
    // Reset text color for main content
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    // Process markdown content
    // Extract sections to format them differently
    const sections = response.split('\n#');
    let mainContent = sections[0].trim();
    
    if (sections.length > 1) {
      // First section is intro text
      mainContent = sections[0].trim();
      
      // Process the rest of the sections with headers
      for (let i = 1; i < sections.length; i++) {
        mainContent += '\n\n# ' + sections[i].trim();
      }
    }
    
    // Split the text into lines that fit on the page
    const textLines = doc.splitTextToSize(mainContent, 170);
    
    // Add the lines to the PDF, handling pagination
    let y = 40; // Start below the header
    const lineHeight = 7;
    
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      
      // Add a new page if we're at the bottom
      if (y > 280) {
        doc.addPage();
        // Add a smaller header to continuation pages
        doc.setFillColor(40, 50, 78);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(`${projectName} Documentation (continued)`, 105, 10, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        y = 25; // Start below the header
      }
      
      // Check if this is a heading line (starts with #)
      if (line.startsWith('# ')) {
        // Add some space before headings
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(line.substring(2), 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        y += lineHeight + 3;
      } else if (line.startsWith('## ')) {
        // Subheading
        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(line.substring(3), 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        y += lineHeight + 2;
      } else if (line.startsWith('### ')) {
        // Sub-subheading
        y += 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(line.substring(4), 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        y += lineHeight + 1;
      } else {
        // Regular text
        doc.text(line, 20, y);
        y += lineHeight;
      }
    }
    
    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    // Convert PDF to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    
    return NextResponse.json({ 
      documentation: response,
      pdfBase64: pdfBase64
    });
  } catch (error: any) {
    console.error("Error generating documentation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate documentation" },
      { status: 500 }
    );
  }
}
