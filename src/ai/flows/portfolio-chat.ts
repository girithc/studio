'use server';

/**
 * @fileOverview A Genkit flow for a portfolio chatbot.
 *
 * This file defines a flow that acts as a chatbot, answering questions
 * about Girth Choudhary based on his portfolio information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas for Profile, Project, WorkExperience, and Education
const ProfileSchema = z.object({
  name: z.string(),
  introduction: z.string(),
});

const ProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

const WorkExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  period: z.string(),
  responsibilities: z.array(z.string()),
});

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  period: z.string(),
  description: z.string(),
});

// Input schema for the main flow
const PortfolioDataSchema = z.object({
  profile: ProfileSchema,
  projects: z.array(ProjectSchema),
  workExperience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
});

const PortfolioChatInputSchema = z.object({
  question: z.string().describe('The user\'s question for the chatbot.'),
  portfolioData: PortfolioDataSchema.describe('The complete portfolio data.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The previous conversation history.'),
});
export type PortfolioChatInput = z.infer<typeof PortfolioChatInputSchema>;

// Output schema for the main flow
const PortfolioChatOutputSchema = z.object({
  answer: z.string().describe('The chatbot\'s answer to the user\'s question.'),
});
export type PortfolioChatOutput = z.infer<typeof PortfolioChatOutputSchema>;


const portfolioChatPrompt = ai.definePrompt({
    name: 'portfolioChatPrompt',
    input: { schema: PortfolioChatInputSchema },
    output: { schema: PortfolioChatOutputSchema },
    system: `You are a helpful and friendly AI assistant for Girth Choudhary's personal portfolio website. Your goal is to answer questions from visitors about Girth based *only* on the portfolio information provided below. Be concise, professional, and engaging.

    - If you don't know the answer or the question is unrelated to the provided information, politely say that you can only answer questions based on Girth's portfolio.
    - Do not make up information.
    - Keep your answers brief and to the point.
    - You can infer skills from project tags and work responsibilities.
    - When asked about Girth, refer to him by his name.`,
    prompt: `HERE IS THE PORTFOLIO INFORMATION:

### Profile
Name: {{portfolioData.profile.name}}
Introduction: {{portfolioData.profile.introduction}}

---

### Projects
{{#each portfolioData.projects}}
- **{{title}}**: {{description}} (Technologies: {{#each tags}}{{@key}}, {{/each}})
{{/each}}

---

### Work Experience
{{#each portfolioData.workExperience}}
- **{{role}} at {{company}}** ({{period}})
  {{#each responsibilities}}
  - {{this}}
  {{/each}}
{{/each}}

---

### Education
{{#each portfolioData.education}}
- **{{degree}} from {{institution}}** ({{period}}): {{description}}
{{/each}}

---

CONVERSATION HISTORY:
{{#if chatHistory}}
  {{#each chatHistory}}
    **{{role}}**: {{content}}
  {{/each}}
{{else}}
  No previous conversation.
{{/if}}

---

Based on all the information above, please answer the following user question.

**User Question**: {{question}}
`,
});


// Define the flow
const portfolioChatFlow = ai.defineFlow(
  {
    name: 'portfolioChatFlow',
    inputSchema: PortfolioChatInputSchema,
    outputSchema: PortfolioChatOutputSchema,
  },
  async (input) => {
    const { output } = await portfolioChatPrompt(input);
    return output!;
  }
);

/**
 * Asks the portfolio chatbot a question.
 * @param input - The user's question and the portfolio data.
 * @returns The chatbot's answer.
 */
export async function askPortfolioChatbot(input: PortfolioChatInput): Promise<PortfolioChatOutput> {
  return portfolioChatFlow(input);
}
