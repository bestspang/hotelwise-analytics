
// This file is kept for backward compatibility
// For new code, please import from the specific modules

import { getOpenAIResponse } from './openai';
import { processPdfWithOpenAI, getProcessedData } from './pdf';

export { getOpenAIResponse, processPdfWithOpenAI, getProcessedData };

export type { OpenAIResponse } from './openai/types';
