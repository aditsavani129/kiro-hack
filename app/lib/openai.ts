// lib/openai.ts
interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }
  
  interface OpenAIResponse {
    choices: {
      message: {
        content: string;
      };
    }[];
  }
  
  export class OpenAIService {
    private apiKey: string;
    private baseURL = 'https://api.openai.com/v1/chat/completions';
  
    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
  
    async generateCompletion(messages: OpenAIMessage[], options = {}) {
      const defaultOptions = {
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
        temperature: 0.7,
        ...options
      };
  
      try {
        const response = await fetch(this.baseURL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...defaultOptions,
            messages,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
  
        const data: OpenAIResponse = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    }
  
    async generateQuestions(projectDescription: string) {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are a helpful assistant that generates relevant context questions for software projects. 
          Generate exactly 5 questions that will help understand the project requirements better. 
          The questions should cover different aspects like business goals, technical requirements, user experience, and constraints.
          
          Return the response as a valid JSON array with objects containing:
          - question: The question text
          - type: The input type (text, textarea, select, radio, checkbox)
          - section: The category (general, technical, business, user_experience)
          - required: Boolean indicating if the question is required
          - placeholder: Optional placeholder text
          
          Example format:
          [
            {
              "question": "What is the primary goal of your project?",
              "type": "textarea",
              "section": "general",
              "required": true,
              "placeholder": "Describe the main objective..."
            }
          ]`
        },
        {
          role: 'user',
          content: `Generate 5 context questions for this project: ${projectDescription}`
        }
      ];
  
      const response = await this.generateCompletion(messages, {
        max_tokens: 800,
        temperature: 0.7
      });
  
      try {
        return JSON.parse(response);
      } catch (error) {
        console.error('Failed to parse questions JSON:', error);
        // Return fallback questions
        return this.getFallbackQuestions();
      }
    }
  
    async generateFeatures(projectDescription: string, contextAnswers: Record<string, string>) {
      const contextText = Object.entries(contextAnswers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
  
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are a helpful assistant that generates software features based on project requirements. 
          Generate 6-8 realistic and relevant features for the given project.
          
          Return the response as a valid JSON array with objects containing:
          - title: Feature name (concise and clear)
          - description: Detailed description of the feature
          - priority: One of "Low", "Medium", "High", "Critical"
          - effort: One of "Small", "Medium", "Large", "XL"
          - category: One of "Core", "Enhancement", "Integration", "UI/UX", "Performance", "Security"
          - acceptanceCriteria: Array of strings describing acceptance criteria
          - technicalNotes: Optional technical implementation notes
          
          Example format:
          [
            {
              "title": "User Authentication",
              "description": "Secure login and registration system with email verification",
              "priority": "High",
              "effort": "Medium",
              "category": "Core",
              "acceptanceCriteria": [
                "Users can register with email and password",
                "Email verification is required",
                "Password reset functionality is available"
              ],
              "technicalNotes": "Consider using JWT tokens for session management"
            }
          ]`
        },
        {
          role: 'user',
          content: `Project Description: ${projectDescription}
  
  Context Information:
  ${contextText}
  
  Generate relevant features for this project. Focus on core functionality first, then enhancement features.`
        }
      ];
  
      const response = await this.generateCompletion(messages, {
        max_tokens: 1500,
        temperature: 0.7
      });
  
      try {
        return JSON.parse(response);
      } catch (error) {
        console.error('Failed to parse features JSON:', error);
        // Return fallback features
        return this.getFallbackFeatures();
      }
    }
  
    async generateUserStories(features: any[], projectDescription: string) {
      const featuresText = features.map(f => `${f.title}: ${f.description}`).join('\n');
  
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are a helpful assistant that generates user stories based on project features.
          Generate user stories in the format "As a [user type], I want [goal] so that [benefit]".
          
          Return the response as a valid JSON array with objects containing:
          - title: Story title
          - asA: The user type
          - iWant: What they want to do
          - soThat: The benefit/reason
          - storyType: One of "end_user", "technical", "epic"
          - priority: One of "Low", "Medium", "High", "Critical"
          - storyPoints: Estimated effort (1, 2, 3, 5, 8, 13)
          - acceptanceCriteria: Array of acceptance criteria
          
          Example format:
          [
            {
              "title": "User Registration",
              "asA": "new user",
              "iWant": "to create an account",
              "soThat": "I can access the application features",
              "storyType": "end_user",
              "priority": "High",
              "storyPoints": 5,
              "acceptanceCriteria": [
                "User can enter email and password",
                "System validates email format",
                "Confirmation email is sent"
              ]
            }
          ]`
        },
        {
          role: 'user',
          content: `Project: ${projectDescription}
  
  Features:
  ${featuresText}
  
  Generate user stories for these features.`
        }
      ];
  
      const response = await this.generateCompletion(messages, {
        max_tokens: 1200,
        temperature: 0.7
      });
  
      try {
        return JSON.parse(response);
      } catch (error) {
        console.error('Failed to parse user stories JSON:', error);
        return [];
      }
    }
  
    async generateTasks(feature: any, projectDescription: string) {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are a helpful assistant that breaks down features into actionable tasks.
          Generate specific, actionable tasks for implementing the given feature.
          
          Return the response as a valid JSON array with objects containing:
          - title: Task title
          - description: Detailed task description
          - status: Always "todo"
          - priority: One of "Low", "Medium", "High", "Critical"
          - effort: One of "Small", "Medium", "Large", "XL"
          - category: One of "Frontend", "Backend", "Database", "Testing", "DevOps", "Design"
          - estimatedHours: Estimated hours to complete
          - dependencies: Array of task titles that must be completed first
          
          Example format:
          [
            {
              "title": "Design login form UI",
              "description": "Create responsive login form with email and password fields",
              "status": "todo",
              "priority": "High",
              "effort": "Small",
              "category": "Frontend",
              "estimatedHours": 4,
              "dependencies": []
            }
          ]`
        },
        {
          role: 'user',
          content: `Project: ${projectDescription}
  
  Feature: ${feature.title}
  Description: ${feature.description}
  
  Generate specific tasks to implement this feature.`
        }
      ];
  
      const response = await this.generateCompletion(messages, {
        max_tokens: 1000,
        temperature: 0.7
      });
  
      try {
        return JSON.parse(response);
      } catch (error) {
        console.error('Failed to parse tasks JSON:', error);
        return [];
      }
    }
  
    private getFallbackQuestions() {
      return [
        {
          question: "What is the primary goal of your project?",
          type: "textarea",
          section: "general",
          required: true,
          placeholder: "Describe the main objective and purpose of your project..."
        },
        {
          question: "Who is your target audience?",
          type: "textarea", 
          section: "business",
          required: true,
          placeholder: "Describe your target users and their characteristics..."
        },
        {
          question: "What platforms will this project support?",
          type: "select",
          section: "technical",
          required: true,
          options: ["Web", "Mobile (iOS)", "Mobile (Android)", "Desktop", "All platforms"]
        },
        {
          question: "What is your estimated budget range?",
          type: "select",
          section: "business",
          required: false,
          options: ["Under $10k", "$10k-$50k", "$50k-$100k", "$100k+", "Not specified"]
        },
        {
          question: "What is your preferred timeline?",
          type: "select",
          section: "business",
          required: false,
          options: ["1-3 months", "3-6 months", "6-12 months", "12+ months", "Flexible"]
        }
      ];
    }
  
    private getFallbackFeatures() {
      return [
        {
          title: "User Authentication",
          description: "Secure login and registration system with email verification and password reset functionality.",
          priority: "High",
          effort: "Medium",
          category: "Core",
          acceptanceCriteria: [
            "Users can register with email and password",
            "Email verification is required before account activation",
            "Password reset functionality via email",
            "Secure session management"
          ],
          technicalNotes: "Consider using JWT tokens and bcrypt for password hashing"
        },
        {
          title: "Dashboard Analytics",
          description: "Real-time analytics dashboard with charts and key performance indicators.",
          priority: "Medium",
          effort: "Large", 
          category: "UI/UX",
          acceptanceCriteria: [
            "Display key metrics in an intuitive layout",
            "Interactive charts and graphs",
            "Real-time data updates",
            "Export functionality for reports"
          ],
          technicalNotes: "Use charting library like Chart.js or D3.js"
        },
        {
          title: "API Integration",
          description: "RESTful API endpoints for seamless data exchange and third-party integrations.",
          priority: "Critical",
          effort: "Large",
          category: "Integration",
          acceptanceCriteria: [
            "RESTful API design following best practices",
            "Comprehensive API documentation",
            "Rate limiting and authentication",
            "Error handling and response codes"
          ],
          technicalNotes: "Consider using OpenAPI/Swagger for documentation"
        },
        {
          title: "Mobile Responsive Design",
          description: "Fully responsive design optimized for mobile devices and tablets.",
          priority: "High",
          effort: "Medium",
          category: "UI/UX",
          acceptanceCriteria: [
            "Responsive layout for all screen sizes",
            "Touch-friendly interface elements",
            "Fast loading on mobile networks",
            "Cross-browser compatibility"
          ],
          technicalNotes: "Use CSS Grid and Flexbox for responsive layouts"
        },
        {
          title: "Data Export",
          description: "Export data in various formats including CSV, PDF, and Excel.",
          priority: "Low",
          effort: "Small",
          category: "Enhancement",
          acceptanceCriteria: [
            "Export data in CSV format",
            "Generate PDF reports",
            "Excel export functionality",
            "Customizable export options"
          ],
          technicalNotes: "Use libraries like jsPDF and SheetJS"
        },
        {
          title: "Security Features",
          description: "Advanced security measures including encryption and audit logs.",
          priority: "Critical",
          effort: "Large",
          category: "Security",
          acceptanceCriteria: [
            "Data encryption at rest and in transit",
            "Comprehensive audit logging",
            "Role-based access control",
            "Regular security vulnerability scans"
          ],
          technicalNotes: "Implement HTTPS, use encryption libraries, and follow OWASP guidelines"
        }
      ];
    }
  }
  
  // Utility function to get OpenAI service instance
  export function getOpenAIService() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    return new OpenAIService(apiKey);
  }