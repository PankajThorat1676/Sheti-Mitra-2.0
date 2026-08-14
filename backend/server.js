// =========================================
// SHETI MITRA 2.0
// AI Backend Server
// =========================================

const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
    path: path.join(__dirname, "..", ".env")
});

const app = express();
const PORT = 3000;

// JSON request स्वीकारण्यासाठी
app.use(express.json());


// =========================================
// FRONTEND SERVE
// =========================================

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


// =========================================
// AI CHAT API
// =========================================

app.post("/api/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;

        if (!userMessage) {

            return res.status(400).json({
                success: false,
                reply: "कृपया तुमचा प्रश्न लिहा."
            });

        }


        // =====================================
        // API KEY CHECK
        // =====================================

        if (!process.env.GEMINI_API_KEY) {

            return res.json({
                success: true,
                reply:
                    "🌱 शेती मित्र AI\n\n" +
                    "तुमचा प्रश्न मिळाला आहे:\n\n" +
                    "“" + userMessage + "”\n\n" +
                    "सध्या Gemini API key जोडलेली नाही. " +
                    "API key जोडल्यावर मी तुमच्या प्रश्नाचे " +
                    "AI द्वारे सविस्तर उत्तर देऊ शकतो."
            });

        }


        // =====================================
        // GEMINI AI
        // =====================================

        const { GoogleGenAI } =
            await import("@google/genai");


        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });


        const prompt = `
तुम्ही "शेती मित्र" नावाचे मराठी कृषी सहाय्यक आहात.

शेतकऱ्यांच्या प्रश्नांना सोप्या,
समजण्यासारख्या मराठी भाषेत उत्तर द्या.

कृषीविषयक प्रश्न असल्यास:
- पिकाची काळजी
- रोग व किडी
- खत व्यवस्थापन
- पाणी व्यवस्थापन
- हवामान
- शेतीतील सामान्य उपाय

याबाबत उपयुक्त माहिती द्या.

औषध किंवा रासायनिक फवारणीबाबत
अचूक मात्रा अंदाजाने सांगू नका.
उत्पादनाच्या अधिकृत लेबलनुसार किंवा
कृषी तज्ज्ञांच्या सल्ल्यानुसार वापरण्याचा
सल्ला द्या.

शेतकऱ्याला समजेल अशा पद्धतीने
बुलेट पॉइंटमध्ये उत्तर द्या.

शेतकऱ्याचा प्रश्न:
${userMessage}
`;


        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });


        const answer =
            response.text;


        return res.json({
            success: true,
            reply: answer
        });


    } catch (error) {

        console.error(
            "AI ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            reply:
                "❌ AI शी संपर्क करताना समस्या आली.\n\n" +
                "कृपया काही वेळाने पुन्हा प्रयत्न करा."

        });

    }

});


// =========================================
// SERVER START
// =========================================

app.listen(PORT, () => {

    console.log(
        `🌱 Sheti Mitra 2.0 Server चालू आहे: http://localhost:${PORT}`
    );

});