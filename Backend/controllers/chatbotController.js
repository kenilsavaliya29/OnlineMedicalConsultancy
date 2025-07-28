import { GoogleGenerativeAI } from '@google/generative-ai';
import projectContext from '../../Frontend/src/json/projectContext.json' with { type: 'json' };
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// console.log(projectContext);
if (!GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const getRelevantContext = (query, userRole) => {
  const lowerCaseQuery = query.toLowerCase();
  const relevantContext = [];

  projectContext.forEach(item => {
    const titleMatch = item.title.toLowerCase().includes(lowerCaseQuery);
    const descriptionMatch = item.description.toLowerCase().includes(lowerCaseQuery);
    const keywordMatch = item.keywords.some(keyword => lowerCaseQuery.includes(keyword.toLowerCase()));
    const roleMatch = item.roles.includes('all') || item.roles.includes(userRole);

    if ((titleMatch || descriptionMatch || keywordMatch) && roleMatch) {
      relevantContext.push(item);
    }
  });

  return relevantContext.slice(0, 5);
};

export const generateChatResponse = async (req, res) => {
  const { message, user, history } = req.body;
  // console.log(message);

  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  try {
    const userRole = user?.role;
    const relevantContext = getRelevantContext(message, userRole);

    let userDetails = "";
    if (user) {
      userDetails += `The current user is logged in as a ${user.role || 'general'} user.`;
      if (user.name) userDetails += ` Their name is ${user.name}.`;
      if (user.email) userDetails += ` Their email is ${user.email}.`;
      userDetails += `\n\n`;
    }

    let prompt = `You are an AI assistant for a medical consultancy web application. ${userDetails}Provide helpful and concise answers. If appropriate, suggest relevant pages from the application by using the format [Page Title](/page-path). Only suggest links that are present in the provided context. If no relevant context is provided or if a page is not specifically mentioned, do NOT make up URLs or page titles. Do NOT include backend API endpoints.\n\nUser query: "${message}"\n\n`;

    if (relevantContext.length > 0) {
      prompt += "Here is some relevant context from the application's knowledge base:\n\n";
      relevantContext.forEach(context => {
        prompt += `Title: ${context.title}\n`;
        prompt += `Description: ${context.description}\n`;
        if (context.endpoint) {
          prompt += `You can find more details on the [${context.title}](${context.endpoint}) page.\n`;
        }
        prompt += "\n";
      });
    }

    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ success: true, response: text });

  } catch (error) {
    console.error("Error generating chat response:", error);
    res.status(500).json({ success: false, message: "Failed to generate response", error: error.message });
  }
}; 