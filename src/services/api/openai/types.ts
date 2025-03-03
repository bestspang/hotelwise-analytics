
export interface OpenAIResponse {
  response: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ProcessedDataResult {
  extractedData: any;
  documentType: string | null;
  filename: string;
  notProcessed?: boolean;
  processing?: boolean;
}
