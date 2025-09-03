// Test script for the generate-documentation API route
// This file is for testing purposes only and can be deleted after testing

// @ts-ignore - Ignore TypeScript errors for node-fetch in Next.js environment
import fetch from 'node-fetch';

async function testGenerateDocumentation() {
  console.log("Testing generate-documentation API route...");
  
  // Mock project data
  const mockProjectData = {
    projectName: "Task Flow",
    projectDescription: "A project management tool for teams to track tasks and collaborate efficiently.",
    techStack: "nextjs-convex",
    features: [
      {
        id: "feature1",
        title: "Task Creation",
        description: "Users can create new tasks with title, description, due date, and priority.",
        priority: "High",
        effort: "Medium",
        category: "Core",
        implementationDetails: "Implement using React components with Convex backend for data storage."
      },
      {
        id: "feature2",
        title: "Task Assignment",
        description: "Users can assign tasks to team members.",
        priority: "Medium",
        effort: "Small",
        category: "Core",
        implementationDetails: "Add user selection dropdown in task creation/edit forms."
      }
    ],
    summary: "Task Flow is a modern project management application built to help teams collaborate efficiently."
  };
  
  try {
    // Make a direct HTTP request to the API endpoint
    const response = await fetch('http://localhost:3000/api/ai/generate-documentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockProjectData),
    });
    
    // Check if response is successful
    if (response.ok) {
      const data: any = await response.json();
      console.log("✅ API route test successful!");
      console.log("Documentation length:", data.documentation?.length || 0);
      console.log("PDF base64 length:", data.pdfBase64?.length || 0);
    } else {
      console.error("❌ API route test failed with status:", response.status);
      const errorData = await response.json();
      console.error("Error:", errorData);
    }
  } catch (error) {
    console.error("❌ API route test failed with exception:", error);
  }
}

// Run the test
testGenerateDocumentation();

export { testGenerateDocumentation };
