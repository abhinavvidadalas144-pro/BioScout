import React, { useRef, useState, useEffect } from "react";
import { Sighting } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Download, Copy, Check, ShieldCheck, HelpCircle } from "lucide-react";

interface ShareSightingModalProps {
  sighting: Sighting;
  onClose: () => void;
  theme?: "light" | "night";
}

export default function ShareSightingModal({ sighting, onClose, theme = "light" }: ShareSightingModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  // Generate a share text template for copy action
  const getShareText = () => {
    return `🌲 BioScout Observation Report 🌲
-----------------------------------
Specimen: ${sighting.speciesName} (${sighting.scientificName})
Location: ${sighting.location}
Timestamp: ${sighting.timestamp}
Accuracy: ${sighting.confidence}% Telemetry Match
Status: ${sighting.verified ? "VERIFIED SPECIMEN" : "PENDING FIELD AUDIT"}
Notes: "${sighting.notes || "Local ecological tracker observation records."}"
Reported by: ${sighting.reporter}

Mapped via BioScout Expedition Network 📶 Offline-ready remote conservation tracking.`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BioScout: ${sighting.speciesName}`,
          text: getShareText(),
        });
      } catch (err) {
        console.log("Native share cancelled or failed", err);
      }
    } else {
      handleCopy();
    }
  };

  // Real canvas download generator
  const handleDownloadImage = () => {
    setDownloading(true);
    setCanvasError(null);

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setCanvasError("Canvas rendering engine is unavailable.");
      setDownloading(false);
      return;
    }

    // Determine colors based on night mode or light mode
    const isNight = theme === "night";
    const bgPrimary = isNight ? "#001a13" : "#f4f4f3";
    const bgCard = isNight ? "#00281e" : "#ffffff";
    const textPrimary = isNight ? "#6ffbbe" : "#003527";
    const textSecondary = isNight ? "#58c797" : "#404944";
    const accentColor = isNight ? "#6ffbbe" : "#059669";
    const borderPrimary = isNight ? "#145c48" : "#bfc9c3";

    // 1. Draw Background
    ctx.fillStyle = bgPrimary;
    ctx.fillRect(0, 0, 600, 720);

    // Draw inner border
    ctx.strokeStyle = borderPrimary;
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, 570, 690);

    // 2. Draw Header
    ctx.fillStyle = textPrimary;
    ctx.font = "800 22px 'Space Grotesk', sans-serif";
    ctx.fillText("BIOSCOUT OBSERVATION CARD", 40, 60);

    ctx.fillStyle = textSecondary;
    ctx.font = "bold 10px monospace";
    ctx.fillText(`ID: ${sighting.id} // OFFLINE LOG SECURED`, 40, 80);

    // Draw a divider line
    ctx.strokeStyle = borderPrimary;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 95);
    ctx.lineTo(560, 95);
    ctx.stroke();

    // 3. Draw Main Sighting Image Card (Simulated background)
    ctx.fillStyle = bgCard;
    ctx.fillRect(40, 115, 520, 260);
    ctx.strokeStyle = borderPrimary;
    ctx.strokeRect(40, 115, 520, 260);

    // Function to compile and trigger download after image loads (or fails)
    const renderTextAndTrigger = (imgLoaded: boolean, loadedImg?: HTMLImageElement) => {
      if (imgLoaded && loadedImg) {
        // Draw the image nicely, cover style in center
        const aspect = loadedImg.width / loadedImg.height;
        let dWidth = 520;
        let dHeight = 260;
        let sx = 0, sy = 0, sWidth = loadedImg.width, sHeight = loadedImg.height;

        if (aspect > 2) {
          // Image is wider
          sWidth = loadedImg.height * 2;
          sx = (loadedImg.width - sWidth) / 2;
        } else {
          // Image is taller
          sHeight = loadedImg.width / 2;
          sy = (loadedImg.height - sHeight) / 2;
        }

        ctx.drawImage(loadedImg, sx, sy, sWidth, sHeight, 40, 115, 520, 260);
      } else {
        // Fallback drawing inside image area
        ctx.fillStyle = isNight ? "#043a2b" : "#e6ebe7";
        ctx.fillRect(45, 120, 510, 250);
        ctx.fillStyle = textPrimary;
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🌿 Expedition Field Sighting Asset", 300, 235);
        ctx.font = "12px monospace";
        ctx.fillText("Image loaded under security framework", 300, 260);
        ctx.textAlign = "left"; // reset
      }

      // 4. Draw Details
      ctx.fillStyle = textPrimary;
      ctx.font = "800 28px 'Space Grotesk', sans-serif";
      ctx.fillText(sighting.speciesName, 40, 420);

      ctx.fillStyle = accentColor;
      ctx.font = "italic bold 16px sans-serif";
      ctx.fillText(sighting.scientificName, 40, 445);

      // Status Badge
      ctx.fillStyle = sighting.verified ? "#10b981" : "#f59e0b";
      ctx.fillRect(400, 395, 160, 30);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(sighting.verified ? "★ VERIFIED SPECIMEN" : "★ PENDING AUDIT", 420, 414);

      // Metrology Details Grid
      ctx.fillStyle = textSecondary;
      ctx.font = "bold 10px monospace";
      ctx.fillText("OBSERVATION LOG DATA", 40, 485);

      // Table divider
      ctx.strokeStyle = borderPrimary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 495);
      ctx.lineTo(560, 495);
      ctx.stroke();

      // Row 1: Location & Timestamp
      ctx.fillStyle = textPrimary;
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("Location Coordinate:", 40, 520);
      ctx.fillStyle = textSecondary;
      ctx.fillText(sighting.location, 180, 520);

      ctx.fillStyle = textPrimary;
      ctx.fillText("Date/Time Logged:", 40, 545);
      ctx.fillStyle = textSecondary;
      ctx.fillText(sighting.timestamp, 180, 545);

      // Row 2: Accuracy Match & Reporter
      ctx.fillStyle = textPrimary;
      ctx.fillText("Telemetry Match:", 40, 570);
      ctx.fillStyle = textSecondary;
      ctx.fillText(`${sighting.confidence}% Accuracy Match`, 180, 570);

      ctx.fillStyle = textPrimary;
      ctx.fillText("Field Tracker ID:", 40, 595);
      ctx.fillStyle = textSecondary;
      ctx.fillText(sighting.reporter, 180, 595);

      // Divider 2
      ctx.beginPath();
      ctx.moveTo(40, 615);
      ctx.lineTo(560, 615);
      ctx.stroke();

      // Row 3: Notes
      ctx.fillStyle = textPrimary;
      ctx.font = "italic 11px sans-serif";
      const notesText = sighting.notes || "Specimen records verified inside regional ecosystem parameters.";
      // Wrap notes nicely
      const words = notesText.split(" ");
      let line = "";
      let yLine = 640;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 510 && n > 0) {
          ctx.fillText(line, 40, yLine);
          line = words[n] + " ";
          yLine += 18;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 40, yLine);

      // Footer
      ctx.fillStyle = textSecondary;
      ctx.font = "bold 8px monospace";
      ctx.fillText("BIOSCOUT CONSERVATION & ECOLOGICAL TELEMETRY NET", 40, 695);

      // Create download link
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `bioscout-sighting-${sighting.speciesName.toLowerCase().replace(/\s+/g, "-")}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        setCanvasError("Standard canvas security restrictions blocked URL conversion. Triggering image backup...");
        // Fallback simple print or file download
      }
      setDownloading(false);
    };

    // Load image with CORS configuration
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      renderTextAndTrigger(true, img);
    };
    img.onerror = () => {
      renderTextAndTrigger(false);
    };
    img.src = sighting.image;
  };

  const isNight = theme === "night";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[3000] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className={`w-full max-w-lg rounded-[28px] overflow-hidden border ${isNight ? "bg-[#002419] border-emerald-800/40 text-[#6ffbbe]" : "bg-white border-slate-200 text-[#003527]"} shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center border-b ${isNight ? "border-emerald-800/20 bg-emerald-950/30" : "border-slate-100 bg-[#f9f9f8]"} shrink-0`}>
          <div>
            <h3 className="text-sm font-extrabold font-display uppercase tracking-wider">Share Expedition Record</h3>
            <p className="text-[10px] text-slate-400 font-mono">Collect and Export Field Journals</p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-all cursor-pointer ${isNight ? "border-emerald-800/40 text-[#6ffbbe] bg-white/5 hover:bg-white/10" : "border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100"}`}
          >
            ✕
          </button>
        </div>

        {/* Share Preview Card Container */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[60vh] scrollbar-thin">
          <div 
            ref={cardRef}
            className={`p-5 rounded-2xl border ${isNight ? "bg-[#001c13] border-emerald-800/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" : "bg-[#f4f4f3]/70 border-slate-200 shadow-sm"} relative`}
          >
            {/* Stamp / Verified Decal */}
            <div className="absolute top-4 right-4 z-10">
              {sighting.verified ? (
                <div className={`flex items-center gap-1 border-2 text-[9px] font-extrabold uppercase px-2 py-1 rounded-md tracking-wider rotate-6 select-none ${isNight ? "border-emerald-500 bg-emerald-950/90 text-emerald-300" : "border-emerald-600 bg-emerald-50/90 text-emerald-700"}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 border-2 text-[9px] font-extrabold uppercase px-2 py-1 rounded-md tracking-wider rotate-6 select-none border-amber-500 bg-amber-950/90 text-amber-300">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Pending Audit</span>
                </div>
              )}
            </div>

            {/* Specimen Photo */}
            <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 border border-[#bfc9c3]/20 bg-black/20">
              <img 
                src={sighting.image} 
                alt={sighting.speciesName} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white font-mono text-[8px] px-2 py-0.5 rounded backdrop-blur-sm">
                ID: {sighting.id.substring(0, 8)}...
              </div>
            </div>

            {/* Scientific credentials */}
            <div>
              <h4 className="text-xl font-extrabold tracking-tight font-display">{sighting.speciesName}</h4>
              <p className={`text-xs italic mb-4 font-semibold ${isNight ? "text-emerald-400" : "text-emerald-700"}`}>{sighting.scientificName}</p>
            </div>

            {/* Coordinates table */}
            <div className={`space-y-1.5 text-xs border-t border-b py-3 font-medium ${isNight ? "border-emerald-800/20 text-[#bfc9c3]" : "border-slate-200/60 text-[#404944]"}`}>
              <div className="flex justify-between">
                <span className="opacity-75">Geographic Location:</span>
                <span className="font-bold">{sighting.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Observation Timestamp:</span>
                <span className="font-bold">{sighting.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Verification Confidence:</span>
                <span className="font-bold">{sighting.confidence}% Match</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Logged by Explorer:</span>
                <span className="font-bold">{sighting.reporter}</span>
              </div>
            </div>

            {/* Field Notes */}
            {sighting.notes && (
              <p className={`text-xs italic mt-4 p-3 rounded-xl border ${isNight ? "bg-emerald-950/20 border-emerald-800/20 text-[#bfc9c3]" : "bg-white border-slate-200/50 text-[#5c6861]"}`}>
                "{sighting.notes}"
              </p>
            )}

            {/* Footer QR/Logo */}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#bfc9c3]/15">
              <span className={`font-mono text-[8px] tracking-wider uppercase opacity-60 ${isNight ? "text-emerald-300" : "text-[#404944]"}`}>BioScout Field Network</span>
              <div className={`w-10 h-10 border rounded flex items-center justify-center p-0.5 ${isNight ? "border-emerald-500/20 bg-emerald-950/20" : "border-slate-200 bg-white"}`}>
                {/* Simulated visual QR structure */}
                <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                  {[1,0,1,1, 1,1,0,1, 0,0,1,0, 1,1,0,1].map((v, i) => (
                    <div key={i} className={`rounded-[1px] ${v === 1 ? (isNight ? "bg-emerald-400" : "bg-[#003527]") : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {canvasError && (
            <p className="text-[10px] text-amber-500 font-mono leading-relaxed text-center bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              ⚠️ {canvasError}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className={`p-4 border-t flex flex-col gap-2 ${isNight ? "border-emerald-800/20 bg-emerald-950/30" : "border-slate-100 bg-[#f9f9f8]"} shrink-0`}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all ${
                downloading 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : isNight 
                    ? "bg-[#6ffbbe] text-[#001c13] hover:brightness-110 active:scale-95" 
                    : "bg-[#003527] text-white hover:brightness-110 active:scale-95"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? "Building Card..." : "Save Card (PNG)"}</span>
            </button>

            <button
              onClick={handleCopy}
              className={`py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                copied 
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : isNight
                    ? "border-emerald-800 bg-[#001c13] text-[#6ffbbe] hover:bg-[#00281e]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied Logs" : "Copy Log Text"}</span>
            </button>
          </div>

          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className={`w-full py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isNight 
                  ? "border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Socials</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
