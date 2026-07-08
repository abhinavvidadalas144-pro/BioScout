import React, { useState } from "react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Compass,
  ArrowRight,
  Github,
  Globe,
  Sparkles,
  ShieldCheck
} from "lucide-react";

interface RegisterPageProps {
  onNavigate: (screen: any) => void;
  onAuthSuccess: (user: UserProfile) => void;
  theme?: "light" | "night";
}

const AVATARS = [
  { id: "fox", emoji: "🦊", label: "Red Fox" },
  { id: "owl", emoji: "🦉", label: "Snowy Owl" },
  { id: "bear", emoji: "🐻", label: "Forest Bear" },
  { id: "butterfly", emoji: "🦋", label: "Morpho" },
  { id: "frog", emoji: "🐸", label: "Tree Frog" },
  { id: "wolf", emoji: "🐺", label: "Timber Wolf" }
];

export default function RegisterPage({ onNavigate, onAuthSuccess, theme = "light" }: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].emoji);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<"google" | "github" | null>(null);
  const [success, setSuccess] = useState(false);

  const getExistingUsers = (): UserProfile[] => {
    const raw = localStorage.getItem("bioscout_users_pool");
    if (!raw) {
      const defaultUser: UserProfile = {
        username: "Caleb Vance",
        email: "caleb@bioscout.org",
        points: 350,
        streak: 5,
        avatar: "🦊",
        rank: "SENTINEL",
        registeredAt: "6/30/2026"
      };
      localStorage.setItem("bioscout_users_pool", JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "", score: 0, color: "bg-slate-200" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: "Weak", score, color: "bg-red-500" };
    if (score <= 3) return { label: "Fair", score, color: "bg-amber-500" };
    return { label: "Strong", score, color: "bg-emerald-500" };
  };

  const handleValidation = (): boolean => {
    setError("");
    if (!username.trim()) {
      setError("Please enter your full name or naturalist username.");
      return false;
    }
    if (!email) {
      setError("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g. tracker@domain.com).");
      return false;
    }
    if (!password) {
      setError("Please create a password.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Confirm password must exactly match your chosen password.");
      return false;
    }
    if (!acceptTerms) {
      setError("You must accept the terms of service and biodiversity privacy charter.");
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) return;

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const users = getExistingUsers();

      // Check if email already registered
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        setError("This email address is already associated with an account.");
        setIsLoading(false);
        return;
      }

      // Create new user profile with starting bonus points
      const newUser: UserProfile = {
        username: username.trim(),
        email: email.trim(),
        points: 50, // Starter bonus points
        streak: 1,
        avatar: selectedAvatar,
        rank: "NOVICE",
        registeredAt: new Date().toLocaleDateString()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem("bioscout_users_pool", JSON.stringify(updatedUsers));

      setSuccess(true);
      setIsLoading(false);

      // Automatically log in and redirect to dashboard
      setTimeout(() => {
        onAuthSuccess(newUser);
        onNavigate("hq");
      }, 1000);
    }, 1200);
  };

  const handleOAuthRegister = (provider: "google" | "github") => {
    setIsOAuthLoading(provider);
    setError("");

    setTimeout(() => {
      const users = getExistingUsers();
      // Generate a brand new user using provider data
      const randomId = Math.floor(Math.random() * 900) + 100;
      const newUser: UserProfile = {
        username: provider === "google" ? `GoogleScout ${randomId}` : `GitHubScout ${randomId}`,
        email: `scout-${randomId}@${provider}.com`,
        points: 50,
        streak: 1,
        avatar: selectedAvatar,
        rank: "NOVICE",
        registeredAt: new Date().toLocaleDateString()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem("bioscout_users_pool", JSON.stringify(updatedUsers));

      setSuccess(true);
      setIsOAuthLoading(null);

      setTimeout(() => {
        onAuthSuccess(newUser);
        onNavigate("hq");
      }, 1000);
    }, 1500);
  };

  const isDark = theme === "night";
  const strength = getPasswordStrength();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 md:p-12 relative overflow-hidden transition-all duration-300 ${
      isDark ? "bg-[#000d08]" : "bg-[#f5f7f6]"
    }`}>
      {/* Ambient environmental glowing vectors */}
      <div className="absolute top-[-10%] right-[-10%] w-[55vw] h-[55vw] bg-[#064e3b]/20 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#10b981]/15 rounded-full blur-[140px] pointer-events-none"></div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Campaign / Features panel */}
        <div className="lg:col-span-5 hidden lg:flex flex-col space-y-8 pr-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Join Global Citizens</span>
            </div>
            
            <h1 className="text-3xl xl:text-4xl font-extrabold text-[#003527] tracking-tight leading-[1.1] dark:text-[#6ffbbe]">
              Protect earth's rarest ecosystems with <span className="text-emerald-600 dark:text-emerald-400">AI mapping</span>.
            </h1>
            
            <p className="text-xs text-[#4d5e54] leading-relaxed dark:text-emerald-500/70">
              By creating your BioScout account, you gain access to high-accuracy computer vision classification tools, competitive gamified community leaderboards, and offline taxonomic guides.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Unique features bullets */}
            {[
              { icon: Compass, title: "Precision Mapping", desc: "Instantly tag coordinate grids of flora/fauna." },
              { icon: ShieldCheck, title: "Zero-Knowledge Data", desc: "Secure encrypted citizen science logs." },
              { icon: Sparkles, title: "50 PTS Signup Bonus", desc: "Start your rank progress immediately." }
            ].map((item, i) => (
              <div key={i} className="flex gap-3.5 items-start">
                <div className={`p-2 rounded-lg ${isDark ? "bg-[#002418] text-[#6ffbbe]" : "bg-[#003527]/5 text-[#003527]"}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#003527] dark:text-[#6ffbbe]">{item.title}</h4>
                  <p className="text-[11px] text-[#525f58] dark:text-emerald-500/50 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Registration Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 w-full"
        >
          <div className={`border rounded-[32px] overflow-hidden transition-all duration-300 relative ${
            isDark 
              ? "bg-[#001c12]/80 border-emerald-900/50 shadow-[0_24px_80px_rgba(0,0,0,0.6)]" 
              : "bg-white border-[#bfc9c3]/30 shadow-[0_24px_70px_-15px_rgba(0,53,39,0.08)]"
          }`}>
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-[#064e3b] to-teal-500"></div>

            <div className="p-8 md:p-10">
              <div className="flex flex-col items-center text-center space-y-2 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  onClick={() => onNavigate("landing")}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/10 cursor-pointer"
                >
                  <Compass className="w-6 h-6 animate-spin-slow" />
                </motion.div>
                
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-[#003527]"}`}>
                  Create Your BioScout Account
                </h2>
                <p className={`text-xs max-w-xs ${isDark ? "text-emerald-500/70" : "text-[#525f58]"}`}>
                  Join the community protecting biodiversity through AI.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="register-form-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-red-50/90 border border-red-100 flex items-start gap-3 text-xs text-red-700"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold leading-relaxed">{error}</span>
                      </motion.div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Naturalist Username */}
                        <div className="space-y-1.5">
                          <label className={`block text-[11px] font-extrabold uppercase tracking-wider ${
                            isDark ? "text-emerald-500/70" : "text-[#404944]/80"
                          }`}>
                            Naturalist Full Name
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <User className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              placeholder="e.g. Elena Vos"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              disabled={isLoading}
                              className={`w-full border rounded-xl py-3.5 pl-12 pr-4 text-xs font-semibold transition-all duration-200 outline-none ${
                                isDark
                                  ? "bg-[#00120b] border-emerald-950/60 text-emerald-200 focus:bg-[#00170e] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                  : "bg-slate-50 border-slate-200/80 text-[#003527] focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/5"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                          <label className={`block text-[11px] font-extrabold uppercase tracking-wider ${
                            isDark ? "text-emerald-500/70" : "text-[#404944]/80"
                          }`}>
                            Email Address
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Mail className="w-4 h-4" />
                            </span>
                            <input
                              type="email"
                              placeholder="you@domain.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isLoading}
                              className={`w-full border rounded-xl py-3.5 pl-12 pr-4 text-xs font-semibold transition-all duration-200 outline-none ${
                                isDark
                                  ? "bg-[#00120b] border-emerald-950/60 text-emerald-200 focus:bg-[#00170e] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                  : "bg-slate-50 border-slate-200/80 text-[#003527] focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/5"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className={`block text-[11px] font-extrabold uppercase tracking-wider ${
                            isDark ? "text-emerald-500/70" : "text-[#404944]/80"
                          }`}>
                            Create Password
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock className="w-4 h-4" />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              disabled={isLoading}
                              className={`w-full border rounded-xl py-3.5 pl-12 pr-12 text-xs font-semibold transition-all duration-200 outline-none ${
                                isDark
                                  ? "bg-[#00120b] border-emerald-950/60 text-emerald-200 focus:bg-[#00170e] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                  : "bg-slate-50 border-slate-200/80 text-[#003527] focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/5"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>

                          {/* Password Strength Indicator */}
                          {password && (
                            <div className="space-y-1 pt-1.5">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                <span className={isDark ? "text-emerald-500/50" : "text-slate-400"}>Strength</span>
                                <span className={strength.label === "Weak" ? "text-red-500" : strength.label === "Fair" ? "text-amber-500" : "text-emerald-600"}>
                                  {strength.label}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${strength.color} transition-all duration-300`} 
                                  style={{ width: `${(strength.score / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                          <label className={`block text-[11px] font-extrabold uppercase tracking-wider ${
                            isDark ? "text-emerald-500/70" : "text-[#404944]/80"
                          }`}>
                            Confirm Password
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock className="w-4 h-4" />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isLoading}
                              className={`w-full border rounded-xl py-3.5 pl-12 pr-4 text-xs font-semibold transition-all duration-200 outline-none ${
                                isDark
                                  ? "bg-[#00120b] border-emerald-950/60 text-emerald-200 focus:bg-[#00170e] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                  : "bg-slate-50 border-slate-200/80 text-[#003527] focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/5"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Choose Companion Totem (Existing custom interactive feature) */}
                      <div className="space-y-2 pt-1">
                        <label className={`block text-[11px] font-extrabold uppercase tracking-wider ${
                          isDark ? "text-emerald-500/70" : "text-[#404944]/80"
                        }`}>
                          Choose Companion Totem Avatar
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                          {AVATARS.map((av) => (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => setSelectedAvatar(av.emoji)}
                              title={av.label}
                              className={`p-2 rounded-xl text-lg hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                                selectedAvatar === av.emoji 
                                  ? "bg-emerald-500/10 border border-emerald-500 scale-105" 
                                  : isDark ? "bg-[#00150d] border border-emerald-950/40 hover:bg-[#002014]" : "bg-slate-50/50 border border-transparent hover:bg-slate-50"
                              }`}
                            >
                              {av.emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Accept Terms Checkbox */}
                      <div className="flex items-start space-x-2.5 pt-1.5">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className={`w-4.5 h-4.5 mt-0.5 rounded border text-emerald-600 focus:ring-emerald-500 cursor-pointer ${
                            isDark ? "bg-[#00120b] border-emerald-950/80" : "bg-slate-50 border-slate-300"
                          }`}
                        />
                        <label htmlFor="terms" className={`text-xs font-semibold cursor-pointer select-none leading-relaxed ${
                          isDark ? "text-emerald-500/60" : "text-slate-500"
                        }`}>
                          I accept the BioScout Terms of Service and consent to encrypted citizen biodiversity logging.
                        </label>
                      </div>

                      {/* Submit Create Account Button */}
                      <motion.button
                        whileHover={{ scale: 1.01, y: -0.5 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#044c35] to-[#10b981] text-white py-4 rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-emerald-950/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Create Account and Claim Starter PTS</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-200/70 dark:border-emerald-950"></div>
                      <span className={`flex-shrink mx-4 text-[10px] font-extrabold uppercase tracking-widest ${
                        isDark ? "text-emerald-500/40" : "text-slate-400"
                      }`}>
                        Or Join Instantly With
                      </span>
                      <div className="flex-grow border-t border-slate-200/70 dark:border-emerald-950"></div>
                    </div>

                    {/* Google/GitHub Signup Grid */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleOAuthRegister("google")}
                        disabled={!!isOAuthLoading}
                        className={`py-3.5 px-4 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                          isDark
                            ? "border-emerald-950 bg-[#00150d] hover:bg-[#002014] text-emerald-300"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-[#003527]"
                        }`}
                      >
                        {isOAuthLoading === "google" ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Globe className="w-4 h-4 text-emerald-500" />
                            <span>Google</span>
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleOAuthRegister("github")}
                        disabled={!!isOAuthLoading}
                        className={`py-3.5 px-4 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                          isDark
                            ? "border-emerald-950 bg-[#00150d] hover:bg-[#002014] text-emerald-300"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-[#003527]"
                        }`}
                      >
                        {isOAuthLoading === "github" ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Github className="w-4 h-4" />
                            <span>GitHub</span>
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Bottom Link to Login */}
                    <div className="text-center pt-2">
                      <p className={`text-xs ${isDark ? "text-emerald-500/50" : "text-slate-500"}`}>
                        Already have an account?{" "}
                        <button
                          onClick={() => onNavigate("login")}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-all cursor-pointer"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register-success-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                      <CheckCircle className="w-8 h-8 animate-bounce-subtle" />
                    </div>
                    <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-[#003527]"}`}>
                      Credentials Provisioned
                    </h3>
                    <p className={`text-xs max-w-xs ${isDark ? "text-emerald-500/60" : "text-[#525f58]"}`}>
                      Welcome to the global ecological observation grid! Starting bonus awarded successfully...
                    </p>
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mt-4"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
