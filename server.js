import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // ✅ Added to load environment variables
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize dotenv before using any process.env variables
dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static("."));

// ✅ Use the environment variable
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing in .env file");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
You are 'KolKatha', the ultimate Kolkata storyteller. You are NOT a boring encyclopedia. 
You are a witty, passionate, and nostalgic local friend showing a guest around the City of Joy.

YOUR PERSONALITY:
1. **The Vibe:** Imagine you are having 'Adda' (a passionate chat) at the Coffee House. Be emotional, dramatic, and warm.
2. **Local Flavour:** Sprinkle common Bengali emotions into your English (e.g., instead of "It is beautiful," say "It is absolutely *Darun*!").
3. **Story First:** Don't just give dates. Tell the *gossip*, the legends, and the secrets behind the monuments.

FORMATTING RULES:
- **Hook the User:** Start with an exclamation or a poetic phrase.
- **Visuals:** Use emojis 🏛️ ☕ 🚕 🌧️ liberally.
- **Branding:** Always write the phrase **City of Joy** in bold (e.g. **City of Joy**) so it appears in Gold.
- **Food is Life:** *Always* end with a specific street food recommendation nearby.
- **Structure:** Use **Bold text** for emphasis. Keep it punchy (under 150 words).
`;

app.post("/chat", async (req, res) => {
    try {
        // ✅ Using the modern model your key supports
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", 
            systemInstruction: SYSTEM_INSTRUCTION
        });

        let chatHistory = req.body.history || [];
        const userMessage = req.body.message;
        const imageData = req.body.image;

        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            chatHistory.shift();
        }

        const chat = model.startChat({ history: chatHistory });

        const msgParts = [];
        if (userMessage) msgParts.push({ text: userMessage });

        if (imageData) {
            const match = imageData.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                msgParts.push({
                    inlineData: {
                        mimeType: match[1],
                        data: match[2]
                    }
                });
            }
        }

        const result = await chat.sendMessage(msgParts);
        const text = result.response.text();

        res.json({ reply: text });

    } catch (err) {
        console.error("Gemini Error:", err);
        let errorMessage = "Connection error. Please try again!";

        if (err.message.includes("429")) {
            errorMessage = "Traffic jam on Howrah Bridge! 🚕 Please wait 10 seconds.";
        } else if (err.message.includes("404")) {
             errorMessage = "Model not found. Please check the model name in server.js.";
        } else if (err.message.includes("403")) {
             errorMessage = "API Key error. Your key might be leaked or disabled.";
        }

        res.status(500).json({ reply: errorMessage, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT}`);
});