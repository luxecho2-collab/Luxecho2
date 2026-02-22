/* eslint-disable no-undef */
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello, how are you?");
        console.log("Success with gemini-pro:", result.response.text());
        return genAI; // Return to use in catch if needed, though scope is tricky
    } catch (error) {
        console.error("Error with gemini-pro:", error);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hello, how are you?");
            console.log("Success with gemini-1.5-flash:", result.response.text());
        } catch (err2) {
            console.error("Error with gemini-1.5-flash:", err2);
        }
    }
}

test();
