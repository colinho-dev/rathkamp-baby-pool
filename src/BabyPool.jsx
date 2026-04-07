import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
import { User, Calendar, Clock, Scale, Ruler, Sparkles, Mail, KeyRound, Baby, Heart, Lock, Save, Settings, Pencil, LayoutList, Users, ArrowUp, ArrowDown, PartyPopper, Star } from "lucide-react";

const STORAGE_KEY = "rachel-baby-pool-v2";

const CONFETTI_COLORS = [
  "#7DD8FF","#B0E4FF","#60C8FF","#C8EEFF","#FFB3D4","#B8F0C8","#D4B8FF","#fff","#89D4F5"
];
const SHAPES = ["circle","rect","star"];

// Generated once at module load so values are stable across renders
// 5 bubbles at fixed x positions so they never overlap
// Sizes kept small enough that adjacent lanes don't collide
const BUBBLE_LANES = [8, 26, 46, 66, 84];
const BUBBLES = BUBBLE_LANES.map((xPos, i) => {
  const size = 70 + Math.random() * 60; // 70–130px — fits comfortably in each lane
  return {
    id: i,
    size,
    x: xPos + (Math.random() - 0.5) * 4, // tiny nudge so they don't look robotic
    dur: 38 + Math.random() * 22,          // 38–60s — slow but visibly moving
    delay: -(i * 11 + Math.random() * 8), // stagger so no two are at same height
    wobbleAmp: 10 + Math.random() * 14,
    wobbleDur: 5 + Math.random() * 5,
    borderOpacity:    +(0.20 + Math.random() * 0.18).toFixed(2),
    highlightOpacity: +(0.16 + Math.random() * 0.12).toFixed(2),
    reflection2:      +(0.06 + Math.random() * 0.07).toFixed(2),
  };
});

const HERO_SPARKLES = [
  // top-left large oval zone
  { x:"4%",  y:"2%",  s:11, d:3.1 },
  { x:"12%", y:"7%",  s:16, d:0.4 },
  { x:"20%", y:"3%",  s:10, d:1.7 },
  { x:"7%",  y:"14%", s:20, d:0.0 },
  { x:"24%", y:"11%", s:13, d:2.5 },
  // top-right oval zone
  { x:"76%", y:"4%",  s:11, d:1.3 },
  { x:"84%", y:"2%",  s:14, d:0.7 },
  { x:"91%", y:"9%",  s:18, d:2.0 },
  { x:"97%", y:"5%",  s:10, d:3.3 },
  { x:"80%", y:"16%", s:16, d:1.1 },
  // upper-left small oval zone
  { x:"3%",  y:"28%", s:13, d:1.5 },
  { x:"9%",  y:"35%", s:10, d:2.8 },
  // red circle 1 — left-center
  { x:"25%", y:"24%", s:16, d:0.9 },
  { x:"30%", y:"32%", s:11, d:2.3 },
  // red circle 2 — right-center
  { x:"65%", y:"22%", s:14, d:1.6 },
  { x:"70%", y:"30%", s:12, d:3.0 },
  // red circle 3 — far right
  { x:"88%", y:"26%", s:15, d:0.5 },
  { x:"93%", y:"33%", s:10, d:2.1 },
  // left-middle oval zone
  { x:"5%",  y:"55%", s:14, d:0.6 },
  // bottom-left oval zone
  { x:"10%", y:"82%", s:16, d:1.8 },
  // right side scatter
  { x:"78%", y:"30%", s:10, d:1.9 },
  { x:"93%", y:"44%", s:13, d:1.4 },
  { x:"87%", y:"62%", s:18, d:0.5 },
  // bottom-right large oval zone
  { x:"88%", y:"78%", s:15, d:0.3 },
];

function Confetti({ burst }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!burst) return;
    const arr = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: 7 + Math.random() * 10,
      delay: Math.random() * 0.6,
      dur: 1.8 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 220,
      spin: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [burst]);

  if (!pieces.length) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1000, overflow:"hidden" }}>
      <style>{`@keyframes confettiFall{0%{transform:translateY(-20px) translateX(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(105vh) translateX(var(--drift)) rotate(var(--spin));opacity:0}}`}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:0, width:p.size, height:p.size,
          background:p.color,
          borderRadius: p.shape==="circle" ? "50%" : p.shape==="rect" ? "2px" : "0",
          clipPath: p.shape==="star" ? "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" : undefined,
          "--drift":`${p.drift}px`, "--spin":`${p.spin}deg`,
          animation:`confettiFall ${p.dur}s ${p.delay}s cubic-bezier(.25,.46,.45,.94) forwards`,
        }}/>
      ))}
    </div>
  );
}

