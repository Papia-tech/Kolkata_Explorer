import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static("."));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `...`; // Keep your existing personality instructions here

app.post("/chat", async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", 
            systemInstruction: SYSTEM_INSTRUCTION
        });
        // ... rest of your chat logic
        const result = await chat.sendMessage(msgParts);
        const text = result.response.text();
        res.json({ reply: text });
    } catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ reply: "Connection error.", error: err.message });
    }
});

// ✅ UPDATED FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Accessible at 0.0.0.0:${PORT}`);
});