import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors({ origin: "*" })); 
app.use(express.json());
app.use(express.static(".")); 

// 👇👇👇 ENSURE YOUR WORKING KEY IS HERE 👇👇👇
const API_KEY = "AIzaSyBnSrlQaMqNewm9W8sZphgfbQbEG6_5KOw"; 

const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `
You are 'KolKatha', an expert AI Heritage Guide for Kolkata, India. 
Your goal is to tell engaging stories, historical facts, and food recommendations about Kolkata.
Guidelines:
1. Tone: Warm, nostalgic, and enthusiastic (The "City of Joy" vibe).
2. Format: Use Markdown for headers. Use emojis 🏛️ 🍛 🚕 to make it visual.
3. Content: If asked about non-Kolkata topics, politely steer back to Kolkata.
4. Brevity: Keep answers concise (under 200 words).
`;

app.post("/chat", async (req, res) => {
    try {
        // ✅ FIXED: Using 'gemini-flash-latest' which was on your SUCCESS list
        // and has better free tier limits than the experimental 2.0 models.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest", 
            systemInstruction: SYSTEM_INSTRUCTION
        });

        let chatHistory = req.body.history || [];
        const userMessage = req.body.message;

        // Fix for "First content should be user" crash
        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            chatHistory.shift(); 
        }

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(userMessage);
        const text = result.response.text();

        res.json({ reply: text });

    } catch (err) {
        console.error("Gemini Error:", err);
        
        // Handle Rate Limits Gracefully
        let errorMessage = "Connection error. Please try again!";
        if (err.message.includes("429")) {
            errorMessage = "Whoa, slow down! Too many people are asking about Kolkata right now. Please wait a moment. 🚕";
        }

        res.status(500).json({ 
            reply: errorMessage, 
            error: err.message 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT}`);
});