// Glass soap bubbles — outer div falls, inner div wobbles, innermost is the visual
function Bubbles() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      <style>{`
        @keyframes bubbleDrop{
          0%  {transform:translateY(-180px);opacity:0}
          6%  {opacity:1}
          94% {opacity:.9}
          100%{transform:translateY(115vh);opacity:0}
        }
        @keyframes bubbleWobble{
          0%,100%{transform:translateX(0)}
          28%    {transform:translateX(var(--wa))}
          72%    {transform:translateX(calc(var(--wa)*-.65))}
        }
      `}</style>
      {BUBBLES.map(b => (
        <div key={b.id} style={{
          position:"absolute", left:`${b.x}%`, top:0,
          animation:`bubbleDrop ${b.dur}s ${b.delay}s linear infinite`,
        }}>
          <div style={{ animation:`bubbleWobble ${b.wobbleDur}s ease-in-out infinite`, "--wa":`${b.wobbleAmp}px` }}>
            <div style={{
              width:b.size, height:b.size, borderRadius:"50%",
              border:`1.5px solid rgba(175,230,255,${b.borderOpacity})`,
              background:[
                // Primary highlight — top-left specular
                `radial-gradient(circle at 28% 26%, rgba(255,255,255,${b.highlightOpacity}), transparent 26%)`,
                // Secondary reflection — bottom-right
                `radial-gradient(circle at 72% 75%, rgba(100,195,255,${b.reflection2}), transparent 28%)`,
                // Rim glow — top edge
                `radial-gradient(circle at 50% 8%, rgba(210,240,255,0.09), transparent 20%)`,
                // Subtle inner tint
                `radial-gradient(circle at 50% 50%, rgba(125,216,255,0.03), transparent 65%)`,
              ].join(","),
              boxShadow:[
                `inset 0 0 ${Math.round(b.size*.2)}px rgba(125,216,255,0.07)`,
                `inset 0 -${Math.round(b.size*.04)}px ${Math.round(b.size*.12)}px rgba(100,180,255,0.05)`,
                `0 0 ${Math.round(b.size*.14)}px rgba(125,216,255,0.05)`,
              ].join(","),
            }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// Subtle film-grain overlay — barely visible but adds depth to the background
function Grain() {
  return (
    <div style={{
      position:"fixed", inset:0, pointerEvents:"none", zIndex:100, opacity:0.07,
      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat:"repeat", backgroundSize:"200px 200px",
    }}/>
  );
}

function emptyForm() {
  return { name:"", date:"", time:"", weight:"", length:"", nameGuess:"", message:"" };
}

const inputBase = {
  width:"100%", padding:"11px 14px", borderRadius:12,
  border:"1.5px solid rgba(125,216,255,0.18)",
  background:"rgba(255,255,255,0.05)", color:"#fff",
  fontSize:"0.92rem", fontFamily:"'DM Sans',system-ui,sans-serif",
};

function Input({ type="text", value, onChange, placeholder, onEnter }) {
  return (
    <input type={type} className="bp-input" value={value}
      onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      onKeyDown={e=>e.key==="Enter"&&onEnter?.()}
      style={inputBase}
    />
  );
}

function WeightPicker({ value, onChange }) {
  const m = (value||"").match(/^(\d+)\s*lbs\s*(\d+)\s*oz$/);
  const curLbs = m ? m[1] : "";
  const curOz  = m ? m[2] : "";
  const update = (l, o) => {
    if (l === "" && o === "") { onChange(""); return; }
    onChange(`${l||0} lbs ${o||0} oz`);
  };
  const sel = { ...inputBase, flex:1, width:"auto", cursor:"pointer" };
  return (
    <div style={{ display:"flex", gap:8 }}>
      <select className="bp-input bp-select" value={curLbs} onChange={e=>update(e.target.value, curOz)} style={sel}>
        <option value="">— lbs</option>
        {Array.from({length:11},(_,i)=>i+5).map(n=><option key={n} value={n}>{n} lbs</option>)}
      </select>
      <select className="bp-input bp-select" value={curOz} onChange={e=>update(curLbs, e.target.value)} style={sel}>
        <option value="">— oz</option>
        {Array.from({length:16},(_,i)=>i).map(n=><option key={n} value={n}>{n} oz</option>)}
      </select>
    </div>
  );
}

function LengthPicker({ value, onChange }) {
  const m = (value||"").match(/^([\d.]+)\s*in$/);
  const cur = m ? m[1] : "";
  const inches = Array.from({length:21},(_,i)=>+(14+i*0.5).toFixed(1));
  return (
    <select className="bp-input bp-select" value={cur} onChange={e=>onChange(e.target.value ? `${e.target.value} in` : "")} style={{ ...inputBase, cursor:"pointer" }}>
      <option value="">— inches</option>
      {inches.map(n=><option key={n} value={n}>{n} in</option>)}
    </select>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.7rem", fontWeight:700, color:"rgba(125,216,255,0.72)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:7 }}>
        {icon}{label}
      </label>
      {children}
    </div>
  );
}

function GlassCard({ children, style={} }) {
  return (
    <div style={{
      background:"rgba(255,255,255,0.045)",
      border:"1px solid rgba(125,216,255,0.14)",
      borderRadius:24, padding:"28px 26px",
      backdropFilter:"blur(20px)",
      boxShadow:"0 8px 40px rgba(0,0,0,0.45), 0 1px 0 rgba(125,216,255,0.08) inset",
      ...style
    }}>
      {children}
    </div>
  );
}

function SuccessCard({ onReset }) {
  return (
    <GlassCard>
      <div style={{ textAlign:"center", padding:"48px 0" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", width:100, height:100, borderRadius:"50%", background:"radial-gradient(circle, rgba(125,216,255,0.18) 0%, rgba(125,216,255,0.06) 50%, transparent 72%)", filter:"blur(8px)" }}/>
            <div style={{ position:"absolute", width:80, height:80, borderRadius:"50%", border:"1px solid rgba(125,216,255,0.22)", animation:"countdownPulse 2.5s ease-in-out infinite" }}/>
            <PartyPopper size={64} color="#7DD8FF" style={{ position:"relative" }} />
          </div>
        </div>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", color:"#fff", fontSize:"2.1rem", marginBottom:8, fontWeight:700 }}>You're locked in!</h2>
        <p style={{ color:"rgba(125,216,255,0.65)", fontStyle:"italic", fontSize:"0.95rem", lineHeight:1.6 }}>
          Your guess is saved. May the odds be ever in your favor.
        </p>
        <button onClick={onReset} className="bp-ghost-btn"
          style={{ marginTop:28, background:"rgba(125,216,255,0.1)", border:"1px solid rgba(125,216,255,0.28)", color:"#7DD8FF", borderRadius:12, padding:"11px 26px", fontFamily:"inherit", fontWeight:600, cursor:"pointer", fontSize:"0.9rem" }}>
          Submit Another Guess
        </button>
      </div>
    </GlassCard>
  );
}

export default function BabyPool() {
  const [guesses, setGuesses]     = useState([]);
  const [poolInfo, setPoolInfo]   = useState({ momName:"Rachel", dueDate:"2026-05-04", babyName:"" });
  const [tab, setTab]             = useState("guess");
  const [burst, setBurst]         = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [adminPass, setAdminPass]       = useState("");
  const [adminOk, setAdminOk]           = useState(false);
  const [form, setForm]                 = useState(emptyForm());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [savedMsg, setSavedMsg]         = useState(false);
  const [adminOpen, setAdminOpen]       = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("guesses")
        .select("*")
        .order("submitted_at", { ascending: true });
      if (data) setGuesses(data);
    }
    load();
  }, []);

  function persist(g, p) {
    // no-op — data lives in Supabase now
  }

  function canSubmit() { return form.name && form.date && form.time && form.weight && form.nameGuess; }

  async function handleSubmit() {
    if (!canSubmit()) return;
    const { data, error } = await supabase
      .from("guesses")
      .insert([{
        name: form.name,
        date: form.date,
        time: form.time,
        weight: form.weight,
        length: form.length,
        name_guess: form.nameGuess,
        message: form.message,
      }])
      .select();
    if (error) { alert("Something went wrong, please try again."); return; }
    if (data) setGuesses(prev => [...prev, data[0]]);
    setBurst(b => b+1);
    setSubmitted(true);
    setForm(emptyForm());
  }

  async function delGuess(id) {
    await supabase.from("guesses").delete().eq("id", id);
    setGuesses(prev => prev.filter(g => g.id !== id));
  }

  const fmt  = d => { if(!d)return"—"; const [y,m,dy]=d.split("-"); return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${+dy}, ${y}`; };
  const fmtT = t => { if(!t)return"—"; const [h,m]=t.split(":"); return `${+h%12||12}:${m} ${+h>=12?"PM":"AM"}`; };

  // Countdown to due date
  const daysLeft = (() => {
    if (!poolInfo.dueDate) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(poolInfo.dueDate + "T00:00:00");
    return Math.ceil((due - today) / 86400000);
  })();

  const CHIP_COLORS = ["#7DD8FF","#B0E4FF","#89D4F5","#60C8FF","#A0D8F5","#C8EEFF","#4BBCE8"];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#060e1e 0%,#091830 38%,#0d2248 68%,#060f1c 100%)", fontFamily:"'DM Sans',system-ui,sans-serif", position:"relative", overflowX:"hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:rgba(125,216,255,0.3)}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(125,216,255,0.25);border-radius:3px}
        @keyframes slideUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes sparkle{0%{opacity:0;transform:scale(.3) rotate(0deg)}20%{opacity:1;transform:scale(1) rotate(45deg)}80%{opacity:.85;transform:scale(1) rotate(90deg)}100%{opacity:0;transform:scale(.3) rotate(135deg)}}
        @keyframes countdownPulse{0%,100%{box-shadow:0 0 0 0 rgba(125,216,255,0.0)}50%{box-shadow:0 0 0 6px rgba(125,216,255,0.1),0 0 18px rgba(125,216,255,0.08)}}
        @keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .bp-blue-title{
          background:linear-gradient(135deg,#3BAEE0 0%,#7DD8FF 30%,#C8EEFF 55%,#7DD8FF 75%,#3BAEE0 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmer 5s linear infinite;
        }
        .bp-input{transition:border-color .2s,box-shadow .2s,background .2s}
        .bp-input::placeholder{color:rgba(125,200,245,0.45)}
        .bp-input:hover{border-color:rgba(125,216,255,0.38)!important}
        .bp-input:focus{border-color:#7DD8FF!important;box-shadow:0 0 0 3px rgba(125,216,255,0.14)!important;outline:none;background:rgba(255,255,255,0.07)!important}
        .bp-tab:hover{color:rgba(125,216,255,0.75)!important}
        .bp-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(91,196,245,0.45)!important}
        .bp-submit:active:not(:disabled){transform:translateY(0)}
        .bp-card{transition:transform .2s,box-shadow .2s,border-color .2s}
        .bp-card:hover{transform:translateY(-3px);box-shadow:0 14px 44px rgba(0,0,0,0.45), 0 0 28px rgba(125,216,255,0.1), 0 0 0 1px rgba(125,216,255,0.16)!important}
        .bp-del:hover{background:rgba(255,90,90,0.18)!important;border-color:rgba(255,90,90,0.45)!important;color:rgba(255,140,140,0.95)!important}
        .bp-ghost-btn:hover{background:rgba(125,216,255,0.18)!important}
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(.5) sepia(1) saturate(3) hue-rotate(170deg);cursor:pointer}
        select.bp-select{-webkit-appearance:none;appearance:none;padding-right:32px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(125,216,255,0.55)'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
        select.bp-select option{background:#0a1e3d;color:#fff}
        @media(max-width:540px){.bp-sparkle{display:none!important}}
        @media(max-width:480px){
          .bp-two-col{grid-template-columns:1fr!important}
          .bp-stats{grid-template-columns:1fr!important}
        }
      `}</style>

      <Bubbles />
      <Grain />
      <Confetti burst={burst} />

      <div style={{ position:"relative", zIndex:1, maxWidth:780, margin:"0 auto", padding:"48px 24px 100px" }}>

        {/* ── HERO ── */}
        <div style={{ textAlign:"center", marginBottom:40, animation:"slideUp .65s ease both", position:"relative" }}>

          {/* Sparkles — hidden on mobile */}
          {HERO_SPARKLES.map((sp,i) => (
            <span key={i} className="bp-sparkle" style={{
              position:"absolute", left:sp.x, top:sp.y,
              color:"rgba(160,225,255,0.9)",
              filter:"drop-shadow(0 0 6px rgba(125,216,255,0.8)) drop-shadow(0 0 16px rgba(125,216,255,0.4))",
              animation:`sparkle ${7+sp.d}s ${sp.d}s ease-in-out infinite`,
              pointerEvents:"none", display:"inline-flex",
            }}><Star size={sp.s} fill="rgba(160,225,255,0.9)" strokeWidth={0} /></span>
          ))}

          {/* Countdown up top */}
          {daysLeft !== null && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(125,216,255,0.06)", border:"1px solid rgba(125,216,255,0.18)", borderRadius:10, padding:"6px 16px", marginBottom:22, animation:"countdownPulse 3s ease-in-out infinite" }}>
              <Calendar size={12} color="rgba(125,216,255,0.6)" />
              <span style={{ fontSize:"0.82rem", color:"rgba(160,220,255,0.85)", fontWeight:600 }}>
                {daysLeft > 1 ? `${daysLeft} days to go` : daysLeft === 1 ? "Tomorrow!" : daysLeft === 0 ? "Today's the day!" : "Baby is here!"}
              </span>
            </div>
          )}

          <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(2.9rem,9vw,5rem)", fontWeight:900, lineHeight:.95, color:"#fff", letterSpacing:"-2.5px", marginBottom:14, textShadow:"0 2px 48px rgba(125,216,255,0.2)" }}>
            The<br/>Rathkamp<br/>
            <span className="bp-blue-title" style={{ display:"inline-block", marginTop:6, paddingBottom:16 }}>Baby Pool</span>
          </h1>

          <p style={{ color:"rgba(160,210,250,0.65)", fontSize:"1rem", fontWeight:500, marginBottom:16 }}>
            When will Rachel and Joey's bundle of joy arrive?
          </p>

          {/* Due date + It's a Boy down here */}
          <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            {poolInfo.dueDate && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(125,216,255,0.09)", border:"1px solid rgba(125,216,255,0.2)", borderRadius:12, padding:"8px 18px" }}>
                <Calendar size={14} color="rgba(125,216,255,0.7)" />
                <span style={{ color:"rgba(160,220,255,0.88)", fontSize:"0.88rem" }}>Due <strong style={{ color:"#fff" }}>{fmt(poolInfo.dueDate)}</strong></span>
              </div>
            )}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(125,216,255,0.09)", border:"1px solid rgba(125,216,255,0.22)", borderRadius:100, padding:"7px 18px", backdropFilter:"blur(8px)" }}>
              <Baby size={14} color="#7DD8FF" />
              <span style={{ fontSize:"0.72rem", color:"#7DD8FF", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase" }}>It's a Boy!</span>
              <Heart size={14} color="#7DD8FF" fill="#7DD8FF" />
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        {guesses.length > 0 && (
          <div className="bp-stats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24, animation:"slideUp .65s .08s ease both" }}>
            {[
              {label:"Guesses", val:guesses.length, Icon:Users},
              {label:"Earliest", val:fmt([...guesses].map(g=>g.date).sort()[0]), Icon:ArrowUp},
              {label:"Latest",   val:fmt([...guesses].map(g=>g.date).sort().slice(-1)[0]), Icon:ArrowDown},
            ].map(({label,val,Icon}) => (
              <div key={label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(125,216,255,0.11)", borderTop:"2px solid rgba(125,216,255,0.32)", borderRadius:16, padding:"14px 10px", textAlign:"center", backdropFilter:"blur(10px)" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}><Icon size={16} color="rgba(125,200,245,0.55)" /></div>
                <div style={{ fontSize:"1.05rem", fontWeight:700, color:"#fff", lineHeight:1.1 }}>{val}</div>
                <div style={{ fontSize:"0.65rem", color:"rgba(125,200,245,0.5)", textTransform:"uppercase", letterSpacing:".07em", marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        {(() => {
          const TABS = [
            {k:"guess",       Icon:Pencil,     label:"Guess"},
            {k:"leaderboard", Icon:LayoutList,  label:`Board (${guesses.length})`},
          ];
          const activeIdx = TABS.findIndex(t=>t.k===tab);
          return (
            <div style={{ position:"relative", display:"flex", gap:4, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(125,216,255,0.1)", borderRadius:18, padding:5, marginBottom:24, backdropFilter:"blur(12px)", animation:"slideUp .65s .14s ease both" }}>
              {/* sliding pill */}
              <div style={{
                position:"absolute", top:5, bottom:5,
                width:`calc(${100/TABS.length}% - ${(4*(TABS.length-1)/TABS.length).toFixed(1)}px)`,
                left:`calc(${activeIdx * (100/TABS.length)}% + ${(activeIdx * 4 / TABS.length).toFixed(1)}px)`,
                background:"rgba(125,216,255,0.13)",
                borderRadius:14,
                transition:"left .25s cubic-bezier(.4,0,.2,1)",
                pointerEvents:"none",
                boxShadow:"0 0 0 1px rgba(125,216,255,0.18) inset",
              }}/>
              {TABS.map(({k,Icon,label})=>(
                <button key={k} className="bp-tab" onClick={()=>{setTab(k);setSubmitted(false);}}
                  style={{ flex:1, padding:"11px 4px", border:"none", borderRadius:14, background:"transparent", color:tab===k?"#7DD8FF":"rgba(125,190,230,0.5)", fontFamily:"inherit", fontWeight:600, fontSize:"0.82rem", cursor:"pointer", transition:"color .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:5, position:"relative" }}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>
          );
        })()}

        {/* ══ GUESS ══ */}
        {tab==="guess" && (
          <div style={{ animation:"slideUp .4s ease both" }}>
            {submitted
              ? <SuccessCard onReset={()=>setSubmitted(false)} />
              : (
                <GlassCard>
                  <div style={{ marginBottom:26 }}>
                    <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1.85rem", fontWeight:700, color:"#fff", marginBottom:5 }}>Your Prediction</h2>
                    <p style={{ color:"rgba(125,200,245,0.55)", fontSize:"0.85rem" }}>Fields marked * are required.</p>
                  </div>
                  <div style={{ display:"grid", gap:18 }}>
                    <Field label="Your Name *" icon={<User size={12}/>}>
                      <Input placeholder="e.g. Aunt Sarah" value={form.name} onChange={v=>setForm({...form,name:v})} />
                    </Field>
                    <div className="bp-two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <Field label="Birth Date *" icon={<Calendar size={12}/>}>
                        <Input type="date" value={form.date} onChange={v=>setForm({...form,date:v})} />
                      </Field>
                      <Field label="Birth Time *" icon={<Clock size={12}/>}>
                        <Input type="time" value={form.time} onChange={v=>setForm({...form,time:v})} />
                      </Field>
                    </div>
                    <div className="bp-two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <Field label="Weight *" icon={<Scale size={12}/>}>
                        <WeightPicker value={form.weight} onChange={v=>setForm({...form,weight:v})} />
                      </Field>
                      <Field label="Length" icon={<Ruler size={12}/>}>
                        <LengthPicker value={form.length} onChange={v=>setForm({...form,length:v})} />
                      </Field>
                    </div>

                    <Field label="Baby's Predicted Name *" icon={<Sparkles size={12}/>}>
                      <Input placeholder="What will they name him?" value={form.nameGuess} onChange={v=>setForm({...form,nameGuess:v})} />
                    </Field>

                    <Field label="Message for Rachel & Joey" icon={<Mail size={12}/>}>
                      <textarea className="bp-input" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
                        placeholder="Words of love, wisdom, or well wishes…"
                        rows={3} style={{ ...inputBase, resize:"vertical", lineHeight:1.6, paddingTop:12 }}
                      />
                    </Field>
                    <button className="bp-submit" onClick={handleSubmit} disabled={!canSubmit()}
                      style={{
                        width:"100%", padding:"15px", border:"none", borderRadius:16,
                        background: canSubmit() ? "linear-gradient(135deg,#5BC4F5 0%,#1A9FE0 100%)" : "rgba(125,216,255,0.08)",
                        color: canSubmit() ? "#fff" : "rgba(125,216,255,0.3)",
                        fontFamily:"inherit", fontSize:"1rem", fontWeight:700,
                        cursor: canSubmit()?"pointer":"not-allowed",
                        boxShadow: canSubmit() ? "0 4px 20px rgba(91,196,245,0.3)" : "none",
                        transition:"all .25s", letterSpacing:".02em",
                      }}>
                      <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Lock size={16} />Lock In My Guess</span>
                    </button>
                    {!canSubmit() && (
                      <p style={{ textAlign:"center", fontSize:"0.76rem", color:"rgba(125,200,245,0.4)", marginTop:10 }}>
                        Required:{" "}
                        {[!form.name&&"name", !form.date&&"date", !form.time&&"time", !form.weight&&"weight", !form.nameGuess&&"predicted name"].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </GlassCard>
              )
            }
          </div>
        )}

        {/* ══ BOARD ══ */}
        {tab==="leaderboard" && (
          <div style={{ animation:"slideUp .4s ease both" }}>
            {guesses.length===0
              ? (
                <GlassCard>
                  <div style={{ textAlign:"center", padding:"52px 0", color:"rgba(125,200,245,0.45)" }}>
                    <div style={{ marginBottom:14, display:"flex", justifyContent:"center", opacity:0.45 }}><Baby size={54} color="rgba(125,200,245,1)" /></div>
                    <p style={{ fontSize:"1.1rem", fontStyle:"italic" }}>No guesses yet!</p>
                    <p style={{ fontSize:"0.83rem", marginTop:6 }}>Be the first to predict Junior's arrival.</p>
                  </div>
                </GlassCard>
              )
              : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {[...guesses].reverse().map((g,i)=>(
                    <div key={g.id} className="bp-card" style={{
                      background:"rgba(255,255,255,0.038)", border:"1px solid rgba(125,216,255,0.1)",
                      borderRadius:20, padding:"20px 22px", backdropFilter:"blur(14px)",
                      boxShadow:"0 4px 24px rgba(0,0,0,0.28)",
                      borderLeft:`3px solid ${CHIP_COLORS[i % CHIP_COLORS.length]}`,
                      animation:"slideUp .4s ease both", animationDelay:`${i*.04}s`,
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ fontSize:"0.65rem", fontWeight:700, color:CHIP_COLORS[i % CHIP_COLORS.length], background:`${CHIP_COLORS[i % CHIP_COLORS.length]}18`, border:`1px solid ${CHIP_COLORS[i % CHIP_COLORS.length]}40`, borderRadius:6, padding:"2px 7px", letterSpacing:".04em" }}>#{guesses.length - i}</span>
                          <span style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1.22rem", fontWeight:700, color:"#fff" }}>{g.name}</span>
                        </div>
                        <span style={{ fontSize:"0.7rem", color:"rgba(125,200,245,0.38)", fontWeight:500 }}>{new Date(g.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ color:"rgba(160,215,255,0.78)", fontSize:"1rem", lineHeight:1.75, marginBottom:(g.name_guess||g.message)?12:0 }}>
                        Baby{g.name_guess ? <> <strong style={{ color:"#fff", fontStyle:"normal" }}>{g.name_guess}</strong></> : ""} will arrive on{" "}
                        <strong style={{ color:"#fff", fontStyle:"normal" }}>{fmt(g.date)}</strong> at{" "}
                        <strong style={{ color:"#fff", fontStyle:"normal" }}>{fmtT(g.time)}</strong>
                        {g.length
                          ? <>, measuring <strong style={{ color:"#fff", fontStyle:"normal" }}>{g.length}</strong> and weighing <strong style={{ color:"#fff", fontStyle:"normal" }}>{g.weight}</strong></>
                          : <>, weighing <strong style={{ color:"#fff", fontStyle:"normal" }}>{g.weight}</strong></>
                        }.
                      </p>
                      {g.message && (
                        <div>
                          <p style={{ fontSize:"0.7rem", fontWeight:700, color:"rgba(125,200,245,0.55)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>A note from {g.name}:</p>
                          <div style={{ background:"rgba(125,216,255,0.05)", border:"1px solid rgba(125,216,255,0.09)", borderRadius:11, padding:"10px 14px", color:"rgba(155,210,250,0.72)", fontSize:"0.83rem", fontStyle:"italic", lineHeight:1.55 }}>
                            "{g.message}"
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ── FOOTER ── */}
        <p style={{ textAlign:"center", color:"rgba(80,145,205,0.35)", fontSize:"0.7rem", marginTop:52, letterSpacing:".05em", fontWeight:500, textTransform:"uppercase" }}>
          Made with love for Rachel, Joey, and Junior <Heart size={10} color="rgba(80,145,205,0.35)" fill="rgba(80,145,205,0.35)" style={{ display:"inline-block", verticalAlign:"middle" }} />
        </p>

      </div>

      {/* ── FLOATING GEAR BUTTON ── */}
      <button onClick={()=>setAdminOpen(true)}
        style={{ position:"fixed", bottom:24, right:24, zIndex:200, width:44, height:44, borderRadius:"50%", border:"1px solid rgba(125,216,255,0.15)", background:"rgba(6,14,30,0.7)", backdropFilter:"blur(12px)", color:"rgba(125,200,245,0.4)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}
        onMouseEnter={e=>{e.currentTarget.style.color="rgba(125,216,255,0.8)";e.currentTarget.style.borderColor="rgba(125,216,255,0.35)";}}
        onMouseLeave={e=>{e.currentTarget.style.color="rgba(125,200,245,0.4)";e.currentTarget.style.borderColor="rgba(125,216,255,0.15)";}}>
        <Settings size={18} />
      </button>

      {/* ── ADMIN DRAWER ── */}
      {adminOpen && (
        <>
          {/* backdrop */}
          <div onClick={()=>setAdminOpen(false)} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)", animation:"fadeIn .2s ease both" }} />
          {/* drawer */}
          <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:301, maxHeight:"85vh", overflowY:"auto", background:"linear-gradient(180deg,#0a1e3d 0%,#060e1e 100%)", border:"1px solid rgba(125,216,255,0.14)", borderBottom:"none", borderRadius:"24px 24px 0 0", padding:"28px 24px 48px", boxShadow:"0 -8px 48px rgba(0,0,0,0.6)", animation:"drawerUp .3s cubic-bezier(.4,0,.2,1) both" }}>
            {/* drag handle */}
            <div style={{ width:40, height:4, borderRadius:2, background:"rgba(125,216,255,0.18)", margin:"0 auto 24px" }} />

            {!adminOk ? (
              <div>
                <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", color:"#fff", fontSize:"1.75rem", marginBottom:6 }}>Admin Panel</h2>
                <p style={{ color:"rgba(125,200,245,0.48)", fontSize:"0.83rem", marginBottom:20 }}>Authorized personnel only</p>
                <Field label="Password" icon={<KeyRound size={12}/>}>
                  <Input type="password" placeholder="Enter password" value={adminPass} onChange={setAdminPass}
                    onEnter={()=>{ adminPass==="rachel2025" ? setAdminOk(true) : alert("Wrong password!"); }}
                  />
                </Field>
                <button onClick={()=>{ adminPass==="rachel2025" ? setAdminOk(true) : alert("Wrong password!"); }} className="bp-ghost-btn"
                  style={{ marginTop:14, background:"rgba(125,216,255,0.1)", border:"1px solid rgba(125,216,255,0.26)", color:"#7DD8FF", borderRadius:12, padding:"10px 24px", fontFamily:"inherit", fontWeight:600, cursor:"pointer", fontSize:"0.88rem" }}>
                  Unlock →
                </button>
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", color:"#fff", fontSize:"1.75rem", marginBottom:22 }}>Pool Settings</h2>
                <div style={{ display:"grid", gap:16, marginBottom:22 }}>
                  <Field label="Baby's Name (if revealed)" icon={<Sparkles size={12}/>}><Input placeholder="Leave blank for the surprise" value={poolInfo.babyName} onChange={v=>setPoolInfo({...poolInfo,babyName:v})} /></Field>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:30 }}>
                  <button onClick={()=>{ persist(guesses,poolInfo); setSavedMsg(true); setTimeout(()=>setSavedMsg(false),2500); }}
                    style={{ background:"linear-gradient(135deg,#5BC4F5,#1A9FE0)", border:"none", color:"#fff", borderRadius:12, padding:"11px 26px", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:"0.88rem", boxShadow:"0 4px 16px rgba(91,196,245,0.28)", display:"inline-flex", alignItems:"center", gap:8 }}>
                    <Save size={15} />Save Changes
                  </button>
                  {savedMsg && <span style={{ fontSize:"0.82rem", color:"rgba(125,216,255,0.75)", fontWeight:600, animation:"slideUp .3s ease both" }}>Saved!</span>}
                </div>

                <div style={{ borderTop:"1px solid rgba(125,216,255,0.1)", paddingTop:22 }}>
                  <h3 style={{ color:"rgba(125,200,245,0.7)", fontSize:"0.78rem", fontWeight:700, marginBottom:14, textTransform:"uppercase", letterSpacing:".08em" }}>Manage Entries ({guesses.length})</h3>
                  {guesses.length===0
                    ? <p style={{ color:"rgba(100,170,220,0.38)", fontStyle:"italic", fontSize:"0.85rem" }}>No guesses yet.</p>
                    : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {[...guesses].reverse().map(g=>(
                          <div key={g.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(125,216,255,0.04)", border:"1px solid rgba(125,216,255,0.09)", borderRadius:12, padding:"10px 14px", gap:10 }}>
                            <div>
                              <span style={{ fontWeight:700, color:"#fff", fontSize:"0.92rem" }}>{g.name}</span>
                              <span style={{ color:"rgba(100,175,225,0.5)", fontSize:"0.78rem", marginLeft:10 }}>{fmt(g.date)} · {g.weight}</span>
                            </div>
                            {confirmDelete === g.id ? (
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <span style={{ fontSize:"0.73rem", color:"rgba(255,160,160,0.75)", fontWeight:500 }}>Remove?</span>
                                <button onClick={()=>{ delGuess(g.id); setConfirmDelete(null); }}
                                  style={{ background:"rgba(255,90,90,0.22)", border:"1px solid rgba(255,90,90,0.4)", color:"rgba(255,140,140,0.95)", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit", fontSize:"0.73rem", fontWeight:700, transition:"all .2s" }}>Yes</button>
                                <button onClick={()=>setConfirmDelete(null)}
                                  style={{ background:"rgba(125,216,255,0.07)", border:"1px solid rgba(125,216,255,0.18)", color:"rgba(125,200,245,0.65)", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit", fontSize:"0.73rem", fontWeight:600, transition:"all .2s" }}>Cancel</button>
                              </div>
                            ) : (
                              <button className="bp-del" onClick={()=>setConfirmDelete(g.id)}
                                style={{ background:"rgba(255,90,90,0.09)", border:"1px solid rgba(255,90,90,0.18)", color:"rgba(255,130,130,0.7)", borderRadius:8, padding:"4px 12px", cursor:"pointer", fontFamily:"inherit", fontSize:"0.73rem", fontWeight:600, transition:"all .2s" }}>
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                  }
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
