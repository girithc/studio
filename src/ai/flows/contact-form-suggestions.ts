// contact-form-suggestions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing contact form suggestions.
 *
 * - `getContactFormSuggestions` -  A function that uses AI to suggest what information to include in a contact form based on user profile details.
 * - `ContactFormSuggestionsInput` - The input type for the `getContactFormSuggestions` function.
 * - `ContactFormSuggestionsOutput` - The output type for the `getContactFormSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const ContactFormSuggestionsInputSchema = z.object({
  name: z.string().describe('The user\'s name.'),
  education: z.array(z.string()).describe('A list of the user\'s educational qualifications.'),
  projects: z.array(z.string()).describe('A list of the user\'s projects.'),
  workExperience: z.array(z.string()).describe('A list of the user\'s work experiences.'),
});
export type ContactFormSuggestionsInput = z.infer<typeof ContactFormSuggestionsInputSchema>;

// Define the output schema
const ContactFormSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggestions for what to include in the contact form.'),
});
export type ContactFormSuggestionsOutput = z.infer<typeof ContactFormSuggestionsOutputSchema>;

// Define the tool
const getContactSuggestions = ai.defineTool({
  name: 'getContactSuggestions',
  description: 'Suggests what information to include in a contact form based on the user\'s profile information.',
  inputSchema: ContactFormSuggestionsInputSchema,
  outputSchema: z.array(z.string()).describe('A list of suggestions for contact form information.'),
},
async (input) => {
  // This is where you might call an external API or database to get more information
  // For this example, we'll just return some static suggestions.
  const suggestions = [
    'Email address',
    'LinkedIn profile URL',
    'GitHub profile URL (if applicable)',
    'Portfolio website URL (if applicable)',
    'Phone number (optional)',
  ];
  return suggestions;
});

// Define the prompt
const contactFormSuggestionsPrompt = ai.definePrompt({
  name: 'contactFormSuggestionsPrompt',
  prompt: `Based on the following information about me, what information should I include in my contact form? Give a bulleted list.

My Name: {{name}}
Education: {{#each education}}- {{this}}\n{{/each}}
Projects: {{#each projects}}- {{this}}\n{{/each}}
Work Experience: {{#each workExperience}}- {{this}}\n{{/each}}`,
  input: {schema: ContactFormSuggestionsInputSchema},
  output: {schema: ContactFormSuggestionsOutputSchema},
  tools: [getContactSuggestions],
  system: 'You are helping the user build a contact form. Suggest what information they should include, given their background.',
});

// Define the flow
const contactFormSuggestionsFlow = ai.defineFlow(
  {
    name: 'contactFormSuggestionsFlow',
    inputSchema: ContactFormSuggestionsInputSchema,
    outputSchema: ContactFormSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await contactFormSuggestionsPrompt(input);
    return output!;
  }
);

/**
 * Suggests what information to include in a contact form based on user profile details.
 * @param input - The user's profile information.
 * @returns A list of suggestions for the contact form.
 */
export async function getContactFormSuggestions(input: ContactFormSuggestionsInput): Promise<ContactFormSuggestionsOutput> {
  return contactFormSuggestionsFlow(input);
}

