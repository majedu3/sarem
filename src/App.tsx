import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { SuspectAvatar } from "./components/SuspectAvatar";
import {
  Shield,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Volume2,
  VolumeX,
  HelpCircle,
  RefreshCw,
  Heart,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Info,
  Database,
  Lock,
  Stamp,
  ArrowLeft
} from "lucide-react";

interface Passport {
  number: string;
  expiryDate: string;
  birthDate: string;
  birthPlace: string;
  fullName: string;
}

interface Visa {
  number: string;
  expiryDate: string;
  fullName: string;
  visaType: string;
}

interface CustomDoc {
  title: string;
  content: string;
}

interface Suspect {
  id: string;
  name: string;
  arabicName: string;
  avatarSeed: string;
  nationality: string;
  arabicNationality: string;
  age: number;
  gender: "male" | "female";
  purpose: string;
  arabicPurpose: string;
  behavior: string;
  arabicBehavior: string;
  documents: {
    passport: Passport;
    visa?: Visa;
    customDoc?: CustomDoc;
  };
}

interface InterrogationMessage {
  role: "user" | "model";
  text: string;
  physicalCue?: string;
}

interface DBResult {
  found: boolean;
  status: "clear" | "warning" | "wanted";
  notes: string;
  name?: string;
  passport?: string;
}

interface VerdictResult {
  correct: boolean;
  verdict: "admit" | "reject" | "arrest";
  expectedVerdict: "admit" | "reject" | "arrest";
  explanation: string;
  scoreImpact: number;
  isHumanitarian?: boolean;
}

