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
  Sparkles
} from "lucide-react";

interface LoginPageProps {
  onNavigate: (screen: any) => void;
  onAuthSuccess: (user: UserProfile) => void;
  theme?: "light" | "night";
}

export default function LoginPage({ onNavigate, onAuthSuccess, theme = "light" }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleValidation = (): boolean => {
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g. naturalist@domain.com).");
      return false;
    }
    if (!password) {
      setError("Please enter your password.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) return;

    setIsLoading(true);
    setError("");

    // Simulate authentic verification lag
    setTimeout(() => {
      const users = getExistingUsers();
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser) {
        setError("No account matched this email. Try creating a new scout account!");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        onAuthSuccess(matchedUser);
        onNavigate("hq"); // Redirect directly to the dashboard
      }, 1000);
    }, 1200);
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    setIsOAuthLoading(provider);
    setError("");

    setTimeout(() => {
      // Mock OAuth account connection
      const users = getExistingUsers();
      // Look for a matching user or sign in as Caleb Vance as the primary developer profile
      const matchedUser = users.find(u => u.email.includes(provider)) || users[0];

      setSuccess(true);
      setIsOAuthLoading(null);

      setTimeout(() => {
        onAuthSuccess(matchedUser);
        onNavigate("hq");
      }, 1000);
    }, 1500);
  };

  const isDark = theme === "night";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 md:p-12 relative overflow-hidden transition-all duration-300 ${
      isDark ? "bg-[#000d08]" : "bg-[#f5f7f6]"
    }`}>
      {/* Immersive biological-ambient blurred lighting vectors */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#052e16]/25 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-[#10b981]/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[#064e3b]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: National Geographic Editorial / Brand Panel */}
        <div className="lg:col-span-6 hidden lg:flex flex-col space-y-8 pr-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>BioScout Network Active</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-extrabold text-[#003527] tracking-tight leading-[1.1] dark:text-[#6ffbbe]">
              Empowering global <span className="text-emerald-600 dark:text-emerald-400">biodiversity</span> tracking.
            </h1>
            
            <p className="text-sm text-[#4d5e54] leading-relaxed dark:text-emerald-500/70 max-w-md">
              Securely authenticate to log real-time botanical & zoological species data, synchronize off-grid coordinate mappings, and access high-altitude satellite classification feeds.
            </p>
          </motion.div>

          {/* Interactive Eco Metric Highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? "bg-[#001c12]/60 border-emerald-950" : "bg-white border-slate-200/50 shadow-[0_8px_24px_-10px_rgba(0,53,39,0.06)]"
            }`}>
              <div className="text-2xl font-black text-[#003527] dark:text-[#6ffbbe]">42,801</div>
              <div className="text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400 uppercase tracking-wider mt-1">Global Sightings</div>
            </div>
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? "bg-[#001c12]/60 border-emerald-950" : "bg-white border-slate-200/50 shadow-[0_8px_24px_-10px_rgba(0,53,39,0.06)]"
            }`}>
              <div className="text-2xl font-black text-[#003527] dark:text-[#6ffbbe]">1,402</div>
              <div className="text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400 uppercase tracking-wider mt-1">Species Preserved</div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Authentication Glass Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 w-full"
        >
          <div className={`border rounded-[32px] overflow-hidden transition-all duration-300 relative ${
            isDark 
              ? "bg-[#001c12]/80 border-emerald-900/50 shadow-[0_24px_80px_rgba(0,0,0,0.6)]" 
              : "bg-white border-[#bfc9c3]/30 shadow-[0_24px_70px_-15px_rgba(0,53,39,0.08)]"
          }`}>
            {/* Top accent border bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-[#064e3b] to-teal-500"></div>

            <div className="p-8 md:p-10">
              {/* Header section with brand logo */}
              <div className="flex flex-col items-center text-center space-y-3 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  onClick={() => onNavigate("landing")}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/10 cursor-pointer"
                >
                  <Compass className="w-6 h-6 animate-spin-slow" />
                </motion.div>
                
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-[#003527]"}`}>
                  Welcome Back
                </h2>
                <p className={`text-xs max-w-xs ${isDark ? "text-emerald-500/70" : "text-[#525f58]"}`}>
                  Sign in to continue your conservation journey.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="login-form-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
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

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Email input field */}
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

                      {/* Password input field */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className={`block text-[11px] font-extrabold uppercase tracking-wider ${
                            isDark ? "text-emerald-500/70" : "text-[#404944]/80"
                          }`}>
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => alert("Credentials reset can be initialized via secondary satellite protocols. Contact support@bioscout.org")}
                            className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                          >
                            Forgot Password?
                          </button>
                        </div>
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
                      </div>

                      {/* Remember Me checkbox */}
                      <div className="flex items-center space-x-2 pt-1 pb-2">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className={`w-4 h-4 rounded border text-emerald-600 focus:ring-emerald-500 cursor-pointer ${
                            isDark ? "bg-[#00120b] border-emerald-950/80" : "bg-slate-50 border-slate-300"
                          }`}
                        />
                        <label htmlFor="remember-me" className={`text-xs font-medium cursor-pointer select-none ${
                          isDark ? "text-emerald-500/60" : "text-slate-500"
                        }`}>
                          Remember Me
                        </label>
                      </div>

                      {/* Primary Sign In Button */}
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
                            <span>Verify and Sign In</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Divider with labels */}
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-200/70 dark:border-emerald-950"></div>
                      <span className={`flex-shrink mx-4 text-[10px] font-extrabold uppercase tracking-widest ${
                        isDark ? "text-emerald-500/40" : "text-slate-400"
                      }`}>
                        Or Continue With
                      </span>
                      <div className="flex-grow border-t border-slate-200/70 dark:border-emerald-950"></div>
                    </div>

                    {/* Social OAuth Integration Grid */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleOAuthLogin("google")}
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
                        onClick={() => handleOAuthLogin("github")}
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

                    {/* Bottom Switch Link */}
                    <div className="text-center pt-2">
                      <p className={`text-xs ${isDark ? "text-emerald-500/50" : "text-slate-500"}`}>
                        Don't have an account?{" "}
                        <button
                          onClick={() => onNavigate("register")}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-all cursor-pointer"
                        >
                          Create one
                        </button>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login-success-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                      <CheckCircle className="w-8 h-8 animate-bounce-subtle" />
                    </div>
                    <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-[#003527]"}`}>
                      Session Verified
                    </h3>
                    <p className={`text-xs max-w-xs ${isDark ? "text-emerald-500/60" : "text-[#525f58]"}`}>
                      Connecting to satellite arrays. Syncing local ecological mapping data grids...
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
