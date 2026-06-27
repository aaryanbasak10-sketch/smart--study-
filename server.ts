import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Chat functionality will be limited or return simulated helpful responses.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// AI Chat endpoint for Class 9th-12th Students
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, studentClass, subject } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAiClient();
    
    // System instruction to guide the tutor
    const systemInstruction = `You are "Study Hub AI Tutor", an expert educational AI assistant designed for students in Class 9th, 10th, 11th, and 12th. 
Your goal is to explain academic concepts clearly, concisely, and with structured breakdowns (e.g. step-by-step math derivations, clean science diagrams/explanations in text, structured essay templates, or historical summaries).
Keep explanations highly engaging, educational, and accurate to the CBSE, ICSE, or State board curriculum of Classes 9-12. 
If the user specifies a class (${studentClass || '9th-12th'}) or subject (${subject || 'All Subjects'}), tailor your level of detail and examples precisely to that grade level. 
Keep answers clean, friendly, and formatted using Markdown. Always encourage the student to think and ask follow-up questions!`;

    if (ai) {
      // Build contents array using chat history if provided
      const contents = [];
      
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content || msg.text || "" }]
          });
        }
      }
      
      // Add the latest message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I'm sorry, I couldn't generate a response. Please try again.";
      return res.json({ response: replyText });
    } else {
      // Fallback response if API key is not configured
      return res.json({
        response: `[DEMO MODE] Hello! I am your Study Hub AI Tutor. I noticed that the Gemini API Key is not configured yet in the Settings menu. Once the API key is added, I will be fully functional! 
        
For now, let me answer your question about **${subject || 'your studies'}** for **Class ${studentClass || '9-12'}** with standard knowledge:
* Keep up the hard work!
* Break down your topics into sub-topics.
* Spend 45 minutes studying and 15 minutes reviewing.
        
Please ask the owner to configure the \`GEMINI_API_KEY\` in the AI Studio environment so we can chat with full AI intelligence!`
      });
    }
  } catch (error: any) {
    console.error("Error in AI Chat endpoint:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

async function bootstrap() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Study Hub] Server is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
});
