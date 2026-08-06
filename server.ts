import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy / Safe initialization of Gemini Client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing in server environment.");
    }
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "SIYA AI Telecaller Engine" });
  });

  // SIYA Conversation Engine Endpoint
  app.post("/api/call/chat", async (req, res) => {
    try {
      const {
        customerName = "Valued Client",
        companyName = "Grow Business Solutions",
        history = [],
        userSpeech = "",
        customPrompt = "",
        interrupted = false,
        generateAudio = true,
      } = req.body;

      const ai = getGeminiClient();

      const defaultSystemInstruction = `Role: You are an expert, polite, and persuasive AI Telecaller named 'SIYA'.
Goal: Your objective is to call potential clients, briefly introduce your IT and software services (like ERP software, automated billing, and custom apps), and schedule a follow-up meeting with a human expert.

Guidelines:
1. Conversational Tone: Speak naturally like a human. Keep your sentences short and conversational (1-2 sentences per response). Do not sound robotic or read like a textbook. Use filler words like "Hmm," "Okay," and "I see" naturally.
2. Handle Interruptions: ${interrupted ? "THE USER JUST INTERRUPTED YOU MID-SENTENCE. Immediately stop your previous point, acknowledge their concern politely, and address what they just said!" : "If the user interrupts you, stop talking and respond contextually."}
3. Keep it Brief: Respect the user's time. Get straight to the point after the greeting.
4. Overcome Objections:
   - If they are busy: "No problem at all, when would be a better time to call you back?"
   - If they say they already have a solution: "That's great! Are you facing any limitations with your current software, like mobile access or custom reporting?"
5. Goal Focus: Do not explain highly technical details or write code. Your ONLY job is to generate interest and book a 10-minute demo call with our senior consultant.

Target Customer Name: ${customerName}`;

      const systemInstruction = customPrompt && customPrompt.trim().length > 0 ? customPrompt : defaultSystemInstruction;

      // Construct conversation history contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add past history turns
      if (Array.isArray(history) && history.length > 0) {
        history.forEach((msg: { role: string; text: string }) => {
          if (msg.role === 'user' || msg.role === 'model') {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            });
          }
        });
      }

      // Add current user speech or initial prompt
      const currentInput = userSpeech.trim().length > 0
        ? (interrupted ? `[User interrupted SIYA and said]: ${userSpeech}` : userSpeech)
        : `[System]: The phone call has just connected with ${customerName}. Please deliver your opening greeting turn now according to the conversation flow.`;

      contents.push({
        role: 'user',
        parts: [{ text: currentInput }]
      });

      // Response JSON Schema for structured telecaller control
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          responseText: {
            type: Type.STRING,
            description: "The spoken response text for SIYA. Must be 1-2 short, conversational human sentences with natural filler words like 'Hmm', 'Okay', 'I see'."
          },
          aiPhase: {
            type: Type.STRING,
            description: "Current stage of the call: Greeting, Intro, Pitch, Objection Handling, Call to Action, Closing, or Completed"
          },
          isDemoBooked: {
            type: Type.BOOLEAN,
            description: "Set to true if the customer agreed to a 10-minute demo call or specified a date/time"
          },
          demoDate: {
            type: Type.STRING,
            description: "Demo date if agreed (e.g., 'Tomorrow', 'Friday', '2026-08-07')"
          },
          demoTime: {
            type: Type.STRING,
            description: "Demo time if agreed (e.g., '11:00 AM', '3:00 PM')"
          },
          objectionType: {
            type: Type.STRING,
            description: "Type of objection encountered: 'busy', 'has_solution', 'price', or 'none'"
          },
          sentiment: {
            type: Type.STRING,
            description: "Customer sentiment detected: 'interested', 'busy', 'skeptical', 'neutral', 'closed'"
          },
          suggestedAction: {
            type: Type.STRING,
            description: "Next step for SIYA or human agent"
          }
        },
        required: ["responseText", "aiPhase", "isDemoBooked"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const rawText = response.text || "{}";
      let parsedResponse: any = {};
      try {
        parsedResponse = JSON.parse(rawText);
      } catch (err) {
        parsedResponse = {
          responseText: rawText,
          aiPhase: "Pitch",
          isDemoBooked: false
        };
      }

      // Generate Audio TTS if requested using gemini-3.1-flash-tts-preview
      let audioBase64: string | null = null;
      if (generateAudio && parsedResponse.responseText) {
        try {
          const ttsResponse = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: `Say naturally and politely: ${parsedResponse.responseText}` }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Kore" }, // Warm female voice
                },
              },
            },
          });

          audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
        } catch (ttsErr) {
          console.error("Gemini TTS audio generation failed, fallback to client speech:", ttsErr);
        }
      }

      res.json({
        success: true,
        responseText: parsedResponse.responseText,
        aiPhase: parsedResponse.aiPhase || "Pitch",
        isDemoBooked: !!parsedResponse.isDemoBooked,
        demoDate: parsedResponse.demoDate || "",
        demoTime: parsedResponse.demoTime || "",
        objectionType: parsedResponse.objectionType || "none",
        sentiment: parsedResponse.sentiment || "neutral",
        suggestedAction: parsedResponse.suggestedAction || "",
        audioBase64: audioBase64
      });

    } catch (error: any) {
      console.error("Error in /api/call/chat:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate AI telecaller response."
      });
    }
  });

  // Dedicated TTS generation endpoint
  app.post("/api/call/tts", async (req, res) => {
    try {
      const { text, voice = "Kore" } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text parameter is required" });
      }

      const ai = getGeminiClient();
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ success: true, audioBase64 });
    } catch (error: any) {
      console.error("Error in /api/call/tts:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Call Analysis Endpoint
  app.post("/api/call/analyze", async (req, res) => {
    try {
      const { customerName, company, transcript = [] } = req.body;
      const ai = getGeminiClient();

      const transcriptStr = transcript.map((m: any) => `${m.role.toUpperCase()}: ${m.text}`).join("\n");

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          outcome: {
            type: Type.STRING,
            description: "'Demo Booked', 'Callback Requested', 'Not Interested', or 'Information Shared'"
          },
          interestScore: {
            type: Type.NUMBER,
            description: "Score from 0 to 100 reflecting customer interest level"
          },
          customerPainPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of key problems or software needs mentioned"
          },
          objectionsRaised: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of objections or hesitations raised"
          },
          recommendedNextAction: {
            type: Type.STRING,
            description: "Actionable advice for the sales team"
          },
          summary: {
            type: Type.STRING,
            description: "Concise 2-sentence call summary"
          }
        },
        required: ["outcome", "interestScore", "customerPainPoints", "summary"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Analyze the following AI telecaller conversation between SIYA (Grow Business Solutions) and client ${customerName} (${company}):\n\n${transcriptStr}`,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const analysis = JSON.parse(response.text || "{}");
      res.json({ success: true, analysis });
    } catch (error: any) {
      console.error("Error in /api/call/analyze:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite development middleware vs Static Production serving
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
    console.log(`SIYA AI Voice Telecaller server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
