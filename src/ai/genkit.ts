import {genkit} from 'genkit';
import {openAI} from '@genkit-ai/compat-oai/openai';

const openAIApiKey = process.env.OPENAI_API_KEY;

export const ai = genkit({
  plugins: openAIApiKey ? [openAI({ apiKey: openAIApiKey })] : [],
  ...(openAIApiKey ? { model: 'openai/gpt-4o-mini' } : {}),
});
