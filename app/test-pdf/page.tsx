"use client";

import { useState } from "react";
import { Loader2, FileText } from "lucide-react";

export default function TestPdfPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [responseData, setResponseData] = useState<any>(null);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setStatus(null);
    setResponseData(null);

    try {
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

      // Call the API endpoint
      const response = await fetch('/api/ai/generate-documentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockProjectData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "PDF generated successfully!"
        });

        // Display response data
        setResponseData({
          documentationLength: data.documentation?.length || 0,
          pdfBase64Length: data.pdfBase64?.length || 0,
          documentationPreview: data.documentation?.substring(0, 200) + '...'
        });

        // Download the PDF
        if (data.pdfBase64) {
          const pdfBlob = new Blob([Buffer.from(data.pdfBase64, 'base64')], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);

          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = 'test-documentation.pdf';
          document.body.appendChild(a);
          a.click();

          // Clean up
          document.body.removeChild(a);
          URL.revokeObjectURL(pdfUrl);
        }
      } else {
        setStatus({
          type: "error",
          message: `Error: ${data.error || 'Unknown error'}`
        });
        setResponseData(data);
      }
    } catch (error: any) {
      setStatus({
        type: "error",
        message: `Error: ${error.message}`
      });
      setResponseData(error.toString());
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">PDF Documentation Generator Test</h1>
        
        <p className="mb-6 text-gray-600">This page tests the PDF documentation generation API endpoint.</p>
        
        <button
          onClick={handleGeneratePdf}
          disabled={isGenerating}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Generate Test PDF
            </>
          )}
        </button>
        
        {status && (
          <div className={`mt-6 p-4 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status.message}
          </div>
        )}
        
        {responseData && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Response:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto max-h-80">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
