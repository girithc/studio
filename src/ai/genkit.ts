import { genkit } from 'genkit';
import openai from '@genkit-ai/compat-oai';

export const ai = genkit({
  plugins: [openai({ name: 'openai' })],
  model: 'openai/gpt-5-nano',
});
