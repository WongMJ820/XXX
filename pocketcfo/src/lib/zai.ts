import OpenAI from "openai";

const zai = new OpenAI({
  apiKey: process.env.ZAI_API_KEY || "missing-key",
  baseURL: process.env.ZAI_BASE_URL || "https://api.z.ai/api/paas/v4",
});

export default zai;
