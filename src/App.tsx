import { useEffect, useState } from "react";
import { AppRunState, ExamType, LocationResult, MoodState, SignalRunResult } from "./types";
import ErrorState from "./components/result/ErrorState";
import SetupRequired from "./components/result/SetupRequired";
import BurnoutGauge from "./components/command/BurnoutGauge";
import TriggerRadar from "./components/command/TriggerRadar";
import DistortionChips from "./components/command/DistortionChips";
import InsightCard from "./components/command/InsightCard";
import ResetItineraryCard from "./components/result/ResetItineraryCard";
import RecommendationCards from "./components/result/RecommendationCards";
import ReplanBox from "./components/result/ReplanBox";
import CrisisSafetyPanel from "./components/result/CrisisSafetyPanel";
import { 
  Home, 
  Sparkles, 
  User, 
  LayoutGrid, 
  ClipboardList, 
  Settings, 
  Plus, 
  Image, 
  Send, 
  Search, 
  Heart, 
  Bed, 
  Flame, 
  Smile, 
  LogOut, 
  Activity, 
  AlertTriangle,
  Mic,
  PersonStanding
} from "lucide-react";

export default function App() {
  // Configured check status
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(true);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(true);

  // Core App states
  const [runState, setRunState] = useState<AppRunState>("idle");
  const [errorMsg, setErrorMsg] = useState<{ code: string; message: string } | null>(null);
  const [result, setResult] = useState<SignalRunResult | null>(null);

  // Form Field components
  const [formData, setFormData] = useState({
    journalText: "",
    mood: null as MoodState | null,
    examType: null as ExamType | null,
    daysToExam: null as number | null,
    city: "Kota",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [replanConstraint, setReplanConstraint] = useState<string>("");
  const [isReplanning, setIsReplanning] = useState<boolean>(false);

  // Check health and configure status on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        setIsCheckingHealth(true);
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error("Health check coordinate request failed");
        const data = await res.json();
        setGeminiConfigured(data.geminiConfigured);
        if (!data.geminiConfigured) {
          setRunState("setup_required");
        }
      } catch (err) {
        console.error("Failed to connect health API:", err);
        // Do not force set to false on network error, so the app remains typable and resilient.
      } finally {
        setIsCheckingHealth(false);
      }
    }
    checkHealth();
  }, []);

  const handleFormChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear validation error when editing field
    setValidationErrors((prev) => {
      const copy = { ...prev };
      Object.keys(updates).forEach((key) => {
        delete copy[key];
      });
      return copy;
    });
  };

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.journalText || formData.journalText.trim().length < 20) {
      errors.journalText = "Write at least 20 characters. Let SIGNAL read stress levels accurately.";
    }

    if (!formData.mood) {
      errors.mood = "Select your current mood to continue.";
    }

    if (!formData.examType) {
      errors.examType = "Select the competitive exam you are preparing for.";
    }

    if (formData.daysToExam === null || isNaN(formData.daysToExam)) {
      errors.daysToExam = "Enter days left until your exam. 0 is also valid.";
    }

    if (!formData.city || formData.city.trim() === "") {
      errors.city = "Enter your city to pull meteorology and nearby landmarks.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Full-Stack Fetch sequence chains
  const handleDecode = async () => {
    if (!validateFields()) return;

    setErrorMsg(null);
    setResult(null);

    let location: LocationResult | null = null;
    let weatherResult = null;
    let placesResult = [];
    let analysisResult = null;
    let itineraryResult = null;
    let recommendationsResult = [];

    try {
      // Step 1: Geocoding Resolve
      setRunState("loading_geocode");
      const geoRes = await fetch(`/api/geocode?city=${encodeURIComponent(formData.city)}`);
      const geoData = await geoRes.json();
      
      if (!geoRes.ok || !geoData.success) {
        throw {
          code: geoData.error || "LOCATION_NOT_FOUND",
          message: geoData.message || `Could not resolve city coordinate specs for "${formData.city}". Check your spelling.`
        };
      }
      location = geoData.location;

      // Step 2: Atmospheric observations (meteo)
      setRunState("loading_weather");
      try {
        const weatherRes = await fetch(`/api/weather?lat=${location!.latitude}&lon=${location!.longitude}`);
        const wData = await weatherRes.json();
        if (weatherRes.ok && wData.success) {
          weatherResult = wData.weather;
        } else {
          console.warn("Weather API bypassed safely:", wData.message);
        }
      } catch (wErr) {
        console.warn("Occasional open meteo fallback applied:", wErr);
      }

      // Step 3: Geographic landmark nearby search
      setRunState("loading_places");
      try {
        const placesRes = await fetch(`/api/places?lat=${location!.latitude}&lon=${location!.longitude}`);
        const pData = await placesRes.json();
        if (placesRes.ok && pData.success) {
          placesResult = pData.places;
        } else {
          console.warn("Wikipedia API bypassed safely:", pData.message);
        }
      } catch (pErr) {
        console.warn("Wikipedia location search fell back safely:", pErr);
      }

      // Step 4: LLM cognitive scans (Gemini Analyze)
      setRunState("loading_analysis");
      const analyzeResponse = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalText: formData.journalText,
          mood: formData.mood,
          examType: formData.examType,
          daysToExam: formData.daysToExam,
          city: formData.city,
          location: location,
          weather: weatherResult,
          places: placesResult,
        }),
      });
      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok || !analyzeData.success) {
        throw {
          code: analyzeData.error || "INVALID_AI_RESPONSE",
          message: analyzeData.message || "Gemini was unable to securely parse your journal entry. Please verify key settings."
        };
      }
      analysisResult = analyzeData.analysis;

      // Crisis Guard Check: suppressed immediately if emergency flagged
      if (analysisResult.riskFlag === "crisis") {
        setResult({
          location: location!,
          weather: weatherResult,
          places: placesResult,
          analysis: analysisResult,
          itinerary: null,
          recommendations: [],
          isCrisis: true,
        });
        setRunState("complete");
        return;
      }

      // Step 5: Well-beingbreak scheduling (Itinerary)
      setRunState("loading_itinerary");
      try {
        const itineraryResponse = await fetch("/api/gemini/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis: analysisResult,
            journalText: formData.journalText,
            mood: formData.mood,
            examType: formData.examType,
            daysToExam: formData.daysToExam,
            city: formData.city,
            weather: weatherResult,
            places: placesResult,
          }),
        });
        const itineraryData = await itineraryResponse.json();
        if (itineraryResponse.ok && itineraryData.success) {
          itineraryResult = itineraryData.itinerary;
        } else {
          console.warn("Itinerary fallback:", itineraryData.message);
        }
      } catch (itErr) {
        console.warn("Itinerary build error:", itErr);
      }

      // Step 6: Action advice recommendations lists
      setRunState("loading_recommendations");
      try {
        const recResponse = await fetch("/api/gemini/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis: analysisResult,
            journalText: formData.journalText,
            mood: formData.mood,
            examType: formData.examType,
            daysToExam: formData.daysToExam,
            city: formData.city,
            weather: weatherResult,
            places: placesResult,
          }),
        });
        const recData = await recResponse.json();
        if (recResponse.ok && recData.success) {
          recommendationsResult = recData.recommendations;
        } else {
          console.warn("Recommendations fallback:", recData.message);
        }
      } catch (recErr) {
        console.warn("Recommendations build error:", recErr);
      }

      // Step 7: Completed dashboard states
      setResult({
        location: location!,
        weather: weatherResult,
        places: placesResult,
        analysis: analysisResult,
        itinerary: itineraryResult,
        recommendations: recommendationsResult,
        isCrisis: false,
      });
      setRunState("complete");

    } catch (err: any) {
      console.error("Signal Decode sequence aborted:", err);
      setErrorMsg({
        code: err.code || "CONNECTION_FAILED",
        message: err.message || "SIGNAL failed to complete the full diagnostic scan. Please inspect key parameters and retrigger."
      });
      setRunState("error");
    }
  };

  const handleReplan = async () => {
    if (!result || !result.itinerary || replanConstraint.trim() === "" || isReplanning) return;

    setIsReplanning(true);
    try {
      const response = await fetch("/api/gemini/replan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentItinerary: result.itinerary,
          userConstraint: replanConstraint,
          analysis: result.analysis,
          weather: result.weather,
          places: result.places
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            itinerary: data.itinerary,
          };
        });
        setReplanConstraint("");
      } else {
        console.error("Replan response failed:", data.message);
      }
    } catch (err) {
      console.error("Replan sequence errored:", err);
    } finally {
      setIsReplanning(false);
    }
  };

  const handleRetry = () => {
    setRunState("idle");
    setErrorMsg(null);
  };

  const getBurnoutScore = () => {
    if (!result || !result.analysis) return "433 Kcal";
    const energy = result.analysis.energy ?? 3;
    const riskFlag = result.analysis.riskFlag ?? "none";
    const riskMap: Record<string, number> = {
      none: 0,
      low: 10,
      moderate: 25,
      high: 40,
      crisis: 60,
    };
    const riskScore = riskMap[riskFlag] ?? 0;
    const rawScore = ((6 - energy) * 10) + riskScore;
    const score = Math.max(0, Math.min(100, rawScore));
    return `${score}%`;
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0A0A0A] flex text-white font-sans antialiased relative">
      {/* Soft ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-orange-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[600px] h-[300px] bg-purple-500/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-orange-500/[0.02] via-transparent to-transparent pointer-events-none" />

      {/* 1. Left Navigation Rail (80px) */}
      <nav aria-label="Primary Navigation" className="w-20 flex flex-col items-center justify-between py-6 h-full border-r border-white/[0.04] bg-black/20 backdrop-blur-md shrink-0">
        <div className="flex flex-col items-center w-full">
          {/* App Logo */}
          <div onClick={handleRetry} className="mt-2 flex flex-col items-center select-none cursor-pointer group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-all">
              <Activity className="text-white size-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-white mt-2 tracking-tight">Signal</span>
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Companion</span>
          </div>

          {/* Navigation Stack */}
          <div className="mt-12 flex flex-col items-center gap-6 w-full">
            {/* Home */}
            <button onClick={handleRetry} aria-label="Home Workspace" className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer">
              <Home className="size-5 stroke-[1.5]" />
            </button>

            {/* AI Assistant - Active */}
            <div className="group relative">
              <button aria-label="AI Assistant diagnostics" className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-black shadow-lg shadow-white/20 transition-all cursor-pointer">
                <Sparkles className="size-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Profile */}
            <button aria-label="View Profile" className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer">
              <User className="size-5 stroke-[1.5]" />
            </button>

            {/* Dashboards */}
            <button aria-label="View dashboards" className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer">
              <LayoutGrid className="size-5 stroke-[1.5]" />
            </button>

            {/* Reports */}
            <button aria-label="View study plans reports" className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer">
              <ClipboardList className="size-5 stroke-[1.5]" />
            </button>

            {/* Settings */}
            <button aria-label="Workspace Settings" className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer">
              <Settings className="size-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Logout/Bottom Spacer */}
        <button aria-label="Logout" className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer mb-2">
          <LogOut className="size-5 stroke-[1.5]" />
        </button>
      </nav>

      {/* 2. Center Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Center Top Bar */}
        <div className="w-full flex items-center justify-between px-8 py-4 z-10 shrink-0">
          {/* Status Indicators */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 select-none">
            <span className={`w-2 h-2 rounded-full ${geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
            <span>SYS_CORE // {runState.toUpperCase()}</span>
          </div>

          {/* Profile & Controls */}
          <div className="flex items-center gap-3">
            {/* Clear/Reset shortcut */}
            <button 
              onClick={handleRetry}
              title="Reset Diagnostic Workspace" 
              className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] flex items-center justify-center text-zinc-300 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
            </button>

            {/* Specimen Profile Badge */}
            <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.05] py-1 px-3 rounded-full">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100" 
                alt="Alvie Wahed"
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-full object-cover border border-white/10 animate-[pulse_6s_infinite]"
              />
              <div className="flex flex-col text-left leading-none select-none">
                <span className="text-xs font-semibold text-white">Alvie Wahed</span>
                <span className="text-[9px] text-zinc-500 mt-0.5 font-medium leading-none">Product Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Canvas View Area */}
        {isCheckingHealth ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest select-none">
              Initializing Luminous Biosensors...
            </p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto px-8 pb-8 flex flex-col items-center">
            
            {/* Header / Orb & Greeting */}
            {(!result || runState.startsWith("loading_")) && (
              <div className="w-full max-w-3xl mt-6 flex flex-col items-center text-center space-y-6">
                {/* Luminous Swirling Glass Orb */}
                <div className="relative h-24 w-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 blur-lg opacity-40 animate-pulse" />
                  <div className={`h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-orange-600 relative overflow-hidden ring-1 ring-white/20 shadow-[0_0_50px_rgba(249,115,22,0.3)] flex items-center justify-center ${runState.startsWith("loading_") ? 'animate-spin duration-300' : 'animate-[pulse_4s_infinite]'}`}>
                    {/* Inner swirled energy overlay */}
                    <div className="absolute inset-2 bg-gradient-to-tr from-purple-900/40 to-orange-400/20 blur-md rounded-full" />
                    <div className="absolute top-1 left-2 w-16 h-8 bg-white/25 blur-[3px] rounded-full rotate-[-15deg]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-4xl mb-2 font-sans font-light text-white leading-none">
                    <span>Hello</span>
                    <span className="font-serif italic font-medium text-white">Zayaan</span>
                    <span className="text-3xl select-none" role="img" aria-label="wave">🙋‍♂️</span>
                  </div>
                  <h1 className="text-lg font-medium text-white/90 tracking-tight leading-tight mt-1.5">Hi! I&apos;m your AI assistant</h1>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                    I analyze your health, habits, and productivity data to give you personalized insights
                  </p>
                </div>
              </div>
            )}

            {/* ROUTE DECODER */}
            {runState === "setup_required" ? (
              <div className="w-full max-w-2xl mt-10">
                <SetupRequired />
              </div>
            ) : runState === "error" ? (
              <div className="w-full max-w-2xl mt-10">
                <ErrorState error={errorMsg || { code: "SYS_ERR", message: "Failed diagnostics check." }} onRetry={handleRetry} />
              </div>
            ) : !result ? (
              /* IDLE STATE LAYOUT */
              <div className="w-full max-w-3xl mt-10 space-y-8 flex flex-col items-center">
                        {/* 4 Feature Presets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  <div 
                    onClick={() => {
                      handleFormChange({
                        journalText: "I have been pulling consecutive all-nighters for NEET preparation, sleeping only 3 to 4 hours per night. My head feels heavy, my concentration is shattered, and I have high pre-test dread.",
                        mood: "crushed",
                        examType: "NEET",
                        daysToExam: 45,
                        city: "Kota"
                      });
                    }}
                    className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-[2rem] p-5 h-40 flex flex-col justify-between hover:-translate-y-1 hover:border-white/15 cursor-pointer transition-all duration-300 bg-gradient-to-br from-purple-900/20 to-transparent group text-left"
                  >
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-purple-300">
                      <Bed className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-purple-300 transition-colors">Sleep Improve</h3>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-snug">Understand sleep patterns & increase rest recovery.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      handleFormChange({
                        journalText: "I feel completely overwhelmed by my JEE preparation schedule. I study 14 hours a day but can't retain any formula vectors. My isolation is high and I'm avoiding my weekly practice tests out of failure anxiety.",
                        mood: "drained",
                        examType: "JEE",
                        daysToExam: 60,
                        city: "Kota"
                      });
                    }}
                    className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-[2rem] p-5 h-40 flex flex-col justify-between hover:-translate-y-1 hover:border-white/15 cursor-pointer transition-all duration-300 bg-gradient-to-br from-blue-900/20 to-transparent group text-left"
                  >
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-blue-300">
                      <Heart className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors uppercase tracking-wider">Improve Habits</h3>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-snug">Build healthier daily routines by tracking behaviors.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      handleFormChange({
                        journalText: "My UPSC preparation has hit a major wall. I feel steady but my energy is draining rapidly during mock exams. I have 120 days left but I'm having existential dread about the outcome.",
                        mood: "okay",
                        examType: "UPSC",
                        daysToExam: 120,
                        city: "New Delhi"
                      });
                    }}
                    className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-[2rem] p-5 h-40 flex flex-col justify-between hover:-translate-y-1 hover:border-white/15 cursor-pointer transition-all duration-300 bg-gradient-to-br from-amber-900/10 to-transparent group text-left"
                  >
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-amber-300">
                      <PersonStanding className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">Focus on Today</h3>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-snug font-sans">Stay aligned with goals by monitoring focus levels.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      handleFormChange({
                        journalText: "I am preparing for examinations. My schedule is entirely irregular. I study until late night, eat quick snacks, and rest poorly. Anxiety is high.",
                        mood: "okay",
                        examType: "NEET",
                        daysToExam: 30,
                        city: "Mumbai"
                      });
                    }}
                    className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-[2rem] p-5 h-40 flex flex-col justify-between hover:-translate-y-1 hover:border-white/15 cursor-pointer transition-all duration-300 bg-gradient-to-br from-emerald-900/20 to-transparent group text-left"
                  >
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-emerald-300">
                      <Smile className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors uppercase tracking-wider">Balance Nutrition</h3>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-snug">Track nutrition patterns to support energy levels.</p>
                    </div>
                  </div>
                </div>

                {/* Parameters inputs Row & Prompt control */}
                <div className="w-full max-w-2xl space-y-4">
                  
                  {/* Parameter sliders glass controller box */}
                  <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-5 space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Target exam pill selector */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">1. COMPETITIVE TARGET EXAM</span>
                        <div className="flex gap-2">
                          {(["NEET", "JEE", "UPSC"] as unknown as ExamType[]).map((typeName) => (
                            <button
                              key={typeName}
                              type="button"
                              onClick={() => handleFormChange({ examType: typeName })}
                              className={`flex-1 py-1.5 px-3 rounded-full border text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${formData.examType === typeName ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'}`}
                            >
                              {typeName}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Number left & City location inputs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.2 text-left">
                          <label htmlFor="days-left-input" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">2. DAYS LEFT</label>
                          <input 
                            id="days-left-input"
                            type="number" 
                            placeholder="Days"
                            value={formData.daysToExam === null ? "" : formData.daysToExam}
                            onChange={(e) => {
                              const v = e.target.value === "" ? null : parseInt(e.target.value);
                              handleFormChange({ daysToExam: v });
                            }}
                            className="bg-black/30 border border-white/5 rounded-full px-3 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-white/20"
                            aria-label="Days left to exam"
                          />
                        </div>
                        <div className="flex flex-col gap-1.2 text-left">
                          <label htmlFor="home-city-input" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">3. HOME CITY</label>
                          <input 
                            id="home-city-input"
                            type="text" 
                            placeholder="Kota"
                            value={formData.city}
                            onChange={(e) => handleFormChange({ city: e.target.value })}
                            className="bg-black/30 border border-white/5 rounded-full px-3 py-1 text-center text-white focus:outline-none focus:border-white/20"
                            aria-label="Home city region"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mood selectors emoji row */}
                    <div className="flex flex-col gap-1.5 pt-3 border-t border-white/[0.04]">
                      <span id="mood-selector-label" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono text-left">4. CHOOSE CLINICAL MOOD FACTOR</span>
                      <div role="radiogroup" aria-labelledby="mood-selector-label" className="grid grid-cols-5 gap-2">
                        {[
                          { emoji: "😞", val: "crushed" as MoodState, label: "Tired" },
                          { emoji: "😴", val: "drained" as MoodState, label: "Exhausted" },
                          { emoji: "😐", val: "okay" as MoodState, label: "Steady" },
                          { emoji: "😊", val: "focused" as MoodState, label: "Focused" },
                          { emoji: "🚀", val: "clear" as MoodState, label: "Energetic" },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            role="radio"
                            aria-checked={formData.mood === item.val}
                            aria-label={`Select mood factor: ${item.label}`}
                            onClick={() => handleFormChange({ mood: item.val })}
                            className={`py-2 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${formData.mood === item.val ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-black/30 border-white/5 text-zinc-500 hover:text-white'}`}
                          >
                            <span className="text-base leading-none" aria-hidden="true">{item.emoji}</span>
                            <span className="text-[8px] font-bold uppercase tracking-tight mt-1 text-zinc-500 leading-none">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Wide glass command launcher input bar */}
                  <div className={`w-full h-16 rounded-2xl bg-white/[0.03] backdrop-blur-xl border flex items-center px-4 shadow-lg transition-all duration-300 ${runState.startsWith("loading_") ? 'border-orange-500/50 ring-1 ring-orange-500/10' : 'border-white/[0.08]'}`}>
                    
                    {/* Floating plus button inside bar */}
                    <button 
                      onClick={() => handleFormChange({ journalText: "" })}
                      title="Clear journal workspace"
                      className="h-8 w-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Plus className="size-4" />
                    </button>

                    {/* Static landscape image icons */}
                    <div className="flex gap-2.5 ml-3 shrink-0">
                      <Image className="text-zinc-500 size-4 hover:text-zinc-300 cursor-pointer transition-all" />
                      <LayoutGrid className="text-zinc-500 size-4 hover:text-zinc-300 cursor-pointer transition-all" />
                    </div>

                    {/* Promp textbox entry */}
                    <label htmlFor="journal-text-input" className="sr-only">Describe your study day</label>
                    <input 
                      id="journal-text-input"
                      type="text"
                      disabled={runState.startsWith("loading_")}
                      value={formData.journalText}
                      onChange={(e) => handleFormChange({ journalText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && formData.journalText.length >= 20 && !runState.startsWith("loading_")) {
                          handleDecode();
                        }
                      }}
                      placeholder="Describe your study day... (At least 20 characters)"
                      className="flex-grow bg-transparent border-none px-4 text-xs font-sans text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                      aria-label="Describe your study day (at least 20 characters)"
                    />

                    {/* Right actions send buttons */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Mic className="text-orange-400/80 size-4 select-none" />
                      <button
                        onClick={handleDecode}
                        disabled={runState.startsWith("loading_") || formData.journalText.trim().length < 20}
                        className={`h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 transition-all cursor-pointer ${formData.journalText.trim().length < 20 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                      >
                        <Send className="size-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Interactive field errors alerts block */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-[1.5rem] p-4 text-xs text-red-300 text-left space-y-1">
                      <div className="font-bold flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-red-400">
                        <AlertTriangle className="size-4 text-red-400" />
                        Diagnostic parameters required //
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-zinc-400 pl-1 mt-1 leading-relaxed">
                        {Object.values(validationErrors).map((errorLabel, errIdx) => (
                          <li key={errIdx}>{errorLabel}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Processing / Loading progressive progress bar */}
                  {runState.startsWith("loading_") && (
                    <div className="bg-white/[0.02] border border-orange-500/20 p-5 rounded-[2rem] text-left space-y-3.5 shadow-xl animate-crisis-fade-in">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-orange-400 font-mono tracking-wider animate-pulse flex items-center gap-2">
                          <Activity className="size-4 animate-spin text-orange-400" />
                          {runState === "loading_geocode" && "GPS TELEMETRY: LOCATING HOME CITY COORDINATES..."}
                          {runState === "loading_weather" && "ATMOSPHERICS: ACQUIRING METEOROLOGICAL OBSERVATIONS..."}
                          {runState === "loading_places" && "GEOGRAPHIC STATIONS: MAPPING NEAREST STUDY BREAK LANDMARKS..."}
                          {runState === "loading_analysis" && "GEMINI SCANNING: RETRIEVING COGNITIVE FATIGUE PATTERNS..."}
                          {runState === "loading_itinerary" && "BIOSYNTHESIS: COMPILING REST TIMELINE STEPS..."}
                          {runState === "loading_recommendations" && "ACTION VECTOR PLAN: STRUCTURING STUDY-BREAK METHODS..."}
                        </span>
                        <span className="text-[9px] font-mono bg-white/5 border border-white/5 text-zinc-500 font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">In-progress</span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                          style={{
                            width: 
                              runState === "loading_geocode" ? "15%" :
                              runState === "loading_weather" ? "30%" :
                              runState === "loading_places" ? "45%" :
                              runState === "loading_analysis" ? "65%" :
                              runState === "loading_itinerary" ? "80%" : "95%"
                          }}
                        />
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              /* COMPLETE DIAGNOSTIC WORKSPACE */
              <div className="w-full max-w-4xl mt-4 space-y-6 animate-crisis-fade-in font-sans">
                
                {/* Header title block */}
                <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/[0.04] pb-4 text-left">
                  <div>
                    <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 tracking-widest leading-none">Cognitive Transcripts Analyzer //</span>
                    <h2 className="text-xl font-bold text-white mt-1 uppercase tracking-tight">
                      DIAGNOSTICS REPORT FOR {formData.city.toUpperCase()} // READY
                    </h2>
                  </div>
                  <button 
                    onClick={handleRetry}
                    className="mt-2 md:mt-0 px-4 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-mono uppercase font-bold tracking-widest rounded-full hover:bg-orange-500 hover:text-white transition-all cursor-pointer leading-none"
                  >
                    ← Log New Journal Entry
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left">
                  
                  {/* Left Column (Radar / Gauge / Bias vector tags) */}
                  <div className="col-span-12 md:col-span-5 space-y-6">
                    {result.isCrisis ? (
                      <div className="col-span-12 animate-crisis-fade-in">
                        <CrisisSafetyPanel />
                      </div>
                    ) : (
                      <>
                        {/* Gauge container */}
                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center">
                          <div className="w-full">
                            <BurnoutGauge analysis={result.analysis} />
                          </div>
                        </div>

                        {/* Radar maps */}
                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                          <TriggerRadar triggerDomains={result.analysis.triggerDomains} />
                        </div>

                        {/* Distortions chips list */}
                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                          <DistortionChips
                            cognitiveDistortions={result.analysis.cognitiveDistortions}
                            distortionExplanations={result.analysis.distortionExplanations}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column (Timeline, weather, and recommendations) */}
                  <div className="col-span-12 md:col-span-7 space-y-6">
                    {!result.isCrisis && (
                      <>
                        {/* Primary Insight text block */}
                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-6 shadow-xl border-l-4 border-l-orange-500 relative overflow-hidden text-left">
                          <InsightCard 
                            primaryInsight={result.analysis.primaryInsight} 
                            primaryStressor={result.analysis.primaryStressor} 
                            emotions={result.analysis.emotions} 
                          />
                        </div>

                        {/* Atmospheric telemetry card if present */}
                        {result.weather && (
                          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 shadow-md relative overflow-hidden text-left">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none font-bold block">METEOROLOGY TELEMETRY //</span>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">{result.weather.weatherDescription} OUTSIDE // {Math.round(result.weather.temperature)}°C</h4>
                                <p className="text-[11px] text-zinc-400 font-sans">Environmental conditions mapped from location sensors.</p>
                              </div>
                              <div className="text-3xl pr-2">{result.weather.weatherEmoji}</div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/[0.04]">
                              {result.weather.isIndoorWeather ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-sm leading-none">
                                  🔒 INDOOR-WEATHER DETECTED // Tailoring cozy indoor exercises
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-sm leading-none">
                                  🔓 NATURE-WALK SUITABLE // Highly recommend step outdoors!
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Breaks timeline planning schedule */}
                        {result.itinerary && (
                          <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-6 shadow-xl text-left relative overflow-hidden">
                            <ResetItineraryCard itinerary={result.itinerary} />
                          </div>
                        )}

                        {/* Advice lists recommendations */}
                        {result.recommendations && result.recommendations.length > 0 && (
                          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-6 shadow-xl relative overflow-hidden text-left">
                            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block mb-3 leading-none">ACTIONABLE RESEARCH ADVICE</span>
                            <RecommendationCards recommendations={result.recommendations} />
                          </div>
                        )}

                        {/* Replan input prompt constraint bar layout */}
                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-6 shadow-xl relative overflow-hidden text-left">
                          <ReplanBox
                            value={replanConstraint}
                            onChange={setReplanConstraint}
                            onReplan={handleReplan}
                            isReplanning={isReplanning}
                          />
                        </div>
                      </>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* 3. Right Rail (320px) */}
      <aside aria-label="Journal logs and summary sidebar" className="w-80 h-full border-l border-white/[0.06] bg-black/40 backdrop-blur-3xl p-5 overflow-y-auto flex flex-col justify-between shrink-0 text-left">
        <div className="space-y-5">
          
          {/* Section Header */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight leading-none">Chat History</h3>
          </div>

          {/* Quick Search Log search bar */}
          <div className="h-10 w-full rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center px-4">
            <label htmlFor="search-logs-input" className="sr-only">Search logs</label>
            <Search className="text-zinc-500 size-4 shrink-0" aria-hidden="true" />
            <input 
              id="search-logs-input"
              type="text" 
              placeholder="Search logs..." 
              className="bg-transparent border-none w-full px-3 text-xs text-zinc-300 focus:outline-none placeholder:text-zinc-500 font-sans"
              aria-label="Search logs"
            />
          </div>

          {/* Metrics Grid exact representation inside column */}
          <div className="grid grid-cols-3 gap-3 select-none">
            
            {/* Metric 1 - Burnout percentage indices */}
            <div className="aspect-square rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3 flex flex-col justify-between h-[92px] hover:border-white/10 transition-all">
              <div className="h-6 w-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                <Heart className="size-3.5" />
              </div>
              <div className="space-y-[1px] text-left leading-none mt-1">
                <span className="text-white text-xs font-bold font-sans tracking-tight block">
                  {getBurnoutScore()}
                </span>
                <span className="text-[9px] text-zinc-500 font-sans block leading-none font-medium truncate">
                  {result ? "Fatigue Risk" : "Granola, Oats"}
                </span>
              </div>
            </div>

            {/* Metric 2 - Exam countdown */}
            <div className="aspect-square rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3 flex flex-col justify-between h-[92px] hover:border-white/10 transition-all">
              <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Bed className="size-3.5" />
              </div>
              <div className="space-y-[1px] text-left leading-none mt-1">
                <span className="text-white text-xs font-bold font-sans tracking-tight block">
                  {formData.daysToExam !== null ? `${formData.daysToExam} Days` : "7.2 Hrs"}
                </span>
                <span className="text-[9px] text-zinc-500 font-sans block leading-none font-medium truncate">
                  {formData.examType ? `${formData.examType.toUpperCase()} Target` : "Sleep Rest"}
                </span>
              </div>
            </div>

            {/* Metric 3 - City atmospheric temperature values */}
            <div className="aspect-square rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3 flex flex-col justify-between h-[92px] hover:border-white/10 transition-all">
              <div className="h-6 w-6 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-400">
                <PersonStanding className="size-3.5" />
              </div>
              <div className="space-y-[1px] text-left leading-none mt-1">
                <span className="text-white text-xs font-bold font-sans tracking-tight block truncate">
                  {result?.weather ? `${Math.round(result.weather.temperature)}°C` : result ? "Indoor" : "2.4 Hrs"}
                </span>
                <span className="text-[9px] text-zinc-500 font-sans block leading-none font-medium truncate">
                  {result?.weather ? result.weather.weatherDescription : "Daily Focus"}
                </span>
              </div>
            </div>

          </div>

          {/* Daily habits instruction widget inside sidebar */}
          <div className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-4 text-left space-y-2">
            <div className="flex items-start justify-between select-none">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">Build Better Daily Habits</h4>
              <input type="checkbox" readOnly checked className="h-4 w-4 rounded border-zinc-600 bg-transparent text-orange-500 focus:ring-0 cursor-not-allowed" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal font-sans">
              Identify study behaviors impacting sleep, daily focusing, panic and long-term retention levels.
            </p>
            <div className="pt-2 flex gap-1.5 justify-start">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/15 text-emerald-400 leading-none select-none font-medium">
                <Smile className="size-2.5" /> Optimal Mind
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-orange-500/15 text-orange-400 leading-none select-none font-medium">
                <Flame className="size-2.5" /> Active Core
              </span>
            </div>
          </div>

          {/* Cyclist cinematic backdrop block */}
          <div className="h-32 w-full rounded-2xl overflow-hidden relative border border-white/10 group shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&q=80&w=300&h=180" 
              alt="Athlete training in sunset" 
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/8 w-full p-3 flex flex-col justify-end text-left select-none">
              <span className="text-[8px] font-mono text-orange-400 tracking-wider uppercase font-bold leading-none">Break Recommendation //</span>
              <span className="text-[10px] font-bold text-white tracking-tight mt-0.5 leading-tight">Cardio Restorative Recovery</span>
            </div>
          </div>

          {/* Weekly summary items checklist box */}
          <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] p-4 text-left space-y-2">
            <div className="flex items-start justify-between select-none">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">Weekly Health Summary</h4>
              <input type="checkbox" readOnly className="h-4 w-4 rounded border-zinc-600 bg-transparent text-orange-500 focus:ring-0 cursor-not-allowed" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal font-sans">
              A complete overview of sleep consistency, active restorative break timings and prep stress levels...
            </p>
          </div>

        </div>

        {/* Action button at bottom sidebar (resets system dashboard) */}
        <button 
          onClick={handleRetry}
          className="w-full h-10 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] active:border-white/20 flex items-center justify-center font-medium text-xs text-white tracking-widest uppercase transition-all cursor-pointer mt-5 mb-1"
        >
          Again Chat
        </button>
      </aside>

    </div>
  );
}
