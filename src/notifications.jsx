// ═══════════════════════════════════════════════════════════════
// NOVA CRM — NOTIFICATION SYSTEM
// Paste this entire block right after your imports in App.jsx
// ═══════════════════════════════════════════════════════════════

// ── Notification Rules per Role ───────────────────────────────
// Each role gets notified about different events:
// admin     → everything
// sales     → new leads, stage changes
// designer  → jobs assigned to them, approval results
// mgmt      → approval requests
// factory   → factory orders, production updates

const NOTIF_RULES = {
  admin:    ["new_lead","stage_change","approval_needed","install_upcoming","overdue","factory_update"],
  sales:    ["new_lead","stage_change","install_upcoming","overdue"],
  designer: ["stage_change","approval_result","install_upcoming","overdue"],
  mgmt:     ["approval_needed","stage_change"],
  factory:  ["factory_update","stage_change"],
};

// ── Request Notification Permission ──────────────────────────
async function requestNotifPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

// ── Send a notification ───────────────────────────────────────
function sendNotif(title, body, requireInteraction = false) {
  if (!("serviceWorker" in navigator)) {
    // Fallback: browser notification
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icon-192.png" });
    }
    return;
  }
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage({ type: "NOTIFY", title, body, requireInteraction });
  });
}

// ── Check which notifications to fire for this user/role ──────
function checkAndNotify(oldJobs, newJobs, currentUser) {
  if (!currentUser) return;
  const rules = NOTIF_RULES[currentUser.role] || [];
  const today = new Date().toISOString().slice(0, 10);
  const in3days = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

  newJobs.forEach(newJob => {
    const oldJob = oldJobs.find(j => j.id === newJob.id);

    // 1. New lead added
    if (!oldJob && rules.includes("new_lead")) {
      sendNotif("🆕 New Lead — NOVA CRM", `${newJob.name} added as a new lead (${newJob.source})`);
    }

    if (!oldJob) return;

    // 2. Stage changed
    if (oldJob.stageId !== newJob.stageId && rules.includes("stage_change")) {
      const isMyJob = currentUser.role === "designer" ? newJob.designer === currentUser.name : true;
      if (isMyJob) {
        const stageName = stageObj(newJob.stageId)?.en || newJob.stageId;
        sendNotif("🔄 Stage Updated — NOVA CRM", `${newJob.name} moved to: ${stageName}`);
      }
    }

    // 3. Approval needed (for mgmt)
    if (rules.includes("approval_needed")) {
      const wasNotNeeded = oldJob.approvals?.management_design !== null || !["cust_approval","mgmt_approval"].includes(oldJob.stageId);
      const nowNeeded = newJob.approvals?.management_design === null && ["cust_approval","mgmt_approval"].includes(newJob.stageId);
      if (!wasNotNeeded && nowNeeded) {
        sendNotif("⏳ Approval Required — NOVA CRM", `${newJob.name} needs management approval`, true);
      }
    }

    // 4. Approval result (for designers)
    if (rules.includes("approval_result")) {
      const myJob = newJob.designer === currentUser.name;
      if (myJob) {
        if (oldJob.approvals?.customer_design !== "approved" && newJob.approvals?.customer_design === "approved") {
          sendNotif("✅ Design Approved — NOVA CRM", `${newJob.name}'s design has been approved by customer!`);
        }
        if (oldJob.approvals?.customer_design !== "revision" && newJob.approvals?.customer_design === "revision") {
          sendNotif("⟳ Revision Requested — NOVA CRM", `${newJob.name} requested design revisions`, true);
        }
      }
    }

    // 5. Factory update
    if (oldJob.factoryStatus !== newJob.factoryStatus && rules.includes("factory_update") && newJob.factoryStatus) {
      sendNotif("🏭 Factory Update — NOVA CRM", `${newJob.name}: ${newJob.factoryStatus}`);
    }
  });

  // 6. Installation upcoming (check daily on load)
  if (rules.includes("install_upcoming")) {
    newJobs.forEach(job => {
      if (job.installDate && job.installDate <= in3days && job.installDate >= today) {
        const isMyJob = currentUser.role === "designer" ? job.designer === currentUser.name : true;
        if (isMyJob) {
          sendNotif("📅 Installation Soon — NOVA CRM", `${job.name} installation on ${job.installDate}`, true);
        }
      }
    });
  }

  // 7. Overdue tasks
  if (rules.includes("overdue")) {
    newJobs.forEach(job => {
      if (job.installDate && job.installDate < today && job.stageId !== "aftersales") {
        const isMyJob = currentUser.role === "designer" ? job.designer === currentUser.name : true;
        if (isMyJob) {
          sendNotif("🔴 Overdue — NOVA CRM", `${job.name} has an overdue installation date!`, true);
        }
      }
    });
  }
}

// ── useNotifications Hook ─────────────────────────────────────
// Add this inside your App() component:
//
//   const prevJobsRef = useRef(jobs);
//   useEffect(() => {
//     requestNotifPermission();
//   }, []);
//   useEffect(() => {
//     checkAndNotify(prevJobsRef.current, jobs, auth);
//     prevJobsRef.current = jobs;
//   }, [jobs, auth]);
//
// ─────────────────────────────────────────────────────────────

// ── Install PWA Banner ────────────────────────────────────────
// Add this component anywhere in your JSX to show install prompt:
//
// <InstallBanner />
//
function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setPrompt(e); setShown(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!shown || !prompt) return null;

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:1000,
      background:"#1e1c17", borderTop:"2px solid #c9a84c",
      padding:"14px 20px", display:"flex", alignItems:"center",
      justifyContent:"space-between", gap:12,
      fontFamily:"'Outfit',sans-serif", fontSize:13
    }}>
      <div>
        <div style={{color:"#c9a84c", fontWeight:600, marginBottom:2}}>📱 Install NOVA CRM App</div>
        <div style={{color:"#b0a898", fontSize:12}}>Add to your home screen for notifications & offline access</div>
      </div>
      <div style={{display:"flex", gap:8, flexShrink:0}}>
        <button onClick={()=>setShown(false)} style={{background:"transparent",border:"1px solid #332f24",borderRadius:8,padding:"7px 12px",color:"#726b5e",cursor:"pointer",fontSize:12}}>
          Later
        </button>
        <button onClick={()=>{ prompt.prompt(); prompt.userChoice.then(()=>setShown(false)); }} style={{background:"#c9a84c",border:"none",borderRadius:8,padding:"7px 14px",color:"#000",cursor:"pointer",fontSize:13,fontWeight:600}}>
          Install
        </button>
      </div>
    </div>
  );
}
