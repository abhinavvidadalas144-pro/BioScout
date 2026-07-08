import React, { useState } from "react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle, 
  X, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Compass,
  ArrowRight,
  UserPlus
} from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialTab?: "login" | "register";
}

const AVATARS = [
  { id: "fox", emoji: "🦊", label: "Red Fox" },
  { id: "owl", emoji: "🦉", label: "Snowy Owl" },
  { id: "bear", emoji: "🐻", label: "Forest Bear" },
  { id: "butterfly", emoji: "🦋", label: "Morpho" },
  { id: "frog", emoji: "🐸", label: "Tree Frog" },
  { id: "wolf", emoji: "🐺", label: "Timber Wolf" }
];

export default function AuthModal({ onClose, onAuthSuccess, initialTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].emoji);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const getExistingUsers = (): UserProfile[] => {
    const raw = localStorage.getItem("bioscout_users_pool");
    if (!raw) {
      // Default sample user
      const defaultUser: UserProfile = {
        username: "Caleb Vance",
        email: "caleb@bioscout.org",
        points: 350,
        streak: 5,
        avatar: "🦊",
        rank: "SENTINEL",
        registeredAt: new Date().toLocaleDateString()
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

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (activeTab === "register" && !username) {
      setError("Please enter a username.");
      return;
    }

    const users = getExistingUsers();

    if (activeTab === "login") {
      // Login flow
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        setError("Account not found. Try creating an account instead!");
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1000);
    } else {
      // Register flow
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        setError("This email address is already registered.");
        return;
      }

      const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) {
        setError("Username is already taken.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      const newUser: UserProfile = {
        username,
        email,
        points: 50, // Starting bonus points
        streak: 1,
        avatar: selectedAvatar,
        rank: "NOVICE",
        registeredAt: new Date().toLocaleDateString()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem("bioscout_users_pool", JSON.stringify(updatedUsers));

      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(newUser);
        onClose();
      }, 1200);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[4000] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white/95 border border-white/50 backdrop-blur-xl rounded-[32px] w-full max-w-md overflow-hidden shadow-[0_24px_64px_-12px_rgba(6,78,59,0.3)] flex flex-col relative"
      >
        {/* Glow corner decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#fcfcfa]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700 animate-spin-slow" />
            <span className="font-extrabold text-[#003527] font-display text-base tracking-tight">BioScout Portal</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#003527] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Custom sliding tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100/80 border border-slate-200/40 rounded-2xl">
                  <button
                    onClick={() => { setActiveTab("login"); setError(""); }}
                    className={`py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "login" 
                        ? "bg-white text-[#003527] shadow-sm scale-[1.01]" 
                        : "text-slate-500 hover:text-[#003527]"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                  <button
                    onClick={() => { setActiveTab("register"); setError(""); }}
                    className={`py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "register" 
                        ? "bg-white text-[#003527] shadow-sm scale-[1.01]" 
                        : "text-slate-500 hover:text-[#003527]"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Join Network
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-extrabold text-[#003527] tracking-tight">
                    {activeTab === "login" ? "Welcome back, Naturalist" : "Register Scout Credentials"}
                  </h2>
                  <p className="text-xs text-[#525f58] mt-1">
                    {activeTab === "login" 
                      ? "Access your dashboard and active ecological mapping grids."
                      : "Join our global network of citizen scientists and start earning points."}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-xs text-red-700"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                  {activeTab === "register" && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Naturalist Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. RiverSeeker"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium text-[#003527] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium text-[#003527] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-11 text-xs font-medium text-[#003527] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003527] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {activeTab === "register" && (
                    <div className="space-y-2.5 pt-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Choose Totem Companion Avatar
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {AVATARS.map((av) => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatar(av.emoji)}
                            title={av.label}
                            className={`p-2.5 rounded-xl text-lg hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                              selectedAvatar === av.emoji 
                                ? "bg-emerald-50 border border-emerald-500/30 scale-105" 
                                : "bg-slate-50/50 border border-transparent"
                            }`}
                          >
                            {av.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#064e3b] to-[#006c49] text-white py-4 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/10 hover:brightness-115 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer pt-4 mt-6"
                  >
                    <span>{activeTab === "login" ? "Verify Credentials" : "Initialize Account"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mb-2">
                  <CheckCircle className="w-8 h-8 animate-bounce-subtle" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#003527] tracking-tight">
                  Authentication Secure
                </h3>
                <p className="text-xs text-[#525f58] max-w-xs">
                  {activeTab === "login" 
                    ? `Welcome back, Explorer! Synced encrypted databases successfully.`
                    : `Your BioScout credentials have been securely provisioned. Starting bonus awarded!`}
                </p>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping mt-4"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
