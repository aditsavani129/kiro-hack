import { useState } from 'react';
import { X, Code, Lightbulb, CheckCircle, Copy, ExternalLink } from 'lucide-react';

interface FeatureDetailModalProps {
  feature: {
    _id: string;
    title: string;
    description: string;
    priority: string;
    effort: string;
    category: string;
    implementationDetails?: string;
    aiPrompt?: string;
  };
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FeatureDetailModal({ feature, projectName, isOpen, onClose }: FeatureDetailModalProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedImplementation, setCopiedImplementation] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, type: 'prompt' | 'implementation') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'prompt') {
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
      } else {
        setCopiedImplementation(true);
        setTimeout(() => setCopiedImplementation(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'XL': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Large': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Small': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Enhancement': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Integration': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'UI/UX': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Performance': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Security': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Parse implementation details if it's a JSON string
  let implementationGuide = null;
  try {
    if (feature.implementationDetails) {
      implementationGuide = JSON.parse(feature.implementationDetails);
    }
  } catch (e) {
    // If it's not JSON, treat as plain text
    implementationGuide = {
      implementationSteps: [feature.implementationDetails || "Implementation details will be generated when you request them."],
      technicalConsiderations: [],
      challenges: [],
      codeStructure: "",
      aiPrompt: feature.aiPrompt || ""
    };
  }

  const defaultPrompt = `Create a ${feature.title.toLowerCase()} feature for a ${projectName} project. The feature should ${feature.description.toLowerCase()}. Include proper error handling, responsive design, and follow modern development best practices. Tech stack: React, TypeScript, Tailwind CSS.`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
              <p className="text-blue-100 mb-4">{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(feature.priority)}`}>
                  {feature.priority} Priority
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEffortColor(feature.effort)}`}>
                  {feature.effort} Effort
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(feature.category)}`}>
                  {feature.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Implementation Guide */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Implementation Guide</h3>
              </div>

              {implementationGuide?.implementationSteps && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Implementation Steps</h4>
                  <ol className="space-y-2">
                    {implementationGuide.implementationSteps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {implementationGuide?.technicalConsiderations && implementationGuide.technicalConsiderations.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Technical Considerations</h4>
                  <ul className="space-y-1">
                    {implementationGuide.technicalConsiderations.map((consideration: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {implementationGuide?.challenges && implementationGuide.challenges.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Potential Challenges & Solutions</h4>
                  <div className="space-y-3">
                    {implementationGuide.challenges.map((item: any, index: number) => (
                      <div key={index} className="border-l-2 border-red-200 pl-3">
                        <p className="text-sm font-medium text-red-800">Challenge: {item.challenge}</p>
                        <p className="text-sm text-red-700">Solution: {item.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {implementationGuide?.codeStructure && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Code Structure</h4>
                  <p className="text-sm text-gray-700">{implementationGuide.codeStructure}</p>
                </div>
              )}
            </div>

            {/* AI Prompt */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Development Prompt</h3>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Copy this prompt to use with your AI coding assistant:</p>
                  <button
                    onClick={() => copyToClipboard(implementationGuide?.aiPrompt || feature.aiPrompt || defaultPrompt, 'prompt')}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    {copiedPrompt ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-white rounded border border-purple-200 p-3 max-h-48 overflow-y-auto">
                  <code className="text-xs text-gray-800 whitespace-pre-wrap">
                    {implementationGuide?.aiPrompt || feature.aiPrompt || defaultPrompt}
                  </code>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => copyToClipboard(feature.title, 'implementation')}
                    className="w-full flex items-center justify-between p-2 text-left text-sm text-blue-700 hover:bg-blue-100 rounded"
                  >
                    <span>Copy feature title</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(feature.description, 'implementation')}
                    className="w-full flex items-center justify-between p-2 text-left text-sm text-blue-700 hover:bg-blue-100 rounded"
                  >
                    <span>Copy feature description</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(`Priority: ${feature.priority}, Effort: ${feature.effort}, Category: ${feature.category}`, 'implementation')}
                    className="w-full flex items-center justify-between p-2 text-left text-sm text-blue-700 hover:bg-blue-100 rounded"
                  >
                    <span>Copy feature metadata</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
            <button
              onClick={() => copyToClipboard(implementationGuide?.aiPrompt || feature.aiPrompt || defaultPrompt, 'prompt')}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {copiedPrompt ? 'Copied!' : 'Copy AI Prompt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}