export default function App() {
  // Game state
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [loadingSuspects, setLoadingSuspects] = useState(true);

  // Stats
  const [score, setScore] = useState(100);
  const [processedCount, setProcessedCount] = useState(0);
  const [correctDecisions, setCorrectDecisions] = useState(0);
  const [processedIds, setProcessedIds] = useState<Record<string, { verdict: string; isCorrect: boolean }>>({});

  // Chat/Interrogation State
  const [messages, setMessages] = useState<InterrogationMessage[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isInterrogating, setIsInterrogating] = useState(false);
  const [stressLevel, setStressLevel] = useState(15);
  const [heartRate, setHeartRate] = useState(72);
  const [physicalCue, setPhysicalCue] = useState("يقف أمامك بهدوء وينتظر إشارتك لبدء التحقيق.");

  // Database tool
  const [dbSearchQuery, setDbSearchQuery] = useState("");
  const [dbResult, setDbResult] = useState<DBResult | null>(null);
  const [searchingDb, setSearchingDb] = useState(false);

  // Active workspace doc tab ('passport' | 'visa' | 'custom' | 'database')
  const [activeDocTab, setActiveDocTab] = useState<"passport" | "visa" | "custom" | "database">("passport");

  // Feedback modal after making a decision
  const [verdictResult, setVerdictResult] = useState<VerdictResult | null>(null);
  const [showVerdictModal, setShowVerdictModal] = useState(false);

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(true);

  // Sound Synth Helper
  const playSound = (type: "beep" | "stamp" | "alert" | "click" | "success" | "fail") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "beep") {
        osc.type = "square";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "alert") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "stamp") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "success") {
        // Arpeggio
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "fail") {
        // Low buzzer
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, ctx.currentTime); // A2
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio Context is blocked or not supported on this browser.");
    }
  };

  // Fetch all suspects
  const fetchSuspects = async () => {
    setLoadingSuspects(true);
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setSuspects(data);
        if (data.length > 0) {
          // Select first non-processed suspect by default
          const firstUnprocessed = data.find((s: Suspect) => !processedIds[s.id]);
          setSelectedSuspect(firstUnprocessed || data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching suspects:", error);
    } finally {
      setLoadingSuspects(false);
    }
  };

  useEffect(() => {
    fetchSuspects();
  }, []);

  // Update suspect defaults upon change
  useEffect(() => {
    if (selectedSuspect) {
      setMessages([
        {
          role: "model",
          text: `مرحباً أيها الضابط. اسمي ${selectedSuspect.arabicName}، وجئت إلى هنا بغرض ${selectedSuspect.arabicPurpose}. تفضل بوثائقي الرسمية لفحصها.`,
          physicalCue: "يقف بانتظارك، يمد يديه بالوثائق ويبدو هادئاً نسبياً."
        }
      ]);
      setStressLevel(15);
      setHeartRate(70 + Math.floor(Math.random() * 8));
      setPhysicalCue(selectedSuspect.arabicBehavior.split("،")[0] || "ينتظر استجوابك.");
      setDbResult(null);
      setDbSearchQuery(selectedSuspect.documents.passport.number);
      setActiveDocTab("passport");
    }
  }, [selectedSuspect]);

  // Handle preset tactical questions
  const askPresetQuestion = async (questionText: string) => {
    if (!selectedSuspect || isInterrogating) return;
    playSound("click");
    await submitQuestion(questionText);
  };

  // Common Question Submitter
  const submitQuestion = async (questionText: string) => {
    if (!selectedSuspect || !questionText.trim()) return;

    setIsInterrogating(true);
    const updatedMessages = [...messages, { role: "user", text: questionText } as InterrogationMessage];
    setMessages(updatedMessages);
    setCustomQuestion("");

    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedSuspect.id,
          messages: messages.map(m => ({ role: m.role, text: m.text })),
          userQuestion: questionText
        })
      });

      if (res.ok) {
        const replyData = await res.json();
        const safeReply = replyData.reply || "أنا... لا أدري ماذا أقول. (يبدو المشتبه به صامتاً)";
        const safePhysicalCue = replyData.physicalCue || "ينظر إليك بتردد ويتجنب الإجابة.";
        
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            text: safeReply,
            physicalCue: safePhysicalCue
          }
        ]);
        setStressLevel(typeof replyData.stressLevel === "number" ? replyData.stressLevel : 50);
        setHeartRate(typeof replyData.heartRate === "number" ? replyData.heartRate : 80);
        setPhysicalCue(safePhysicalCue);
        playSound("beep");
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            text: errData.error || "آسف، حدث انقطاع في الاتصال مع جهاز التحقيق اللحظي.",
            physicalCue: "تومض الشاشة باللون الأحمر مرتين"
          }
        ]);
        playSound("alert");
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: "فشل الاتصال بذكاء الاستجواب. يرجى التحقق من توفير مفتاح API وصحة الخادم.",
          physicalCue: "يصدر جهاز التحقيق صوتاً متقطعاً"
        }
      ]);
      playSound("alert");
    } finally {
      setIsInterrogating(false);
    }
  };

  // Query Security Database
  const searchDatabase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dbSearchQuery.trim()) return;
    setSearchingDb(true);
    playSound("click");
    try {
      const res = await fetch(`/api/wanted-check?q=${encodeURIComponent(dbSearchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setDbResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingDb(false);
    }
  };

  // Submit verdict decision (Stamps)
  const handleVerdict = async (verdictType: "admit" | "reject" | "arrest") => {
    if (!selectedSuspect) return;
    playSound("stamp");
    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedSuspect.id,
          verdict: verdictType
        })
      });

      if (res.ok) {
        const result: VerdictResult = await res.json();
        setVerdictResult(result);

        // Update local stats
        setScore(prev => Math.max(0, prev + result.scoreImpact));
        setProcessedCount(prev => prev + 1);
        if (result.correct) {
          setCorrectDecisions(prev => prev + 1);
          playSound("success");
        } else {
          playSound("fail");
        }

        // Add to processed registry to track progress/status in UI list
        setProcessedIds(prev => ({
          ...prev,
          [selectedSuspect.id]: {
            verdict: verdictType,
            isCorrect: result.correct
          }
        }));

        setShowVerdictModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load next suspect from queue
  const loadNextSuspect = () => {
    setShowVerdictModal(false);
    setVerdictResult(null);

    // Find next unprocessed suspect
    const nextUnprocessed = suspects.find(s => !processedIds[s.id]);
    if (nextUnprocessed) {
      setSelectedSuspect(nextUnprocessed);
    } else {
      // Loop or allow resetting/inspecting again
      const firstS = suspects[0] || null;
      if (firstS) setSelectedSuspect(firstS);
    }
  };

  // Reset entire session
  const resetSession = () => {
    playSound("click");
    setScore(100);
    setProcessedCount(0);
    setCorrectDecisions(0);
    setProcessedIds({});
    setShowVerdictModal(false);
    setVerdictResult(null);
    fetchSuspects();
  };

  // Active documents helper
  const hasVisa = selectedSuspect?.documents.visa !== undefined;
  const hasCustomDoc = selectedSuspect?.documents.customDoc !== undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white" dir="rtl">
      {/* HEADER BAR */}
      <header id="game-header" className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-600 to-amber-500 p-2 rounded-xl shadow-inner text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-l from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                لعبة المحقق صارم <span className="text-xs font-mono font-normal text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">نسخة الذكاء الاصطناعي</span>
              </h1>
              <p className="text-xs text-slate-400">بوابة العبور الحدودية - دقق بالوثائق واستجوب بذكاء</p>
            </div>
          </div>

          {/* AUDIO & HELP CONTROLS */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => { playSound("click"); setShowTutorial(!showTutorial); }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title="تعليمات اللعب"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title={soundEnabled ? "كتم الأصوات" : "تفعيل الأصوات"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>

            <button
              onClick={resetSession}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-200 text-slate-300 transition-colors border border-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة تهيئة اللعبة
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD STATUS ROW */}
      <section id="game-status-bar" className="bg-slate-900/40 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 md:gap-8 items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400">حالة البوابة:</span>
              <span className="text-slate-200 font-bold text-xs">نشط وجاهز</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span>التوقيت المحلي:</span>
              <span className="text-slate-200 font-bold">2026-07-02</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>النقاط (ميزانية الأمن):</span>
              <span className={`font-bold text-sm ${score >= 100 ? "text-emerald-400" : score > 50 ? "text-amber-400" : "text-rose-500"}`}>
                {score} نقطة
              </span>
            </div>

            <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-500" />
              <span>الدقة الإدارية:</span>
              <span className="text-slate-200 font-bold text-sm">
                {processedCount > 0 ? `${Math.round((correctDecisions / processedCount) * 100)}%` : "0%"}
              </span>
              <span className="text-[10px] text-slate-500">({correctDecisions}/{processedCount})</span>
            </div>
          </div>
        </div>
      </section>

      {/* TUTORIAL / INSTRUCTIONS PANEL */}
      {showTutorial && (
        <section id="game-tutorial" className="bg-gradient-to-r from-rose-950/20 via-slate-900/60 to-emerald-950/20 border-b border-rose-500/20 px-4 py-4 relative">
          <button
            onClick={() => { playSound("click"); setShowTutorial(false); }}
            className="absolute top-3 left-3 text-slate-400 hover:text-white text-xs font-mono bg-slate-950/80 px-2 py-1 rounded border border-slate-800"
          >
            إخفاء [X]
          </button>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              دليل عمل المحقق صارم (المرجع السريع للضابط)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-rose-400 block mb-1">1. ابحث عن الخلل والتناقض</span>
                افحص الوثائق بعناية: هل تاريخ انتهاء جواز السفر صحيح؟ هل هناك خطأ في الاسم بالتأشيرة؟ هل هناك تاريخ ميلاد مستحيل كـ (30 فبراير)؟
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-amber-400 block mb-1">2. استجوب بذكاء</span>
                اضغط على الأسئلة السريعة أو اكتب أسئلة حرة في صندوق الاستجواب. الذكاء الاصطناعي سيتقمص الشخصية ويجيب بدقة. راقب نبضات قلبه وتوتره!
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-emerald-400 block mb-1">3. اتخذ قرارك الصارم</span>
                هل تسمح بالدخول؟ أم ترفض بسبب خلل إداري؟ أم تعتقل فوراً للاشتباه بجناية أو تهريب؟ قراراتك تؤثر على ميزانيتك وعلى سلامة الدولة!
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: SUSPECT QUEUE & SUSPECT PROFILE (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* QUEUE OF WAITING SUSPECTS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
            <h2 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase font-mono">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              طابور الوافدين المنتظرين
            </h2>

            {loadingSuspects ? (
              <div className="py-6 text-center text-slate-500 text-xs animate-pulse">
                جاري إعداد قائمة المشتبه بهم...
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {suspects.map((suspect) => {
                  const isSelected = selectedSuspect?.id === suspect.id;
                  const record = processedIds[suspect.id];
                  return (
                    <button
                      key={suspect.id}
                      onClick={() => { playSound("click"); setSelectedSuspect(suspect); }}
                      className={`w-full text-right p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-rose-950/40 border-rose-500 text-white shadow"
                          : "bg-slate-950 hover:bg-slate-900/60 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Status Icon Indicator */}
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          record 
                            ? record.isCorrect 
                              ? "bg-emerald-500" 
                              : "bg-rose-500"
                            : "bg-amber-400 animate-pulse"
                        }`} />
                        <div className="text-right">
                          <div className="font-semibold text-xs">{suspect.arabicName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {suspect.arabicNationality} • {suspect.age} عاماً
                          </div>
                        </div>
                      </div>

                      {/* Display stamp result on suspects if resolved */}
                      {record ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          record.verdict === "admit" 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : record.verdict === "reject"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : "bg-rose-950 text-rose-400 border border-rose-800"
                        }`}>
                          {record.verdict === "admit" ? "مقبول" : record.verdict === "reject" ? "مرفوض" : "معتقل"}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVE SUSPECT SUMMARY DETAILS */}
          {selectedSuspect && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl" />
              
              {/* STRESS HEARTBEAT ANIMATION */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono tracking-wide text-slate-400 flex items-center gap-1.5 uppercase">
                  <Shield className="w-3.5 h-3.5 text-rose-500" />
                  غرفة الاستجواب النشطة
                </span>
                
                {/* Simulated Heartbeat Line */}
                <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                  <Heart className={`w-3.5 h-3.5 text-rose-500 ${heartRate > 95 ? "animate-bounce" : "animate-pulse"}`} />
                  <span className="text-[11px] font-mono font-bold text-rose-400">{heartRate} BPM</span>
                </div>
              </div>

              {/* Avatar Component */}
              <SuspectAvatar
                seed={selectedSuspect.avatarSeed}
                stressLevel={stressLevel}
                gender={selectedSuspect.gender}
              />

              {/* BIO INFO */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">الاسم بالكامل:</span>
                  <span className="text-slate-200 font-bold">{selectedSuspect.arabicName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">الجنسية:</span>
                  <span className="text-slate-300 font-semibold">{selectedSuspect.arabicNationality}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">العمر / الجنس:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {selectedSuspect.age} سنة • {selectedSuspect.gender === "male" ? "ذكر" : "أنثى"}
                  </span>
                </div>
                <div className="flex justify-between items-start text-xs gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-500 shrink-0">سبب الزيارة:</span>
                  <span className="text-slate-300 text-left text-[11px] leading-relaxed">{selectedSuspect.arabicPurpose}</span>
                </div>
                <div className="flex justify-between items-start text-xs gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-500 shrink-0">السلوك والمظهر:</span>
                  <span className="text-slate-300 text-left text-[11px] leading-relaxed">{selectedSuspect.arabicBehavior}</span>
                </div>
              </div>

              {/* Pulse Rate Chart Canvas Simulation */}
              <div className="h-9 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]" />
                <svg viewBox="0 0 100 20" className="w-full h-full text-rose-500" preserveAspectRatio="none">
                  <motion.path
                    d={`M 0 10 Q 15 10 20 ${stressLevel > 75 ? "2" : "6"} T 25 10 T 30 10 Q 45 10 50 ${stressLevel > 75 ? "18" : "14"} T 55 10 T 60 10 Q 75 10 80 ${stressLevel > 50 ? "1" : "5"} T 85 10 Q 95 10 100 10`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    animate={{
                      pathLength: [0, 1],
                      pathOffset: [0, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: stressLevel > 75 ? 0.6 : stressLevel > 50 ? 1.2 : 2.2,
                      ease: "linear"
                    }}
                  />
                </svg>
                <div className="absolute top-1 left-2 text-[8px] font-mono text-slate-500">مقياس نبضات استشعار التوتر الذكي</div>
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE & RIGHT COLUMNS: DOCS DESK & TERMINAL (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* TOP TABS: WORKSPACE SELECTOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap gap-2">
            <button
              onClick={() => { playSound("click"); setActiveDocTab("passport"); }}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeDocTab === "passport"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-950/40"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              جواز السفر
            </button>

            <button
              onClick={() => { playSound("click"); setActiveDocTab("visa"); }}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative ${
                activeDocTab === "visa"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-950/40"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              تأشيرة الدخول
              {!hasVisa && <Lock className="w-3 h-3 text-slate-600 absolute top-1 left-1" />}
            </button>

            <button
              onClick={() => { playSound("click"); setActiveDocTab("custom"); }}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative ${
                activeDocTab === "custom"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-950/40"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              وثائق مرافقة
              {!hasCustomDoc && <Lock className="w-3 h-3 text-slate-600 absolute top-1 left-1" />}
            </button>

            <button
              onClick={() => { playSound("click"); setActiveDocTab("database"); }}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeDocTab === "database"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-950/40"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-4 h-4" />
              قاعدة البيانات الأمنية
            </button>
          </div>

          {/* DOCUMENT DETAILS DISPLAY AREA */}
          <div id="desk-workspace" className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[220px] flex flex-col justify-between relative shadow-inner">
            
            {/* 1. PASSPORT TAB */}
            {activeDocTab === "passport" && selectedSuspect && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-sm text-slate-200">جواز سفر رسمي جمهوري</span>
                  </div>
                  <span className="font-mono text-xs text-slate-500">رقم الوثيقة: {selectedSuspect.documents.passport.number}</span>
                </div>

                {/* Passport Visual Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">الاسم الكامل (جواز السفر):</span>
                      <span className="text-slate-200 font-bold text-sm">{selectedSuspect.documents.passport.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">مكان وتاريخ الميلاد:</span>
                      <span className="text-slate-300 font-semibold">
                        {selectedSuspect.documents.passport.birthPlace} • {selectedSuspect.documents.passport.birthDate}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2 text-xs flex flex-col justify-between">
                    <div>
                      <span className="text-slate-500 block">صلاحية الجواز (حتى):</span>
                      <span className={`font-mono font-bold ${
                        // Check if expired compared to 2026-07-02
                        new Date(selectedSuspect.documents.passport.expiryDate) < new Date("2026-07-02")
                          ? "text-rose-500 animate-pulse underline decoration-wavy"
                          : "text-emerald-400"
                      }`}>
                        {selectedSuspect.documents.passport.expiryDate} 
                        {new Date(selectedSuspect.documents.passport.expiryDate) < new Date("2026-07-02") && " (منتهي الصلاحية!)"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-900 p-2 rounded border border-slate-800">
                      * ملاحظة: يجب مطابقة الاسم مع وثيقة التأشيرة والتحقق من تاريخ الانتهاء مقارنة باليوم الحالي (2026-07-02).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. VISA TAB */}
            {activeDocTab === "visa" && selectedSuspect && (
              <div>
                {hasVisa ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-sm text-slate-200">تأشيرة دخول إلكترونية</span>
                      </div>
                      <span className="font-mono text-xs text-slate-500">رقم التأشيرة: {selectedSuspect.documents.visa?.number}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">الاسم الكامل المدون بالتأشيرة:</span>
                          <span className="text-slate-200 font-bold text-sm">
                            {selectedSuspect.documents.visa?.fullName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">نوع التأشيرة:</span>
                          <span className="text-slate-300 font-semibold">{selectedSuspect.documents.visa?.visaType}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2 text-xs flex flex-col justify-between">
                        <div>
                          <span className="text-slate-500 block">صالحة للعبور حتى:</span>
                          <span className="text-slate-300 font-mono font-bold">
                            {selectedSuspect.documents.visa?.expiryDate}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 bg-slate-900 p-2 rounded border border-slate-800">
                          * تنبيه للضابط: تأكد من خلو التأشيرة من الأخطاء الإملائية والطباعية الطفيفة مقارنة بجواز السفر.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto animate-bounce" />
                    <p className="text-sm font-bold text-slate-300">لا توجد تأشيرة دخول مرافقة!</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      المشتبه به لا يحمل تأشيرة دخول رسمية. يرجى استجوابه بخصوص هذا الخرق الأمني أو فحص حالته الإنسانية لتحديد قرار الرفض أو الاعتقال.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. CUSTOM DOC TAB */}
            {activeDocTab === "custom" && selectedSuspect && (
              <div>
                {hasCustomDoc ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <span className="font-bold text-sm text-slate-200">
                          {selectedSuspect.documents.customDoc?.title}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs leading-relaxed text-slate-300">
                      <p className="whitespace-pre-line text-left">{selectedSuspect.documents.customDoc?.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-400">لا توجد وثائق إضافية مرافقة</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      هذا الشخص لم يقدم أي خطابات دعوة أو وثائق طبية إضافية مرافقة لطلب العبور.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 4. SECURITY DATABASE TAB */}
            {activeDocTab === "database" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-rose-500" />
                    <span className="font-bold text-sm text-slate-200">سجل البحث والاستعلام الأمني الفدرالي</span>
                  </div>
                  <span className="text-[10px] bg-rose-950/60 text-rose-400 px-2 py-0.5 rounded border border-rose-800/60 font-mono">
                    سرّي للغاية • للضباط فقط
                  </span>
                </div>

                <form onSubmit={searchDatabase} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    <input
                      type="text"
                      placeholder="ابحث بالاسم الكامل للمشتبه به أو رقم وثيقة جواز السفر..."
                      value={dbSearchQuery}
                      onChange={(e) => setDbSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pr-10 pl-3 text-xs focus:outline-none focus:border-rose-500 text-slate-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchingDb}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2"
                  >
                    {searchingDb ? "جاري البحث..." : "استعلام"}
                  </button>
                </form>

                {dbResult ? (
                  <div className={`p-4 rounded-lg border text-xs space-y-2 ${
                    dbResult.status === "wanted"
                      ? "bg-rose-950/40 border-rose-800 text-rose-200"
                      : dbResult.status === "warning"
                      ? "bg-amber-950/40 border-amber-800 text-amber-200"
                      : "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        حالة السجل: {dbResult.status === "wanted" ? "مطلوب فوراً للعدالة!" : dbResult.status === "warning" ? "تحذير أمني نشط" : "سجل نظيف"}
                      </span>
                      {dbResult.name && <span className="font-mono text-slate-300">{dbResult.name} ({dbResult.passport})</span>}
                    </div>
                    <p className="text-left font-sans leading-relaxed">{dbResult.notes}</p>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-xs text-slate-400 flex items-center gap-3">
                    <Info className="w-5 h-5 text-slate-500 shrink-0" />
                    <p>
                      أدخل معلومات المشتبه به في الخانة أعلاه للاستعلام عن السجل الجنائي وبلاغات السرقة وقائمة المراقبة الفدرالية قبل اتخاذ القرار النهائي بختم الوثيقة.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INTERROGATION CHAT & CONVERSATION ROOM */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
            
            {/* Chat header showing physical behavior */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400">لغة الجسد الحالية للمشتبه به:</span>
              <span className="text-xs font-semibold text-rose-400 font-sans italic">
                * {physicalCue} *
              </span>
            </div>

            {/* Conversation Log */}
            <div className="h-48 overflow-y-auto bg-slate-950 rounded-lg p-3 border border-slate-800 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] ${
                    m.role === "user" ? "self-start text-right" : "self-end text-left"
                  }`}
                >
                  <div className="text-[10px] text-slate-500 mb-0.5 font-mono">
                    {m.role === "user" ? "المحقق صارم" : selectedSuspect?.arabicName}
                  </div>
                  <div
                    className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-slate-800 text-slate-200 rounded-tr-none"
                        : "bg-rose-950/30 text-rose-100 border border-rose-900/60 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.physicalCue && m.role === "model" && (
                    <span className="text-[10px] text-rose-400/80 italic mt-1 text-left">
                      ({m.physicalCue})
                    </span>
                  )}
                </div>
              ))}

              {isInterrogating && (
                <div className="self-end text-left max-w-[80%]">
                  <span className="text-[10px] text-slate-500 block mb-0.5">جاري التحليل والكتابة...</span>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 animate-pulse">
                    يرجى الانتظار، المشتبه به يراجع إجابته ويتوتر...
                  </div>
                </div>
              )}
            </div>

            {/* Preset Tactical Investigation Questions */}
            <div className="flex flex-wrap gap-2">
              <button
                disabled={isInterrogating}
                onClick={() => askPresetQuestion("ما هو هدف زيارتك الحقيقي إلى هذه الدولة؟")}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold px-2.5 py-1.5 rounded border border-slate-800 text-[11px] transition-colors"
              >
                ❓ هدف زيارتك؟
              </button>
              
              <button
                disabled={isInterrogating}
                onClick={() => askPresetQuestion("هل أنت متأكد من سلامة وصلاحية وثائقك الرسمية؟")}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold px-2.5 py-1.5 rounded border border-slate-800 text-[11px] transition-colors"
              >
                ❓ دقة وثائقك؟
              </button>

              <button
                disabled={isInterrogating}
                onClick={() => askPresetQuestion("لماذا يظهر عليك التوتر وتتصرف بريبة هكذا؟")}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold px-2.5 py-1.5 rounded border border-slate-800 text-[11px] transition-colors"
              >
                ❓ سبب التوتر؟
              </button>

              <button
                disabled={isInterrogating}
                onClick={() => askPresetQuestion("هل تخفي شيئاً بداخل حقائبك أو أمتعتك الشخصية؟")}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold px-2.5 py-1.5 rounded border border-slate-800 text-[11px] transition-colors"
              >
                ❓ ماذا في حقائبك؟
              </button>

              <button
                disabled={isInterrogating}
                onClick={() => {
                  playSound("click");
                  setActiveDocTab("database");
                }}
                className="bg-slate-950 hover:bg-slate-800 text-rose-400 font-semibold px-2.5 py-1.5 rounded border border-rose-900/40 text-[11px] transition-colors mr-auto"
              >
                🔍 استعلم عن السجل الأمني
              </button>
            </div>

            {/* Custom Open-ended Interrogation Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customQuestion.trim() || isInterrogating) return;
                playSound("click");
                submitQuestion(customQuestion);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="اكتب أي سؤال تحقيق مخصص وحر هنا (مثلاً: لماذا جوازك منتهي؟ أو لماذا اسمك مختلف؟)..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                disabled={isInterrogating}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isInterrogating || !customQuestion.trim()}
                className="bg-rose-600 hover:bg-rose-500 text-white p-2.5 rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 transform rotate-180" />
              </button>
            </form>
          </div>

          {/* THE DECISION STAMPS PANEL (Papers, Please style) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase font-mono mb-3">
              <Stamp className="w-4 h-4 text-rose-500 animate-pulse" />
              القرار الأمني الفوري (أختام العبور والاعتقال)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* ADMIT ENTRY */}
              <button
                onClick={() => handleVerdict("admit")}
                className="relative bg-gradient-to-b from-emerald-950/80 to-emerald-900/60 hover:from-emerald-900 hover:to-emerald-800 border-2 border-emerald-600 text-emerald-100 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center flex flex-col items-center justify-center gap-1 group"
              >
                <div className="absolute top-1 right-1 text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">APPROVED</div>
                <CheckCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black">ختم: السماح بالدخول</span>
                <span className="text-[10px] text-emerald-300 font-normal">الوثائق مستوفية الشروط والبروتوكول</span>
              </button>

              {/* REJECT ENTRY */}
              <button
                onClick={() => handleVerdict("reject")}
                className="relative bg-gradient-to-b from-amber-950/80 to-amber-900/60 hover:from-amber-900 hover:to-amber-800 border-2 border-amber-600 text-amber-100 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center flex flex-col items-center justify-center gap-1 group"
              >
                <div className="absolute top-1 right-1 text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">REJECTED</div>
                <XCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black">ختم: الرفض والترحيل</span>
                <span className="text-[10px] text-amber-300 font-normal">الوثائق منتهية الصلاحية أو ناقصة</span>
              </button>

              {/* ARREST IMMEDIATELY */}
              <button
                onClick={() => handleVerdict("arrest")}
                className="relative bg-gradient-to-b from-rose-950/90 to-rose-900/70 hover:from-rose-900 hover:to-rose-800 border-2 border-rose-600 text-rose-100 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center flex flex-col items-center justify-center gap-1 group"
              >
                <div className="absolute top-1 right-1 text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">DETAINED</div>
                <AlertTriangle className="w-5 h-5 text-rose-400 group-hover:animate-bounce" />
                <span className="text-sm font-black">أمر: الاعتقال الفوري</span>
                <span className="text-[10px] text-rose-300 font-normal">اشتباه جنائي / تزوير / تهريب</span>
              </button>

            </div>
          </div>

        </div>
      </main>

      {/* FOOTER METADATA */}
      <footer className="bg-slate-900/50 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>جميع حقوق المحاكاة الفنية محفوظة © 2026 - بوابة الأمن الفدرالي للحدود الرقمية.</p>
          <div className="flex gap-4">
            <span className="font-mono text-[11px] text-slate-400">الإصدار المطور: v1.0.4</span>
            <span className="font-mono text-[11px] text-emerald-500">محاكي ذكاء اصطناعي تفاعلي</span>
          </div>
        </div>
      </footer>

      {/* VERDICT INCIDENT REPORT DIALOG MODAL */}
      {showVerdictModal && verdictResult && selectedSuspect && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl transform transition-all animate-in zoom-in-95">
            
            {/* Header of Modal */}
            <div className={`px-6 py-4 flex items-center justify-between border-b ${
              verdictResult.correct 
                ? "bg-gradient-to-l from-emerald-900/40 to-slate-900 border-emerald-800/80 text-emerald-400"
                : "bg-gradient-to-l from-rose-900/40 to-slate-900 border-rose-800/80 text-rose-400"
            }`}>
              <div className="flex items-center gap-2.5">
                {verdictResult.correct ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                <div>
                  <h4 className="font-bold text-base">
                    {verdictResult.correct ? "تقرير إيجابي: تم اتخاذ القرار السليم" : "تقرير مخالفة: قرار غير صحيح!"}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">الملف الأمني رقم: {selectedSuspect.documents.passport.number}</p>
                </div>
              </div>
              <div className="text-left">
                <span className={`text-lg font-mono font-bold ${verdictResult.scoreImpact >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                  {verdictResult.scoreImpact >= 0 ? `+${verdictResult.scoreImpact}` : verdictResult.scoreImpact} نقطة
                </span>
              </div>
            </div>

            {/* Body of Modal */}
            <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-300">
              
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2">
                <h5 className="font-bold text-slate-400">ملخص القضية والحقيقة السرية:</h5>
                <p className="font-sans text-slate-300 leading-relaxed text-left">
                  {/* Displays what actual case was hiding */}
                  {verdictResult.explanation}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-3 rounded border border-slate-800 text-xs">
                  <span className="text-slate-500 block">قرارك:</span>
                  <span className={`font-bold font-mono ${
                    verdictResult.verdict === "admit" ? "text-emerald-400" : verdictResult.verdict === "reject" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {verdictResult.verdict === "admit" ? "السماح بالدخول" : verdictResult.verdict === "reject" ? "الرفض والترحيل" : "الاعتقال الفوري"}
                  </span>
                </div>

                <div className="bg-slate-950/40 p-3 rounded border border-slate-800 text-xs">
                  <span className="text-slate-500 block">البروتوكول الأمني الصحيح:</span>
                  <span className={`font-bold font-mono ${
                    verdictResult.expectedVerdict === "admit" ? "text-emerald-400" : verdictResult.expectedVerdict === "reject" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {verdictResult.expectedVerdict === "admit" ? "السماح بالدخول" : verdictResult.expectedVerdict === "reject" ? "الرفض والترحيل" : "الاعتقال الفوري"}
                  </span>
                </div>
              </div>

              {/* Moral / Narrative outcome badge */}
              {verdictResult.isHumanitarian && (
                <div className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 p-3.5 rounded-lg flex items-center gap-3">
                  <UserCheck className="w-6 h-6 shrink-0" />
                  <div>
                    <span className="font-bold block text-emerald-300 text-xs">مكافأة اللمسة الإنسانية!</span>
                    لقد فضلت إنقاذ الطفل والوقوف مع المحتاجين على تطبيق القوانين الإدارية الجافة. ميزانية الأمن تقدر الجانب الإنساني لرجال الحدود!
                  </div>
                </div>
              )}
            </div>

            {/* Footer containing action button */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={loadNextSuspect}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md flex items-center gap-2"
              >
                استدعاء الوافد التالي في الطابور
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
