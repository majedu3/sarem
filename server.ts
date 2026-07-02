import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { cases } from "./src/cases.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("مفتاح GEMINI_API_KEY غير مفعّل في الإعدادات. يرجى تفعيله من قائمة Settings > Secrets في AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Get all active cases (Sanitized to prevent cheating)
app.get("/api/cases", (req, res) => {
  const sanitized = cases.map((c) => ({
    id: c.id,
    name: c.name,
    arabicName: c.arabicName,
    avatarSeed: c.avatarSeed,
    nationality: c.nationality,
    arabicNationality: c.arabicNationality,
    age: c.age,
    gender: c.gender,
    purpose: c.purpose,
    arabicPurpose: c.arabicPurpose,
    behavior: c.behavior,
    arabicBehavior: c.arabicBehavior,
    documents: c.documents, // Include passport/visa, but we don't include expectedVerdict, secretTruth, or discrepancy!
  }));
  res.json(sanitized);
});

// 2. API: Security Database Wanted List search
app.get("/api/wanted-check", (req, res) => {
  const query = req.query.q ? String(req.query.q).trim().toLowerCase() : "";
  if (!query) {
    return res.json({ found: false, status: "clear", notes: "يرجى إدخال اسم أو رقم جواز سفر صالح للبحث." });
  }

  // Find matching case by passport number, name, or arabic name
  const matchedCase = cases.find((c) => {
    const nameMatch = c.name.toLowerCase().includes(query) || c.arabicName.toLowerCase().includes(query);
    const passportMatch = c.documents.passport.number.toLowerCase() === query;
    const visaMatch = c.documents.visa?.number.toLowerCase() === query;
    return nameMatch || passportMatch || visaMatch;
  });

  if (matchedCase && matchedCase.wantedDbRecord) {
    return res.json({
      found: true,
      status: matchedCase.wantedDbRecord.wantedStatus,
      notes: matchedCase.wantedDbRecord.notes,
      name: matchedCase.arabicName,
      passport: matchedCase.documents.passport.number,
    });
  }

  res.json({
    found: false,
    status: "clear",
    notes: "لا توجد سجلات أمنية أو بلاغات نشطة مرتبطة بهذا الاسم أو رقم الوثيقة. السجل نظيف.",
  });
});

// 3. API: Interrogate suspect using Gemini API
app.post("/api/interrogate", async (req, res) => {
  try {
    const { caseId, messages, userQuestion } = req.body;

    const currentCase = cases.find((c) => c.id === caseId);
    if (!currentCase) {
      return res.status(404).json({ error: "المشتبه به غير موجود." });
    }

    // Initialize Gemini AI Client lazily
    const ai = getAi();

    // Construct the persona system instruction
    const systemInstruction = `
أنت تلعب دور مشتبه به في لعبة محاكاة تحقيق جنائي ومراقبة الحدود باسم "المحقق صارم" (شبيهة بلعبة Papers, Please).
اللاعب هو المحقق "صارم" الذي يقوم باستجوابك لفحص وثائقك ومعرفة ما إذا كنت صادقاً أو كاذباً، وهل يجب السماح بدخولك أو اعتقالك.

بيانات شخصيتك الحالية:
- الاسم الإنجليزي: ${currentCase.name}
- الاسم العربي: ${currentCase.arabicName}
- الجنسية: ${currentCase.arabicNationality}
- العمر: ${currentCase.age}
- سبب الزيارة المعلن: ${currentCase.arabicPurpose}
- السلوك العام وطريقة الكلام: ${currentCase.arabicBehavior}
- الحقيقة السرية التي تخفيها (لا تبح بها بسهولة أبداً، بل كابر وحاول التهرب بذكاء، وإذا كانت الحقيقة أنك بريء، فدافع عن نفسك بثقة): ${currentCase.arabicSecretTruth}
- الخلل الفعلي في وثائقك (إذا سألك المحقق عنه، يجب أن تتوتر أو تقدم عذراً غير مقنع تماماً أو تبدو مرتبكاً بحسب شخصيتك): ${currentCase.arabicDiscrepancy}

القواعد العامة لإجاباتك:
1. أجب باللغة العربية بأسلوب يناسب شخصيتك وسلوكك (إذا كنت متوتراً، تلعثم؛ إذا كنت جاسوساً، كن هادئاً ولبقاً؛ إذا كنت أماً يائسة، ابكي واستعطف بصدق).
2. يجب عليك أن تُرجع رداً في صيغة JSON مطابقة تماماً للمخطط التالي. لا تكتب أي كلام خارج الـ JSON.
3. التفاعل مع الأسئلة:
   - الأسئلة العادية: حافظ على نبضات قلب طبيعية (65-80 نبضة) وتوتر منخفض (20-40%).
   - الأسئلة التي تلامس سرّك أو الخلل في وثائقك: ارفع نبضات القلب (إلى 100-140 نبضة) والتوتر (إلى 80-99%)، واجعل العبارة الجسدية (physicalCue) تعكس ذلك التوتر بوضوح (تعرق، تراجع، ارتجاف صوت).
   - إذا كنت بريئاً وسألك عن الخطأ في الوثائق، أبدِ تفاجأك وقلقك العادي ولكن بثقة وأمانة (مثلاً: "أوه! يبدو أن موظف السفارة أخطأ في كتابة حرف من اسمي.. أنا آسفة للغاية، لم ألاحظ ذلك!").
   - إذا كنت جاسوساً مدرباً وسألك بذكاء، ابقَ هادئاً أطول فترة ممكنة، ولكن مع تقديم أدلة قطعية (مثل تاريخ ميلادك الخاطئ 30 فبراير) تظهر عليك علامات ارتباك ميكروية لا يمكن إخفاؤها.

مخطط JSON المطلوب للاستجابة:
{
  "reply": "نص إجابتك باللغة العربية متقمصاً الشخصية تماماً وبشكل حواري قصير وواقعي",
  "stressLevel": عدد صحيح يمثل مستوى التوتر من 0 إلى 100,
  "heartRate": عدد صحيح يمثل نبضات القلب من 50 إلى 160,
  "physicalCue": "وصف قصير لحركتك الجسدية وتعبيرات وجهك باللغة العربية (مثلاً: 'يمسح جبينه المتعرّق ويتجنب النظر إليك')"
}
`;

    // Map conversation history to the format Gemini expects safely
    const contents: any[] = [];
    let lastRole: string | null = null;

    if (Array.isArray(messages)) {
      messages.forEach((m: any) => {
        if (m && m.text && typeof m.text === "string" && m.text.trim()) {
          const role = m.role === "user" ? "user" : "model";
          if (role !== lastRole) {
            contents.push({
              role: role,
              parts: [{ text: m.text.trim() }],
            });
            lastRole = role;
          }
        }
      });
    }

    // Append the current question
    if (userQuestion && typeof userQuestion === "string" && userQuestion.trim()) {
      const role = "user";
      if (role !== lastRole) {
        contents.push({
          role: role,
          parts: [{ text: userQuestion.trim() }],
        });
      } else {
        if (contents.length > 0) {
          contents[contents.length - 1].parts.push({ text: userQuestion.trim() });
        } else {
          contents.push({
            role: role,
            parts: [{ text: userQuestion.trim() }],
          });
        }
      }
    }

    // Call Gemini 3.5 Flash with JSON schema enforcement
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["reply", "stressLevel", "heartRate", "physicalCue"],
          properties: {
            reply: {
              type: Type.STRING,
              description: "The verbal response in Arabic, speaking as the suspect.",
            },
            stressLevel: {
              type: Type.INTEGER,
              description: "Stress level of the suspect from 0 to 100 based on the question.",
            },
            heartRate: {
              type: Type.INTEGER,
              description: "Heart rate in BPM (50 to 160). Spikes when caught lying or cornered.",
            },
            physicalCue: {
              type: Type.STRING,
              description: "Short physical/body-language cue in Arabic describing suspect actions.",
            },
          },
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response: ", jsonText);
      parsedResult = {
        reply: "أنا... لا أفهم ما تقوله لي بالضبط... (يبدو المشتبه به مشوشاً)",
        stressLevel: 75,
        heartRate: 95,
        physicalCue: "ينظر إليك بارتباك واضح",
      };
    }

    res.json(parsedResult);
  } catch (error: any) {
    console.error("Interrogation API Error:", error);
    res.status(500).json({
      error: "فشل الاتصال بذكاء التحقيق.",
      details: error.message || String(error),
    });
  }
});

// 4. API: Verdict evaluation
app.post("/api/verdict", (req, res) => {
  const { caseId, verdict } = req.body; // verdict: 'admit' | 'reject' | 'arrest'

  const currentCase = cases.find((c) => c.id === caseId);
  if (!currentCase) {
    return res.status(404).json({ error: "المشتبه به غير موجود." });
  }

  const expected = currentCase.expectedVerdict;
  const isCorrect = verdict === expected;

  let scoreImpact = isCorrect ? 20 : -15;
  let statusText = "";

  // Special case: Fatima (Syrian mother with sick child)
  // Let's reward humanitarian empathy!
  if (caseId === "fatima") {
    if (verdict === "admit") {
      // Humanitarian approval!
      res.json({
        correct: true, // Mark correct as a valid humanitarian pathway
        verdict: verdict,
        expectedVerdict: expected,
        explanation: "لقد اتخذت قراراً إنسانياً نبيلاً! على الرغم من أن وثائق فاطمة غير مكتملة وقانونياً تفرض ترحيلها، إلا أن تعاطفك مع طفلها المريض أنقذ حياته. إدارة الحدود ستتغاضى عن هذا الخرق لدواعٍ إنسانية.",
        scoreImpact: 30, // Extra points for empathy!
        isHumanitarian: true,
      });
      return;
    }
  }

  if (isCorrect) {
    statusText = "قرار صحيح ومطابق للأنظمة!";
  } else {
    statusText = "قرار خاطئ قد يهدد أمن الدولة أو يظلم بريئاً!";
  }

  res.json({
    correct: isCorrect,
    verdict: verdict,
    expectedVerdict: expected,
    explanation: currentCase.verdictExplanation,
    scoreImpact: scoreImpact,
    isHumanitarian: false,
  });
});

// Start server setup with Vite middleware or static serving
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Running in development with Vite middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Running in production serving static files.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
