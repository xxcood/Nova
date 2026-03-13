import { useState, useReducer, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   NOVA KITCHENS — CRM PRO v4
   ✦ Admin User Management (add/remove/edit users)
   ✦ Strict Role-Based Views (each role sees only their section)
   ✦ Full 10-stage pipeline · Arabic/English · WhatsApp · PDF Quotes
═══════════════════════════════════════════════════════════════════════ */

// ── ROLE DEFINITIONS ─────────────────────────────────────────────────────
const ROLES = {
  admin: {
    label: "Admin", labelAr: "مدير النظام", color: "#c9a84c",
    nav: ["dashboard","jobs","pipeline","approvals","factory","tasks","reports","products","users"],
    canEdit: true, canDelete: true, canApprove: true, canFactory: true,
    seeAllJobs: true, canManageUsers: true,
    desc: "Full system access including user management"
  },
  sales: {
    label: "Sales", labelAr: "مبيعات", color: "#5aaee0",
    nav: ["dashboard","jobs","pipeline","tasks"],
    canEdit: true, canDelete: false, canApprove: false, canFactory: false,
    seeAllJobs: true, canManageUsers: false,
    desc: "Add leads, manage contacts, track pipeline"
  },
  designer: {
    label: "Designer", labelAr: "مصمم", color: "#9b6ce0",
    nav: ["jobs","tasks","products"],
    canEdit: true, canDelete: false, canApprove: false, canFactory: false,
    seeAllJobs: false, canManageUsers: false,
    desc: "View and edit assigned jobs, manage designs"
  },
  mgmt: {
    label: "Management", labelAr: "إدارة", color: "#e0903a",
    nav: ["dashboard","approvals","reports"],
    canEdit: false, canDelete: false, canApprove: true, canFactory: false,
    seeAllJobs: true, canManageUsers: false,
    desc: "Approve designs and budgets, view reports"
  },
  factory: {
    label: "Factory", labelAr: "مصنع", color: "#e05ca0",
    nav: ["factory","tasks"],
    canEdit: false, canDelete: false, canApprove: false, canFactory: true,
    seeAllJobs: true, canManageUsers: false,
    desc: "Manage production orders and factory status"
  },
};

// ── INITIAL USERS (admin can add/remove these) ────────────────────────────
const INITIAL_USERS = [
  { id:"u1", username:"admin",   password:"admin123",   name:"Ahmad Manager",   role:"admin",    avatar:"AM", color:"#3d5c38", active:true },
  { id:"u2", username:"sara",    password:"sara123",    name:"Sara Al-Khatib",  role:"designer", avatar:"SA", color:"#41546a", active:true },
  { id:"u3", username:"omar",    password:"omar123",    name:"Omar Nasser",     role:"designer", avatar:"ON", color:"#5c3b3b", active:true },
  { id:"u4", username:"leila",   password:"leila123",   name:"Leila Haddad",    role:"designer", avatar:"LH", color:"#5c4e3b", active:true },
  { id:"u5", username:"karim",   password:"karim123",   name:"Karim Mansour",   role:"designer", avatar:"KM", color:"#3b5a5c", active:true },
  { id:"u6", username:"sales",   password:"sales123",   name:"Sales Team",      role:"sales",    avatar:"ST", color:"#523b5c", active:true },
  { id:"u7", username:"factory", password:"factory123", name:"Factory Manager", role:"factory",  avatar:"FM", color:"#4a3b5c", active:true },
  { id:"u8", username:"mgmt",    password:"mgmt123",    name:"Management",      role:"mgmt",     avatar:"MG", color:"#3b4a5c", active:true },
];

// ── PIPELINE STAGES ───────────────────────────────────────────────────────
const STAGES = [
  { id:"contact",       en:"First Contact",          ar:"التواصل الأول",        icon:"📞", color:"#5ca8e0",
    visibleTo:["admin","sales","designer","mgmt","factory"],
    editableBy:["admin","sales"],
    tasksEn:["Identify source","Qualify budget","Log customer info","Assign designer"],
    tasksAr:["تحديد المصدر","تحديد الميزانية","تسجيل بيانات العميل","تعيين المصمم"] },
  { id:"measurement",   en:"Measurement Visit",      ar:"زيارة القياس",          icon:"📐", color:"#7ec8e3",
    visibleTo:["admin","sales","designer"],
    editableBy:["admin","sales","designer"],
    tasksEn:["Book site visit","Record dimensions","Note plumbing/electric","Take photos"],
    tasksAr:["حجز الزيارة","تسجيل الأبعاد","ملاحظة السباكة/الكهرباء","التقاط صور"] },
  { id:"design",        en:"Design Creation",        ar:"إنشاء التصميم",         icon:"✏️", color:"#c9a84c",
    visibleTo:["admin","sales","designer","mgmt"],
    editableBy:["admin","designer"],
    tasksEn:["Create 2D floor plan","Render 3D design","Select materials","Prepare design pack"],
    tasksAr:["إنشاء مخطط 2D","تصيير التصميم 3D","اختيار المواد","إعداد حزمة التصميم"] },
  { id:"cust_approval", en:"Customer Approval",      ar:"موافقة العميل",          icon:"👤", color:"#e08c3c",
    visibleTo:["admin","sales","designer","mgmt"],
    editableBy:["admin","sales","mgmt"],
    tasksEn:["Present design","Note revisions","Get written approval","Update if needed"],
    tasksAr:["عرض التصميم","تدوين التعديلات","الحصول على موافقة","التحديث إذا لزم"] },
  { id:"mgmt_approval", en:"Management Approval",    ar:"موافقة الإدارة",         icon:"🏛️", color:"#d4a843",
    visibleTo:["admin","mgmt"],
    editableBy:["admin","mgmt"],
    tasksEn:["Submit to management","Review costings","Get sign-off","Finalize spec"],
    tasksAr:["تقديم للإدارة","مراجعة التكاليف","الحصول على موافقة","إنهاء المواصفات"] },
  { id:"budget",        en:"Budget & Quotation",     ar:"الميزانية والعرض",       icon:"💰", color:"#9c6ce0",
    visibleTo:["admin","sales","mgmt"],
    editableBy:["admin","sales"],
    tasksEn:["Prepare itemized quote","Apply discounts","Send quotation","Follow up"],
    tasksAr:["إعداد عرض مفصل","تطبيق الخصومات","إرسال العرض","المتابعة"] },
  { id:"contract",      en:"Sign Contract",          ar:"توقيع العقد",            icon:"📝", color:"#4caf7d",
    visibleTo:["admin","sales","mgmt"],
    editableBy:["admin","sales"],
    tasksEn:["Prepare contract","Collect deposit 50%","Get signature","Log contract number"],
    tasksAr:["إعداد العقد","تحصيل العربون 50%","الحصول على التوقيع","تسجيل رقم العقد"] },
  { id:"factory",       en:"Factory / Production",   ar:"المصنع / الإنتاج",       icon:"🏭", color:"#e05ca0",
    visibleTo:["admin","factory","mgmt"],
    editableBy:["admin","factory"],
    tasksEn:["Send production order","Confirm factory receipt","Track production","QC check"],
    tasksAr:["إرسال أمر الإنتاج","تأكيد استلام المصنع","متابعة الإنتاج","فحص الجودة"] },
  { id:"installation",  en:"Delivery & Installation",ar:"التسليم والتركيب",        icon:"🔧", color:"#4caf7d",
    visibleTo:["admin","sales","factory"],
    editableBy:["admin","sales","factory"],
    tasksEn:["Schedule delivery","Confirm install team","Complete installation","Customer sign-off"],
    tasksAr:["جدولة التسليم","تأكيد فريق التركيب","إتمام التركيب","توقيع العميل"] },
  { id:"aftersales",    en:"After-Sales",             ar:"ما بعد البيع",           icon:"⭐", color:"#c9a84c",
    visibleTo:["admin","sales","mgmt"],
    editableBy:["admin","sales"],
    tasksEn:["Send satisfaction survey","Log snagging","Issue warranty cert","Request review"],
    tasksAr:["إرسال استبيان","تسجيل المشكلات","إصدار شهادة الضمان","طلب تقييم"] },
];
const STAGE_IDS = STAGES.map(s=>s.id);
const SOURCES = ["Walk-In","Referral","Website","Instagram","Facebook","Phone","Exhibition","Google Ads","Partner"];
const STYLES = ["Modern","Classic","Contemporary","Rustic","Industrial","Minimalist","Traditional","Bespoke"];
const DESIGNERS_LIST = ["Sara Al-Khatib","Omar Nasser","Leila Haddad","Karim Mansour"];
const FACTORY_STATUSES = ["Order Sent","Confirmed","In Production","QC Check","Ready for Delivery","Delivered"];
const AV_COLORS = ["#3d5c38","#3b506b","#5c3b3b","#5c4e3b","#3b5a5c","#523b5c","#4a3b5c","#3b4a5c"];
const ROLE_AVATAR_COLORS = { admin:"#8a6f2e", sales:"#2e5c8a", designer:"#5c2e8a", mgmt:"#8a4a2e", factory:"#2e8a5c" };

const mkApprovals = () => ({ customer_design:null, management_design:null, customer_budget:null, management_budget:null, contract_signed:false, deposit_received:false });

// ── SEED JOBS ─────────────────────────────────────────────────────────────
const SEED_JOBS = [
  { id:1, name:"Ahmad Al-Rashid", phone:"+962791234567", email:"ahmad@email.com", address:"Abdoun, Amman", source:"Referral", style:"Modern", priority:"High", budget:18500, finalQuote:17800, deposit:8900, stageId:"installation", designer:"Sara Al-Khatib", notes:"Prefers white lacquer. Island with seating.", measureDate:"2026-02-10", measureNotes:"4.2m x 3.8m. Gas on north wall.", designFile:"KIT-2026-041-3D.pdf", quoteNo:"Q-2026-041", contractNo:"C-2026-019", factoryOrderNo:"FAC-2026-088", factoryStatus:"In Production", installDate:"2026-03-18", warrantyMonths:24, approvals:{ customer_design:"approved", management_design:"approved", customer_budget:"approved", management_budget:"approved", contract_signed:true, deposit_received:true }, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:4,contract:4,factory:3,installation:1,aftersales:0}, createdAt:"2026-01-15", lastActivity:"2026-03-08", activityLog:[{id:"a1",date:"2026-03-08",text:"Installation scheduled",user:"Ahmad Manager"}] },
  { id:2, name:"Mona Khalil", phone:"+962772345678", email:"mona.k@mail.com", address:"Swefieh, Amman", source:"Instagram", style:"Classic", priority:"High", budget:12000, finalQuote:11500, deposit:null, stageId:"budget", designer:"Omar Nasser", notes:"Wants marble countertops.", measureDate:"2026-02-25", measureNotes:"3.6m x 2.9m. U-shape.", designFile:"KIT-2026-047-3D.pdf", quoteNo:"Q-2026-047", contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, approvals:{ customer_design:"approved", management_design:"approved", customer_budget:null, management_budget:"approved", contract_signed:false, deposit_received:false }, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:2,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-01", lastActivity:"2026-03-07", activityLog:[{id:"b1",date:"2026-03-07",text:"Quote sent",user:"Omar Nasser"}] },
  { id:3, name:"Tariq Hussain", phone:"+962783456789", email:"tariq.h@email.jo", address:"Gardens, Amman", source:"Walk-In", style:"Contemporary", priority:"Medium", budget:9500, finalQuote:null, deposit:null, stageId:"design", designer:"Leila Haddad", notes:"Open-plan preference.", measureDate:"2026-03-02", measureNotes:"5.1m x 4.0m open plan.", designFile:null, quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, approvals:mkApprovals(), completedTasks:{contact:4,measurement:4,design:1,cust_approval:0,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-20", lastActivity:"2026-03-05", activityLog:[{id:"c1",date:"2026-03-05",text:"Measurement completed",user:"Leila Haddad"}] },
  { id:4, name:"Rana Aziz", phone:"+962794567890", email:"rana@home.com", address:"Dabouq, Amman", source:"Website", style:"Minimalist", priority:"Medium", budget:22000, finalQuote:null, deposit:null, stageId:"measurement", designer:"Karim Mansour", notes:"High-end project.", measureDate:"2026-03-13", measureNotes:null, designFile:null, quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, approvals:mkApprovals(), completedTasks:{contact:4,measurement:0,design:0,cust_approval:0,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-03-08", lastActivity:"2026-03-08", activityLog:[{id:"d1",date:"2026-03-08",text:"Lead created from website",user:"Sales Team"}] },
  { id:5, name:"Sami Qasim", phone:"+962775678901", email:"sami.q@email.com", address:"Khalda, Amman", source:"Referral", style:"Modern", priority:"High", budget:31000, finalQuote:30500, deposit:15250, stageId:"aftersales", designer:"Sara Al-Khatib", notes:"Installation complete. Very satisfied.", measureDate:"2025-12-01", measureNotes:"6.0m x 4.5m.", designFile:"KIT-2026-018-3D.pdf", quoteNo:"Q-2026-018", contractNo:"C-2026-005", factoryOrderNo:"FAC-2026-022", factoryStatus:"Delivered", installDate:"2026-02-15", warrantyMonths:24, approvals:{ customer_design:"approved", management_design:"approved", customer_budget:"approved", management_budget:"approved", contract_signed:true, deposit_received:true }, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:4,contract:4,factory:4,installation:4,aftersales:2}, createdAt:"2025-11-20", lastActivity:"2026-03-01", activityLog:[{id:"e1",date:"2026-03-01",text:"Satisfaction survey sent",user:"Ahmad Manager"}] },
  { id:6, name:"Faris Al-Omari", phone:"+962797890123", email:"faris@omari.jo", address:"Jubeiha, Amman", source:"Phone", style:"Rustic", priority:"Medium", budget:15000, finalQuote:null, deposit:null, stageId:"cust_approval", designer:"Leila Haddad", notes:"Farmhouse style. Wants solid wood.", measureDate:"2026-02-28", measureNotes:"4.8m x 3.2m.", designFile:"KIT-2026-052-DRAFT.pdf", quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, approvals:{ customer_design:null, management_design:"approved", customer_budget:null, management_budget:null, contract_signed:false, deposit_received:false }, completedTasks:{contact:4,measurement:4,design:4,cust_approval:1,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-10", lastActivity:"2026-03-06", activityLog:[{id:"f1",date:"2026-03-06",text:"Design presented",user:"Leila Haddad"}] },
];

// ── HELPERS ───────────────────────────────────────────────────────────────
const initials = n => n.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
const fmt = n => n ? `JD ${Number(n).toLocaleString()}` : "—";
const fmtD = d => { if(!d) return "—"; return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); };
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const stageIdx = id => STAGE_IDS.indexOf(id);
const stageObj = id => STAGES.find(s=>s.id===id);
const completionPct = ct => Math.round(Object.values(ct).reduce((a,b)=>a+b,0)/(STAGES.length*4)*100);
const SBADGE = { contact:"b-blue",measurement:"b-blue",design:"b-gold",cust_approval:"b-orange",mgmt_approval:"b-orange",budget:"b-purple",contract:"b-green",factory:"b-pink",installation:"b-green",aftersales:"b-gold" };

// ── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Tajawal:wght@300;400;500;700&family=Outfit:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0c0a;--sf:#171510;--sf2:#1e1c17;--sf3:#252218;
  --b:#2a261e;--b2:#332f24;
  --gold:#c9a84c;--gold2:#a88535;--gg:rgba(201,168,76,.13);--gd:#6b5520;
  --cr:#ede8dc;--cr2:#b0a898;--cr3:#726b5e;
  --green:#4db87a;--red:#e05555;--blue:#5aaee0;--orange:#e0903a;--purple:#9b6ce0;--pink:#e05ca0;
  --fd:'Cormorant Garamond',serif;--fb:'Outfit',sans-serif;--fa:'Tajawal',sans-serif;
  --r:10px;--tr:0.18s ease;
}
body{background:var(--bg);color:var(--cr);font-family:var(--fb);font-size:13px;line-height:1.5}
body.rtl{direction:rtl;font-family:var(--fa)}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:4px}

/* Login */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden}
.login-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(201,168,76,.06) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(90,174,224,.04) 0%,transparent 50%)}
.login-card{background:var(--sf);border:1px solid var(--b2);border-radius:16px;padding:40px;width:400px;max-width:95vw;position:relative;z-index:1}
.login-logo{font-family:var(--fd);font-size:28px;color:var(--gold);text-align:center;margin-bottom:3px}
.login-sub{font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:var(--cr3);text-align:center;margin-bottom:28px}
.login-err{background:rgba(224,85,85,.12);border:1px solid rgba(224,85,85,.3);border-radius:8px;padding:9px 14px;font-size:12.5px;color:var(--red);margin-bottom:12px;text-align:center}
.quick-login{margin-top:18px;padding-top:16px;border-top:1px solid var(--b)}
.quick-title{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--cr3);margin-bottom:8px;text-align:center}
.q-chip{display:inline-flex;align-items:center;gap:6px;background:var(--sf2);border:1px solid var(--b);border-radius:20px;padding:4px 10px;font-size:11px;color:var(--cr2);cursor:pointer;transition:var(--tr);margin:3px}
.q-chip:hover{border-color:var(--gd);color:var(--cr)}
.role-pill{display:inline-block;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}

/* App */
.app{display:flex;height:100vh;overflow:hidden}
.sb{width:224px;min-width:224px;background:var(--sf);border-right:1px solid var(--b);display:flex;flex-direction:column;overflow-y:auto}
.rtl .sb{border-right:none;border-left:1px solid var(--b)}
.sb-logo{padding:18px 16px 14px;border-bottom:1px solid var(--b)}
.sb-logo-name{font-family:var(--fd);font-size:20px;color:var(--gold)}
.rtl .sb-logo-name{font-family:var(--fa)}
.sb-logo-sub{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:var(--cr3);margin-top:2px}
.rtl .sb-logo-sub{letter-spacing:0;font-size:10px}
.sb-user{padding:11px 14px;border-bottom:1px solid var(--b);background:var(--sf2);display:flex;align-items:center;gap:9px}
.sb-user-name{font-size:12px;font-weight:600;color:var(--cr)}
.sb-user-role{font-size:10px;color:var(--cr3)}
.sb-nav{padding:10px 8px 0;flex:1}
.sb-section-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.16em;color:var(--gd);padding:0 8px;margin:10px 0 5px}
.rtl .sb-section-lbl{letter-spacing:0;font-size:10px}
.sb-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;color:var(--cr2);font-size:12.5px;transition:var(--tr);user-select:none}
.rtl .sb-item{flex-direction:row-reverse;text-align:right}
.sb-item:hover{background:var(--sf2);color:var(--cr)}
.sb-item.on{background:var(--gg);color:var(--gold)}
.sb-item .ico{width:18px;text-align:center;font-size:14px;flex-shrink:0}
.sb-badge{margin-left:auto;background:var(--gold);color:#000;font-size:10px;font-weight:700;border-radius:20px;padding:1px 6px}
.rtl .sb-badge{margin-left:0;margin-right:auto}
.sb-badge.red{background:var(--red);color:#fff}
.sb-bottom{padding:10px 8px;border-top:1px solid var(--b)}

/* Main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{background:var(--sf);border-bottom:1px solid var(--b);height:52px;padding:0 20px;display:flex;align-items:center;gap:10px;flex-shrink:0}
.topbar-title{font-family:var(--fd);font-size:20px;color:var(--cr);flex:1}
.rtl .topbar-title{font-family:var(--fa);font-size:18px}
.content{flex:1;overflow-y:auto;padding:18px}

/* Role banner */
.role-banner{padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:12.5px;display:flex;align-items:center;gap:10px;border:1px solid}

/* Buttons */
.btn{padding:6px 13px;border-radius:8px;border:none;cursor:pointer;font-family:var(--fb);font-size:12.5px;font-weight:500;transition:var(--tr);display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.rtl .btn{font-family:var(--fa)}
.btn-gold{background:var(--gold);color:#000}.btn-gold:hover{background:#d4b460}
.btn-ghost{background:var(--sf2);color:var(--cr2);border:1px solid var(--b)}.btn-ghost:hover{color:var(--cr);border-color:var(--b2)}
.btn-green{background:rgba(77,184,122,.14);color:var(--green);border:1px solid rgba(77,184,122,.3)}.btn-green:hover{background:rgba(77,184,122,.24)}
.btn-red{background:rgba(224,85,85,.12);color:var(--red);border:1px solid rgba(224,85,85,.25)}.btn-red:hover{background:rgba(224,85,85,.2)}
.btn-blue{background:rgba(90,174,224,.12);color:var(--blue);border:1px solid rgba(90,174,224,.25)}
.btn-wa{background:rgba(37,211,102,.12);color:#25d366;border:1px solid rgba(37,211,102,.28)}
.btn-sm{padding:4px 10px;font-size:11.5px}
.btn-xs{padding:2px 8px;font-size:11px}

/* Cards */
.card{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:16px}
.card-title{font-family:var(--fd);font-size:16px;color:var(--cr);margin-bottom:13px}
.rtl .card-title{font-family:var(--fa);font-size:15px}

/* Stats */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.stat{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:14px;position:relative;overflow:hidden}
.stat::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--gold))}
.stat-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--cr3)}
.stat-val{font-family:var(--fd);font-size:26px;color:var(--cr);margin:3px 0 1px}
.stat-ico{position:absolute;right:12px;top:12px;font-size:20px;opacity:.18}

/* Table */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th{padding:9px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;letter-spacing:.09em;color:var(--gd);font-weight:500;border-bottom:1px solid var(--b);white-space:nowrap}
.rtl th{text-align:right;letter-spacing:0}
td{padding:9px 10px;border-bottom:1px solid rgba(42,38,30,.5);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr.clk:hover td{background:rgba(201,168,76,.03);cursor:pointer}
.td-name{font-weight:500;color:var(--cr);font-size:13px}
.td-sub{font-size:10.5px;color:var(--cr3);margin-top:1px}

/* Badges */
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap}
.b-blue{background:rgba(90,174,224,.14);color:var(--blue)}
.b-gold{background:rgba(201,168,76,.14);color:var(--gold)}
.b-orange{background:rgba(224,144,58,.14);color:var(--orange)}
.b-green{background:rgba(77,184,122,.14);color:var(--green)}
.b-red{background:rgba(224,85,85,.14);color:var(--red)}
.b-purple{background:rgba(155,108,224,.14);color:var(--purple)}
.b-pink{background:rgba(224,92,160,.14);color:var(--pink)}
.b-grey{background:rgba(112,104,94,.14);color:var(--cr3)}

/* Stage track */
.stage-track{display:flex;gap:0;margin-bottom:14px;border-radius:8px;overflow:hidden;border:1px solid var(--b)}
.stage-step{flex:1;padding:7px 3px;text-align:center;font-size:8.5px;font-weight:600;text-transform:uppercase;cursor:pointer;transition:var(--tr);border-right:1px solid var(--b)}
.stage-step:last-child{border-right:none}
.stage-step:hover{filter:brightness(1.15)}
.stage-step-icon{font-size:13px;display:block;margin-bottom:2px}

/* Job layout */
.job-layout{display:grid;grid-template-columns:1fr 298px;gap:13px}
.stage-panel{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);overflow:hidden}
.stage-panel-head{padding:13px 15px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:10px}
.stage-panel-body{padding:15px}
.checklist{display:flex;flex-direction:column;gap:5px;margin-bottom:13px}
.check-item{display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;background:var(--sf2);border:1px solid var(--b);cursor:pointer;transition:var(--tr)}
.check-item:hover{border-color:var(--b2)}
.check-item.done{border-color:rgba(77,184,122,.3);background:rgba(77,184,122,.06)}
.check-box{width:17px;height:17px;border-radius:5px;border:1.5px solid var(--b2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;transition:var(--tr)}
.check-item.done .check-box{background:var(--green);border-color:var(--green);color:#fff}
.check-lbl{font-size:12.5px;color:var(--cr2);flex:1}
.check-item.done .check-lbl{color:var(--cr3);text-decoration:line-through}
.locked-stage{background:rgba(42,38,30,.4);border-radius:8px;padding:14px;text-align:center;font-size:12.5px;color:var(--cr3);margin-top:10px}

/* Info panel */
.cust-side{display:flex;flex-direction:column;gap:10px}
.info-blk{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:13px}
.info-ttl{font-size:9.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--gd);margin-bottom:9px}
.info-row{display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid rgba(42,38,30,.4);font-size:12.5px;gap:8px}
.info-row:last-child{border-bottom:none}
.info-key{color:var(--cr3);white-space:nowrap;flex-shrink:0}
.info-val{color:var(--cr);font-weight:500;text-align:right;word-break:break-word}
.gold-val{color:var(--gold);font-weight:600}

/* Approval */
.appr-card{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:10px 12px}
.appr-card.approved{border-color:rgba(77,184,122,.35);background:rgba(77,184,122,.07)}
.appr-card.revision{border-color:rgba(224,85,85,.35);background:rgba(224,85,85,.07)}
.appr-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--cr3);margin-bottom:5px}
.appr-status{font-size:12.5px;font-weight:600;margin-bottom:6px}
.appr-btns{display:flex;gap:5px;flex-wrap:wrap}

/* Activity log */
.act-log{display:flex;flex-direction:column}
.act-item{display:flex;gap:9px;padding:8px 0;border-bottom:1px solid rgba(42,38,30,.4)}
.act-item:last-child{border-bottom:none}
.act-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0;margin-top:5px}
.act-text{font-size:12px;color:var(--cr2);flex:1;line-height:1.5}
.act-meta{font-size:10.5px;color:var(--cr3);margin-top:1px}

/* Modal */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px);animation:fi .15s ease}
@keyframes fi{from{opacity:0}to{opacity:1}}
.modal{background:var(--sf);border:1px solid var(--b2);border-radius:14px;padding:24px;width:560px;max-width:96vw;max-height:92vh;overflow-y:auto;animation:su .2s ease}
.modal-lg{width:700px}
@keyframes su{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
.modal-title{font-family:var(--fd);font-size:20px;color:var(--gold);margin-bottom:16px}
.modal-foot{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--b)}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.fg-full{grid-column:1/-1}
.field{display:flex;flex-direction:column;gap:4px}
.field label{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--cr3)}
.field input,.field select,.field textarea{background:var(--sf2);border:1px solid var(--b);border-radius:7px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;transition:var(--tr);width:100%}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--gold2);box-shadow:0 0 0 3px var(--gg)}
.field textarea{resize:vertical;min-height:68px}
select option{background:var(--sf2)}

/* User management */
.user-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.user-card{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:14px;position:relative;transition:var(--tr)}
.user-card:hover{border-color:var(--b2)}
.user-card.inactive{opacity:.5}
.user-card-actions{position:absolute;top:10px;right:10px;display:flex;gap:5px}
.user-role-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:10.5px;font-weight:600;margin-top:6px}

/* Pipeline */
.kanban-wrap{overflow-x:auto;padding-bottom:8px}
.kanban{display:grid;gap:9px}
.kanban-col{background:var(--sf);border:1px solid var(--b);border-radius:var(--r)}
.kanban-head{padding:9px 10px;border-bottom:1px solid var(--b)}
.kanban-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}
.kanban-cnt{font-size:10px;background:var(--sf2);border-radius:20px;padding:1px 6px;color:var(--cr3)}
.kanban-cards{padding:8px;display:flex;flex-direction:column;gap:6px;min-height:60px}
.k-card{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:8px;cursor:pointer;transition:var(--tr)}
.k-card:hover{border-color:var(--b2);transform:translateY(-1px)}

/* Progress */
.prog{height:4px;border-radius:4px;background:var(--b);overflow:hidden;margin-top:4px}
.prog-fill{height:100%;border-radius:4px;transition:width .4s ease}

/* Search */
.search-in{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:7px 11px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;width:190px;transition:var(--tr)}
.search-in:focus{border-color:var(--gold2);width:230px}
.filter-sel{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none}

/* Toast */
.toast{position:fixed;bottom:20px;right:20px;z-index:999;background:var(--sf);border:1px solid var(--b);border-left:3px solid var(--gold);border-radius:8px;padding:10px 15px;font-size:12.5px;color:var(--cr);box-shadow:0 6px 24px rgba(0,0,0,.5);animation:tri .25s ease;max-width:300px}
@keyframes tri{from{transform:translateX(50px);opacity:0}to{transform:none;opacity:1}}

/* Misc */
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}
.empty{text-align:center;padding:32px 20px;color:var(--cr3);font-size:12.5px}
.empty .ei{font-size:26px;margin-bottom:8px}
.two-col{display:grid;grid-template-columns:1fr 298px;gap:14px}
.inline-field{display:flex;gap:6px;align-items:center}
.inline-field input,.inline-field select{flex:1;background:var(--sf2);border:1px solid var(--b);border-radius:7px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;transition:var(--tr)}
.inline-field input:focus,.inline-field select:focus{border-color:var(--gold2)}
.divider{height:1px;background:var(--b);margin:12px 0}
.wa-preview{background:var(--sf2);border:1px solid var(--b);border-radius:12px;padding:14px;margin:10px 0;font-size:13px;color:var(--cr2);line-height:1.7;white-space:pre-wrap;border-left:3px solid #25d366}
.quote-preview{background:#fff;color:#1a1a1a;border-radius:8px;padding:28px;font-family:'Outfit',sans-serif}
.qi-row{display:grid;grid-template-columns:2fr 50px 80px 100px 28px;gap:6px;align-items:center;margin-bottom:6px}
.qi-input{background:var(--sf2);border:1px solid var(--b);border-radius:6px;padding:6px 8px;color:var(--cr);font-family:var(--fb);font-size:12px;outline:none;width:100%}
.qi-input:focus{border-color:var(--gold2)}

@media(max-width:900px){
  .sb{width:180px;min-width:180px}
  .stats-row{grid-template-columns:repeat(2,1fr)}
  .two-col,.job-layout{grid-template-columns:1fr}
  .user-grid{grid-template-columns:repeat(2,1fr)}
}
`;

// ── REDUCER ───────────────────────────────────────────────────────────────
function reducer(s, a) {
  const mkLog = (text, user) => ({ id:uid(), date:new Date().toISOString().slice(0,10), text, user:user||"System" });
  switch(a.type) {
    case "VIEW": return {...s, view:a.v, sel:null};
    case "SEL":  return {...s, sel:a.id, view:"job"};
    case "MODAL": return {...s, modal:a.modal, mdata:a.data||null};
    case "CLM":  return {...s, modal:null, mdata:null};
    case "LANG": return {...s, lang:s.lang==="en"?"ar":"en"};
    case "SEARCH": return {...s, search:a.v};
    case "FILTER": return {...s, filter:a.v};
    case "TOAST": return {...s, toast:a.msg};
    case "CTST": return {...s, toast:null};

    // Jobs
    case "ADD_JOB": {
      const j = {...a.job, id:uid(), createdAt:new Date().toISOString().slice(0,10), lastActivity:new Date().toISOString().slice(0,10), stageId:"contact", approvals:mkApprovals(), activityLog:[mkLog("Job created — "+a.job.source, a.user)], completedTasks:{contact:0,measurement:0,design:0,cust_approval:0,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, finalQuote:null, deposit:null, quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, designFile:null };
      return {...s, jobs:[j,...s.jobs], modal:null, toast:"✦ New job: "+j.name};
    }
    case "UPD_JOB": {
      return {...s, jobs:s.jobs.map(j=>j.id===a.job.id?{...j,...a.job}:j), modal:null, toast:"Job updated"};
    }
    case "DEL_JOB": return {...s, jobs:s.jobs.filter(j=>j.id!==a.id), sel:null, view:"jobs", toast:"Job deleted"};
    case "ADV_STAGE": {
      const j=s.jobs.find(x=>x.id===a.id); const idx=stageIdx(j.stageId);
      if(idx>=STAGE_IDS.length-1) return s;
      const ns=STAGE_IDS[idx+1];
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,stageId:ns,lastActivity:new Date().toISOString().slice(0,10),activityLog:[mkLog(`Advanced to: ${stageObj(ns)?.en}`,a.user),...(x.activityLog||[])]}:x);
      return {...s,jobs,toast:`→ ${stageObj(ns)?.en}`};
    }
    case "SET_STAGE": {
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,stageId:a.stage,lastActivity:new Date().toISOString().slice(0,10),activityLog:[mkLog(`Stage → ${stageObj(a.stage)?.en}`,a.user),...(x.activityLog||[])]}:x);
      return {...s,jobs,toast:`Stage → ${stageObj(a.stage)?.en}`};
    }
    case "TOGGLE_TASK": {
      const j=s.jobs.find(x=>x.id===a.id); const cur=j.completedTasks[a.stage]||0;
      const max=stageObj(a.stage).tasksEn.length; const next=a.idx<cur?cur-1:Math.min(cur+1,max);
      return {...s,jobs:s.jobs.map(x=>x.id===a.id?{...x,completedTasks:{...x.completedTasks,[a.stage]:next}}:x)};
    }
    case "SET_APPR": {
      const l=mkLog(`${a.key.replace(/_/g," ")} → ${a.val}`,a.user);
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,approvals:{...x.approvals,[a.key]:a.val},activityLog:[l,...(x.activityLog||[])],lastActivity:l.date}:x);
      return {...s,jobs,toast:"Approval updated"};
    }
    case "ADD_LOG": {
      const l=mkLog(a.text,a.user);
      return {...s,jobs:s.jobs.map(x=>x.id===a.id?{...x,activityLog:[l,...(x.activityLog||[])],lastActivity:l.date}:x),modal:null,toast:"Note added"};
    }
    case "UPD_FIELD": {
      const l=mkLog(`${a.field} updated`,a.user);
      return {...s,jobs:s.jobs.map(x=>x.id===a.id?{...x,[a.field]:a.val,activityLog:[l,...(x.activityLog||[])],lastActivity:l.date}:x),toast:"Saved ✓"};
    }

    // Users (admin only)
    case "ADD_USER": {
      const u = {...a.user, id:uid(), active:true };
      return {...s, users:[...s.users, u], modal:null, toast:"User added: "+u.name};
    }
    case "UPD_USER": {
      return {...s, users:s.users.map(u=>u.id===a.user.id?{...u,...a.user}:u), modal:null, toast:"User updated"};
    }
    case "TOGGLE_USER": {
      const users=s.users.map(u=>u.id===a.id?{...u,active:!u.active}:u);
      const u=users.find(x=>x.id===a.id);
      return {...s, users, toast:`${u.name} ${u.active?"activated":"deactivated"}`};
    }
    case "DEL_USER": {
      if(a.id==="u1") return {...s, toast:"Cannot delete the main admin!"};
      return {...s, users:s.users.filter(u=>u.id!==a.id), modal:null, toast:"User removed"};
    }

    default: return s;
  }
}

// ── APP ROOT ──────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null);
  const [state, dispatch] = useReducer(reducer, {
    jobs: SEED_JOBS, users: INITIAL_USERS,
    view:"dashboard", sel:null, modal:null, mdata:null,
    search:"", filter:"all", toast:null, lang:"en"
  });
  const { jobs, users, view, sel, modal, mdata, search, filter, toast, lang } = state;
  const rtl = lang==="ar";
  const d = useCallback(a=>dispatch(a),[]);

  useEffect(()=>{if(toast){const t=setTimeout(()=>d({type:"CTST"}),3000);return()=>clearTimeout(t);}},[toast]);

  if(!auth) return <LoginScreen users={users} lang={lang} rtl={rtl} onLogin={u=>setAuth(u)} onLang={()=>d({type:"LANG"})} />;

  const role = ROLES[auth.role];
  const perm = role;

  // Filter jobs by role
  const visJobs = perm.seeAllJobs
    ? jobs
    : jobs.filter(j => j.designer === auth.name);

  const filtered = visJobs.filter(j=>{
    const q=search.toLowerCase();
    const mq=!q||j.name.toLowerCase().includes(q)||j.phone.includes(q);
    const mf=filter==="all"||j.stageId===filter;
    return mq&&mf;
  });

  const selJob = jobs.find(j=>j.id===sel);
  const pendAppr = visJobs.filter(j=>j.approvals&&(j.approvals.customer_design===null||j.approvals.management_design===null)&&["cust_approval","mgmt_approval"].includes(j.stageId)).length;
  const factCount = visJobs.filter(j=>j.stageId==="factory").length;
  const totalRev = visJobs.filter(j=>["contract","factory","installation","aftersales"].includes(j.stageId)).reduce((s,j)=>s+(j.finalQuote||j.budget||0),0);

  // Nav items based on role
  const NAV_DEFS = [
    {v:"dashboard", ico:"◈",  label:"Dashboard",       labelAr:"لوحة التحكم"},
    {v:"jobs",      ico:"⊕",  label:"All Jobs",         labelAr:"جميع المشاريع", badge:visJobs.filter(j=>j.stageId==="contact").length||null},
    {v:"pipeline",  ico:"⋮⋮⋮",label:"Pipeline",         labelAr:"خط المبيعات"},
    {v:"approvals", ico:"✦",  label:"Approvals",        labelAr:"الموافقات", badge:pendAppr||null, red:true},
    {v:"factory",   ico:"🏭", label:"Factory",          labelAr:"المصنع", badge:factCount||null},
    {v:"tasks",     ico:"✓",  label:"Tasks",            labelAr:"المهام"},
    {v:"reports",   ico:"▦",  label:"Reports",          labelAr:"التقارير"},
    {v:"products",  ico:"◻",  label:"Products",         labelAr:"المنتجات"},
    {v:"users",     ico:"👥", label:"User Management",  labelAr:"إدارة المستخدمين"},
  ];
  const navItems = NAV_DEFS.filter(n => role.nav.includes(n.v));

  return (
    <>
      <style>{CSS}</style>
      <div className="app" style={{direction:rtl?"rtl":"ltr"}}>
        {/* Sidebar */}
        <nav className={`sb${rtl?" rtl":""}`}>
          <div className="sb-logo">
            <div className="sb-logo-name">✦ NOVA Kitchens</div>
            <div className="sb-logo-sub">CRM Pro</div>
          </div>
          <div className="sb-user">
            <div className="av" style={{width:30,height:30,background:ROLE_AVATAR_COLORS[auth.role]||"#555",fontSize:10,color:"#fff"}}>{auth.avatar}</div>
            <div>
              <div className="sb-user-name">{auth.name}</div>
              <div className="sb-user-role">{rtl ? ROLES[auth.role].labelAr : ROLES[auth.role].label}</div>
            </div>
          </div>
          <div className="sb-nav">
            {navItems.map(n=>(
              <div key={n.v} className={`sb-item${(view===n.v||(view==="job"&&n.v==="jobs"))?" on":""}`} onClick={()=>d({type:"VIEW",v:n.v})}>
                <span className="ico">{n.ico}</span>
                {rtl?n.labelAr:n.label}
                {n.badge?<span className={`sb-badge${n.red?" red":""}`}>{n.badge}</span>:null}
              </div>
            ))}
          </div>
          <div className="sb-bottom">
            <div className="sb-item" onClick={()=>d({type:"LANG"})}>
              <span className="ico">🌐</span>{rtl?"English":"عربي"}
            </div>
            <div className="sb-item" onClick={()=>setAuth(null)}>
              <span className="ico">→</span>{rtl?"خروج":"Sign Out"}
            </div>
          </div>
        </nav>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">
              {(NAV_DEFS.find(n=>n.v===view)||{label:selJob?.name||"",labelAr:selJob?.name||""})[rtl?"labelAr":"label"]}
            </div>
            {view==="jobs"&&<>
              <input className="search-in" placeholder="🔍 Search…" value={search} onChange={e=>d({type:"SEARCH",v:e.target.value})} />
              <select className="filter-sel" value={filter} onChange={e=>d({type:"FILTER",v:e.target.value})}>
                <option value="all">All Stages</option>
                {STAGES.filter(s=>s.visibleTo.includes(auth.role)).map(s=><option key={s.id} value={s.id}>{s.en}</option>)}
              </select>
            </>}
            {(view==="jobs"||view==="dashboard")&&perm.canEdit&&<button className="btn btn-gold" onClick={()=>d({type:"MODAL",modal:"add"})}>+ New Job</button>}
            {view==="job"&&selJob&&<>
              {perm.canEdit&&<button className="btn btn-ghost btn-sm" onClick={()=>d({type:"MODAL",modal:"edit",data:selJob})}>Edit</button>}
              <button className="btn btn-ghost btn-sm" onClick={()=>d({type:"MODAL",modal:"note",data:{id:selJob.id}})}>+ Note</button>
              <button className="btn btn-wa btn-sm" onClick={()=>d({type:"MODAL",modal:"wa",data:selJob})}>💬 WhatsApp</button>
              {perm.canEdit&&<button className="btn btn-blue btn-sm" onClick={()=>d({type:"MODAL",modal:"quote",data:selJob})}>📄 Quote</button>}
              {stageIdx(selJob.stageId)<STAGE_IDS.length-1&&perm.canEdit&&<button className="btn btn-gold btn-sm" onClick={()=>d({type:"ADV_STAGE",id:selJob.id,user:auth.name})}>Advance →</button>}
            </>}
            {view==="users"&&perm.canManageUsers&&<button className="btn btn-gold" onClick={()=>d({type:"MODAL",modal:"addUser"})}>+ Add User</button>}
          </div>

          <div className="content">
            {/* Role banner for non-admin */}
            {auth.role!=="admin"&&view!=="job"&&(
              <div className="role-banner" style={{background:`${ROLE_AVATAR_COLORS[auth.role]}18`,borderColor:`${ROLE_AVATAR_COLORS[auth.role]}40`,color:ROLE_AVATAR_COLORS[auth.role]}}>
                <span style={{fontSize:16}}>{{sales:"💼",designer:"✏️",mgmt:"🏛️",factory:"🏭"}[auth.role]}</span>
                <div>
                  <strong>{ROLES[auth.role].label} View</strong>
                  <span style={{fontSize:11.5,marginLeft:8,opacity:.8}}>{ROLES[auth.role].desc}</span>
                </div>
              </div>
            )}
            {view==="dashboard"&&<Dashboard jobs={visJobs} totalRev={totalRev} pendAppr={pendAppr} factCount={factCount} dispatch={d} auth={auth} role={role} />}
            {view==="jobs"&&<JobsTable jobs={filtered} dispatch={d} auth={auth} perm={perm} />}
            {view==="job"&&selJob&&<JobDetail job={selJob} dispatch={d} auth={auth} perm={perm} />}
            {view==="pipeline"&&<Pipeline jobs={visJobs} dispatch={d} auth={auth} />}
            {view==="approvals"&&<Approvals jobs={visJobs} dispatch={d} auth={auth} perm={perm} />}
            {view==="factory"&&<FactoryView jobs={visJobs} dispatch={d} auth={auth} perm={perm} />}
            {view==="tasks"&&<Tasks jobs={visJobs} dispatch={d} auth={auth} />}
            {view==="reports"&&<Reports jobs={visJobs} totalRev={totalRev} />}
            {view==="products"&&<Products />}
            {view==="users"&&perm.canManageUsers&&<UserManagement users={users} dispatch={d} auth={auth} />}
          </div>
        </div>

        {/* Modals */}
        {modal==="add"&&<JobModal onClose={()=>d({type:"CLM"})} onSave={j=>d({type:"ADD_JOB",job:j,user:auth.name})} />}
        {modal==="edit"&&mdata&&<JobModal job={mdata} onClose={()=>d({type:"CLM"})} onSave={j=>d({type:"UPD_JOB",job:j})} />}
        {modal==="note"&&mdata&&<NoteModal id={mdata.id} user={auth.name} onClose={()=>d({type:"CLM"})} onSave={(id,text)=>d({type:"ADD_LOG",id,text,user:auth.name})} />}
        {modal==="wa"&&mdata&&<WAModal job={mdata} onClose={()=>d({type:"CLM"})} />}
        {modal==="quote"&&mdata&&<QuoteModal job={mdata} onClose={()=>d({type:"CLM"})} />}
        {modal==="addUser"&&<UserModal onClose={()=>d({type:"CLM"})} onSave={u=>d({type:"ADD_USER",user:u})} />}
        {modal==="editUser"&&mdata&&<UserModal user={mdata} onClose={()=>d({type:"CLM"})} onSave={u=>d({type:"UPD_USER",user:u})} />}

        {toast&&<div className="toast">{toast}</div>}
      </div>
    </>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function LoginScreen({users,lang,rtl,onLogin,onLang}) {
  const [u,su]=useState(""); const [p,sp]=useState(""); const [err,se]=useState("");
  const try1 = () => {
    const found = users.find(x=>x.username===u&&x.password===p&&x.active);
    if(found) onLogin(found);
    else se(rtl?"اسم المستخدم أو كلمة المرور غير صحيحة":"Invalid username or password");
  };
  return (
    <>
      <style>{CSS}</style>
      <div className="login-wrap" style={{direction:rtl?"rtl":"ltr"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%,rgba(201,168,76,.06) 0%,transparent 60%)"}} />
        <div className="login-card">
          <div className="login-logo">✦ NOVA Kitchens</div>
          <div className="login-sub">CRM Pro — Kitchen Showroom Management</div>
          {err&&<div className="login-err">{err}</div>}
          <div className="field" style={{marginBottom:11}}>
            <label>{rtl?"اسم المستخدم":"Username"}</label>
            <input value={u} onChange={e=>{su(e.target.value);se("");}} onKeyDown={e=>e.key==="Enter"&&try1()} autoFocus />
          </div>
          <div className="field" style={{marginBottom:16}}>
            <label>{rtl?"كلمة المرور":"Password"}</label>
            <input type="password" value={p} onChange={e=>{sp(e.target.value);se("");}} onKeyDown={e=>e.key==="Enter"&&try1()} />
          </div>
          <button className="btn btn-gold" style={{width:"100%",justifyContent:"center",padding:"10px"}} onClick={try1}>
            {rtl?"تسجيل الدخول":"Sign In"}
          </button>
          <div style={{marginTop:10,display:"flex",justifyContent:"center"}}>
            <button className="btn btn-ghost btn-sm" onClick={onLang}>🌐 {rtl?"English":"عربي"}</button>
          </div>

<div style={{marginTop:12, textAlign:"center"}}>
  <a 
    href="/NOVAHome.apk" 
    download
    style={{
      display:"inline-flex", alignItems:"center", gap:8,
      background:"rgba(77,184,122,.14)", color:"#4db87a",
      border:"1px solid rgba(77,184,122,.3)", borderRadius:8,
      padding:"8px 16px", fontSize:13, fontWeight:500,
      textDecoration:"none"
    }}
  >
    📱 Download Android App
  </a>
</div>
           <div className="quick-login">
            <div className="quick-title">{rtl?"دخول سريع:":"Quick login:"}</div>
            <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center"}}>
              {users.filter(x=>x.active).map(x=>(
                <div key={x.id} className="q-chip" onClick={()=>onLogin(x)}>
                  <div className="av" style={{width:18,height:18,background:ROLE_AVATAR_COLORS[x.role]||"#555",fontSize:7,color:"#fff"}}>{x.avatar}</div>
                  {x.name.split(" ")[0]}
                  <span style={{fontSize:9,color:ROLE_AVATAR_COLORS[x.role]||"#888",fontWeight:600}}>{ROLES[x.role]?.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
  
}

// ── USER MANAGEMENT ───────────────────────────────────────────────────────
function UserManagement({users,dispatch,auth}) {
  const d=dispatch;
  const byRole = Object.keys(ROLES).map(r=>({role:r,users:users.filter(u=>u.role===r)}));
  return (
    <div>
      {byRole.filter(g=>g.users.length>0).map(g=>(
        <div key={g.role} style={{marginBottom:22}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:ROLE_AVATAR_COLORS[g.role]}} />
            <div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--cr)"}}>{ROLES[g.role].label}</div>
            <div style={{fontSize:11.5,color:"var(--cr3)"}}>{ROLES[g.role].desc}</div>
            <div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap",fontSize:11,color:"var(--cr3)"}}>
              {ROLES[g.role].nav.map(n=><span key={n} className="badge b-grey" style={{fontSize:10}}>{n}</span>)}
            </div>
          </div>
          <div className="user-grid">
            {g.users.map(u=>(
              <div key={u.id} className={`user-card${u.active?"":" inactive"}`}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div className="av" style={{width:38,height:38,background:ROLE_AVATAR_COLORS[u.role]||"#555",fontSize:13,color:"#fff"}}>{u.avatar}</div>
                  <div>
                    <div style={{fontWeight:600,color:"var(--cr)",fontSize:13}}>{u.name}</div>
                    <div style={{fontSize:11,color:"var(--cr3)"}}>@{u.username}</div>
                  </div>
                  {u.id!=="u1"&&auth.id!==u.id&&(
                    <div className="user-card-actions">
                      <button className="btn btn-ghost btn-xs" onClick={()=>dispatch({type:"MODAL",modal:"editUser",data:u})}>✏</button>
                      <button className={`btn btn-xs ${u.active?"btn-red":"btn-green"}`} onClick={()=>d({type:"TOGGLE_USER",id:u.id})}>{u.active?"Disable":"Enable"}</button>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span className={`badge ${u.active?"b-green":"b-grey"}`} style={{fontSize:10}}>{u.active?"● Active":"○ Inactive"}</span>
                  {u.id!=="u1"&&auth.id!==u.id&&<button className="btn btn-red btn-xs" onClick={()=>{if(window.confirm(`Remove ${u.name}?`))d({type:"DEL_USER",id:u.id})}}>Remove</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── USER MODAL ────────────────────────────────────────────────────────────
function UserModal({user,onClose,onSave}) {
  const [f,sf]=useState(user||{name:"",username:"",password:"",role:"sales",avatar:""});
  const s=(k,v)=>sf(x=>({...x,[k]:v}));
  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" style={{width:440}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">{user?"Edit User":"Add New User"}</div>
        <div className="fg">
          <div className="field"><label>Full Name *</label><input value={f.name} onChange={e=>s("name",e.target.value)} placeholder="e.g. Sara Al-Khatib" /></div>
          <div className="field"><label>Username *</label><input value={f.username} onChange={e=>s("username",e.target.value)} placeholder="e.g. sara" /></div>
          <div className="field"><label>Password *</label><input value={f.password} onChange={e=>s("password",e.target.value)} placeholder="min 6 characters" /></div>
          <div className="field"><label>Role *</label>
            <select value={f.role} onChange={e=>s("role",e.target.value)}>
              {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v.label} — {v.desc.slice(0,30)}…</option>)}
            </select>
          </div>
          <div className="field fg-full"><label>Avatar Initials (2 letters)</label><input value={f.avatar} onChange={e=>s("avatar",e.target.value.slice(0,2).toUpperCase())} placeholder="e.g. SA" maxLength={2} /></div>
        </div>
        {/* Role permissions preview */}
        {f.role&&(<div style={{marginTop:12,background:"var(--sf2)",border:"1px solid var(--b)",borderRadius:8,padding:"11px 13px"}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".09em",color:"var(--gd)",marginBottom:8}}>This role can access:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {ROLES[f.role]?.nav.map(n=><span key={n} className="badge b-gold" style={{fontSize:10}}>{n}</span>)}
          </div>
          <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
            {ROLES[f.role]?.canEdit&&<span className="badge b-green" style={{fontSize:10}}>✓ Can Edit</span>}
            {ROLES[f.role]?.canApprove&&<span className="badge b-green" style={{fontSize:10}}>✓ Can Approve</span>}
            {ROLES[f.role]?.canFactory&&<span className="badge b-green" style={{fontSize:10}}>✓ Factory Access</span>}
            {ROLES[f.role]?.canDelete&&<span className="badge b-green" style={{fontSize:10}}>✓ Can Delete</span>}
            {!ROLES[f.role]?.seeAllJobs&&<span className="badge b-orange" style={{fontSize:10}}>⚠ Own Jobs Only</span>}
          </div>
        </div>)}
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={()=>{if(!f.name||!f.username||!f.password){alert("Name, username and password required");return;}if(!f.avatar)f.avatar=f.name.slice(0,2).toUpperCase();onSave(f);}}>
            {user?"Save Changes":"Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({jobs,totalRev,pendAppr,factCount,dispatch,auth,role}) {
  const recent=[...jobs].sort((a,b)=>new Date(b.lastActivity)-new Date(a.lastActivity)).slice(0,6);
  const byStage=STAGES.filter(s=>s.visibleTo.includes(auth.role)).map(s=>({...s,cnt:jobs.filter(j=>j.stageId===s.id).length,val:jobs.filter(j=>j.stageId===s.id).reduce((x,j)=>x+(j.budget||0),0)}));
  return (<>
    <div className="stats-row">
      {[
        {l:"Active Jobs",v:jobs.filter(j=>j.stageId!=="aftersales").length,ico:"📋",c:"var(--blue)"},
        {l:"Revenue",v:fmt(totalRev),ico:"💰",c:"var(--gold)"},
        ...(role.canApprove?[{l:"Pending Approvals",v:pendAppr,ico:"⏳",c:"var(--red)"}]:[]),
        ...(role.canFactory||auth.role==="factory"?[{l:"In Factory",v:factCount,ico:"🏭",c:"var(--pink)"}]:[]),
        {l:"Completed",v:jobs.filter(j=>j.stageId==="aftersales").length,ico:"⭐",c:"var(--green)"},
      ].map(s=>(
        <div key={s.l} className="stat" style={{"--c":s.c}}>
          <div className="stat-ico">{s.ico}</div>
          <div className="stat-lbl">{s.l}</div>
          <div className="stat-val">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="two-col">
      <div style={{display:"flex",flexDirection:"column",gap:13}}>
        <div className="card">
          <div className="card-title">Jobs by Stage</div>
          <div style={{overflowX:"auto"}}>
            <div style={{display:"flex",gap:7,minWidth:Math.max(byStage.length*90,400)}}>
              {byStage.map(s=>(
                <div key={s.id} style={{flex:1,background:"var(--sf2)",border:"1px solid var(--b)",borderTop:`2px solid ${s.color}`,borderRadius:8,padding:"8px 5px",textAlign:"center",cursor:"pointer",minWidth:0}} onClick={()=>dispatch({type:"VIEW",v:"pipeline"})}>
                  <div style={{fontSize:14}}>{s.icon}</div>
                  <div style={{fontSize:9,fontWeight:700,color:s.color,textTransform:"uppercase",margin:"2px 0"}}>{s.en.split(" ")[0]}</div>
                  <div style={{fontSize:20,fontFamily:"var(--fd)",color:"var(--cr)"}}>{s.cnt}</div>
                  <div style={{fontSize:10,color:"var(--cr3)"}}>{s.cnt>0?fmt(s.val):"—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 15px",borderBottom:"1px solid var(--b)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div className="card-title" style={{margin:0}}>Recent Activity</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"VIEW",v:"jobs"})}>View All</button>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Customer</th><th>Stage</th><th>Progress</th><th>Budget</th></tr></thead>
              <tbody>
                {recent.map(j=>{
                  const pct=completionPct(j.completedTasks);
                  return (<tr key={j.id} className="clk" onClick={()=>dispatch({type:"SEL",id:j.id})}>
                    <td><div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="av" style={{width:27,height:27,background:AV_COLORS[j.id%8],fontSize:9,color:"#fff"}}>{initials(j.name)}</div>
                      <div><div className="td-name">{j.name}</div><div className="td-sub">{j.source}</div></div>
                    </div></td>
                    <td><span className={`badge ${SBADGE[j.stageId]}`}>{stageObj(j.stageId)?.icon} {stageObj(j.stageId)?.en}</span></td>
                    <td><div style={{fontSize:10,color:"var(--cr3)",marginBottom:2}}>{pct}%</div><div className="prog"><div className="prog-fill" style={{width:pct+"%",background:"var(--gold)"}}/></div></td>
                    <td style={{color:"var(--gold)",fontWeight:500}}>{fmt(j.budget)}</td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        {pendAppr>0&&role.canApprove&&(<div className="card" style={{borderColor:"rgba(224,144,58,.3)"}}>
          <div className="card-title" style={{color:"var(--orange)"}}>⏳ Awaiting Approval</div>
          {jobs.filter(j=>j.approvals?.customer_design===null&&j.stageId==="cust_approval").slice(0,3).map(j=>(
            <div key={j.id} style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>dispatch({type:"SEL",id:j.id})}>
              <div className="av" style={{width:24,height:24,background:AV_COLORS[j.id%8],fontSize:8,color:"#fff"}}>{initials(j.name)}</div>
              <div style={{flex:1,fontSize:12.5,color:"var(--cr)"}}>{j.name}</div>
              <span className="badge b-orange" style={{fontSize:10}}>Pending</span>
            </div>
          ))}
        </div>)}
        <div className="card">
          <div className="card-title">Pipeline Health</div>
          {STAGES.filter(s=>s.visibleTo.includes(auth.role)).slice(0,6).map(s=>{
            const cnt=jobs.filter(j=>j.stageId===s.id).length;
            const max=Math.max(...STAGES.map(st=>jobs.filter(j=>j.stageId===st.id).length),1);
            return (<div key={s.id} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}>
                <span style={{color:"var(--cr3)"}}>{s.icon} {s.en}</span><span>{cnt}</span>
              </div>
              <div className="prog" style={{height:5}}><div className="prog-fill" style={{width:`${(cnt/max)*100}%`,background:s.color}}/></div>
            </div>);
          })}
        </div>
      </div>
    </div>
  </>);
}

// ── JOBS TABLE ─────────────────────────────────────────────────────────────
function JobsTable({jobs,dispatch,auth,perm}) {
  return (
    <div className="card" style={{padding:0,overflow:"hidden"}}>
      <div className="tbl-wrap">
        <table>
          <thead><tr>
            <th>Customer</th><th>Stage</th><th>Designer</th><th>Style</th><th>Budget</th><th>Progress</th><th>Last Activity</th>
            {perm.canEdit&&<th></th>}
          </tr></thead>
          <tbody>
            {jobs.length===0&&<tr><td colSpan={8}><div className="empty"><div className="ei">🔍</div>No jobs found</div></td></tr>}
            {jobs.map(j=>{
              const pct=completionPct(j.completedTasks);
              return (<tr key={j.id} className="clk" onClick={()=>dispatch({type:"SEL",id:j.id})}>
                <td><div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div className="av" style={{width:27,height:27,background:AV_COLORS[j.id%8],fontSize:9,color:"#fff"}}>{initials(j.name)}</div>
                  <div><div className="td-name">{j.name}</div><div className="td-sub">{j.phone}</div></div>
                </div></td>
                <td><span className={`badge ${SBADGE[j.stageId]}`}>{stageObj(j.stageId)?.icon} {stageObj(j.stageId)?.en}</span></td>
                <td style={{fontSize:12,color:"var(--cr2)"}}>{j.designer}</td>
                <td style={{fontSize:12}}>{j.style}</td>
                <td style={{color:"var(--gold)",fontWeight:500}}>{fmt(j.budget)}</td>
                <td style={{minWidth:80}}><div style={{fontSize:10,color:"var(--cr3)",marginBottom:2}}>{pct}%</div><div className="prog"><div className="prog-fill" style={{width:pct+"%",background:"var(--gold)"}}/></div></td>
                <td style={{fontSize:11,color:"var(--cr3)"}}>{fmtD(j.lastActivity)}</td>
                {perm.canEdit&&<td onClick={e=>e.stopPropagation()}>
                  <select className="btn btn-ghost btn-xs" style={{padding:"3px 6px"}} value={j.stageId}
                    onChange={e=>dispatch({type:"SET_STAGE",id:j.id,stage:e.target.value,user:auth.name})}>
                    {STAGES.filter(s=>s.visibleTo.includes(auth.role)).map(s=><option key={s.id} value={s.id}>{s.en}</option>)}
                  </select>
                </td>}
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── JOB DETAIL ─────────────────────────────────────────────────────────────
function JobDetail({job,dispatch,auth,perm}) {
  const d=dispatch;
  const sg=stageObj(job.stageId); const sidx=stageIdx(job.stageId);
  const [activeStage,setAS]=useState(job.stageId);
  useEffect(()=>setAS(job.stageId),[job.stageId]);
  const asg=stageObj(activeStage);
  const canViewStage = asg?.visibleTo.includes(auth.role);
  const canEditStage = asg?.editableBy.includes(auth.role);

  // Only show stages visible to this role
  const visStages = STAGES.filter(s=>s.visibleTo.includes(auth.role));

  return (
    <div>
      {/* Stage track - only visible stages */}
      <div className="stage-track" style={{marginBottom:13}}>
        {visStages.map((s,i)=>{
          const globalIdx=stageIdx(s.id); const done=globalIdx<sidx; const active=s.id===job.stageId; const viewing=s.id===activeStage;
          return (<div key={s.id} className="stage-step" style={{background:done?"rgba(77,184,122,.1)":active?`${s.color}20`:"var(--sf2)",color:done?"var(--green)":active?s.color:"var(--cr3)",borderTop:viewing?`2px solid var(--gold)`:done?`1px solid var(--green)`:active?`1px solid ${s.color}`:"none"}} onClick={()=>setAS(s.id)}>
            <span className="stage-step-icon">{done?"✓":s.icon}</span>
            <span style={{fontSize:8,display:"block",lineHeight:1.2}}>{s.en.split(" ")[0]}</span>
          </div>);
        })}
      </div>

      <div className="job-layout">
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          <div className="stage-panel">
            <div className="stage-panel-head" style={{borderLeft:`3px solid ${asg?.color}`}}>
              <span style={{fontSize:20}}>{asg?.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--cr)"}}>{asg?.en}</div>
                <div style={{fontSize:11.5,color:"var(--cr3)"}}>{asg?.editableBy.includes(auth.role)?"You can edit this stage":"View only"}</div>
              </div>
              {activeStage===job.stageId&&<span className="badge b-gold" style={{fontSize:10}}>Current</span>}
              {!canViewStage&&<span className="badge b-red" style={{fontSize:10}}>🔒 Restricted</span>}
            </div>
            <div className="stage-panel-body">
              {!canViewStage ? (
                <div className="locked-stage">🔒 You don't have access to view this stage</div>
              ) : (
                <>
                  <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".09em",color:"var(--cr3)",marginBottom:7}}>Checklist</div>
                  <div className="checklist">
                    {asg?.tasksEn.map((task,i)=>{
                      const done=i<(job.completedTasks[activeStage]||0);
                      return (<div key={i} className={`check-item${done?" done":""}`} onClick={()=>canEditStage&&d({type:"TOGGLE_TASK",id:job.id,stage:activeStage,idx:i})}>
                        <div className="check-box">{done?"✓":""}</div>
                        <span className="check-lbl">{task}</span>
                        {!canEditStage&&<span style={{fontSize:10,color:"var(--cr3)"}}>🔒</span>}
                      </div>);
                    })}
                  </div>
                  {canEditStage&&<StageFields type={activeStage} job={job} d={d} auth={auth} perm={perm} />}
                  {!canEditStage&&<div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",borderRadius:8,padding:"10px 12px",fontSize:12.5,color:"var(--cr3)",marginTop:8}}>👁 View only — your role ({ROLES[auth.role].label}) cannot edit this stage</div>}
                  {activeStage===job.stageId&&sidx<STAGE_IDS.length-1&&perm.canEdit&&(
                    <button className="btn btn-gold" style={{marginTop:12,width:"100%",justifyContent:"center"}} onClick={()=>d({type:"ADV_STAGE",id:job.id,user:auth.name})}>
                      Advance to {stageObj(STAGE_IDS[sidx+1])?.en} →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <a href={`tel:${job.phone}`} className="btn btn-ghost btn-sm">📞 Call</a>
            <button className="btn btn-wa btn-sm" onClick={()=>d({type:"MODAL",modal:"wa",data:job})}>💬 WhatsApp</button>
            {perm.canEdit&&<button className="btn btn-blue btn-sm" onClick={()=>d({type:"MODAL",modal:"quote",data:job})}>📄 Quote</button>}
            {perm.canDelete&&<button className="btn btn-red btn-sm" style={{marginLeft:"auto"}} onClick={()=>{if(window.confirm("Delete this job?"))d({type:"DEL_JOB",id:job.id})}}>Delete</button>}
          </div>

          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div className="card-title" style={{margin:0}}>Activity Log</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>d({type:"MODAL",modal:"note",data:{id:job.id}})}>+ Note</button>
            </div>
            <div className="act-log">
              {(job.activityLog||[]).length===0&&<div className="empty"><div className="ei">📋</div>No activity yet</div>}
              {(job.activityLog||[]).map(a=>(
                <div key={a.id} className="act-item">
                  <div className="act-dot"/>
                  <div><div className="act-text">{a.text}</div><div className="act-meta">{a.user} · {fmtD(a.date)}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="cust-side">
          <div className="info-blk">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:11}}>
              <div className="av" style={{width:40,height:40,background:AV_COLORS[job.id%8],fontSize:12,color:"#fff"}}>{initials(job.name)}</div>
              <div><div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--cr)"}}>{job.name}</div>
                <span className={`badge ${SBADGE[job.stageId]}`}>{sg?.icon} {sg?.en}</span>
              </div>
            </div>
            <div className="info-ttl">Contact</div>
            {[{k:"Phone",v:job.phone},{k:"Email",v:job.email||"—"},{k:"Address",v:job.address||"—"}].map(r=>(
              <div key={r.k} className="info-row"><span className="info-key">{r.k}</span><span className="info-val">{r.v}</span></div>
            ))}
          </div>
          <div className="info-blk">
            <div className="info-ttl">Project</div>
            {[
              {k:"Style",v:job.style},{k:"Source",v:job.source},{k:"Designer",v:job.designer},
              {k:"Budget",v:<span className="gold-val">{fmt(job.budget)}</span>},
              ...(job.finalQuote?[{k:"Final Quote",v:<span className="gold-val">{fmt(job.finalQuote)}</span>}]:[]),
              ...(job.deposit?[{k:"Deposit",v:<span style={{color:"var(--green)"}}>{fmt(job.deposit)}</span>}]:[]),
            ].map((r,i)=>(<div key={i} className="info-row"><span className="info-key">{r.k}</span><span className="info-val">{r.v}</span></div>))}
          </div>
          {(job.quoteNo||job.contractNo||job.factoryOrderNo)&&(
            <div className="info-blk">
              <div className="info-ttl">References</div>
              {job.quoteNo&&<div className="info-row"><span className="info-key">Quote</span><span className="info-val" style={{color:"var(--gold)"}}>{job.quoteNo}</span></div>}
              {job.contractNo&&<div className="info-row"><span className="info-key">Contract</span><span className="info-val" style={{color:"var(--green)"}}>{job.contractNo}</span></div>}
              {job.factoryOrderNo&&<div className="info-row"><span className="info-key">Factory Order</span><span className="info-val" style={{color:"var(--pink)"}}>{job.factoryOrderNo}</span></div>}
            </div>
          )}
          <div className="info-blk">
            <div className="info-ttl">Approvals</div>
            {[
              {key:"customer_design",l:"Customer — Design"},{key:"management_design",l:"Management — Design"},
              {key:"customer_budget",l:"Customer — Budget"},{key:"management_budget",l:"Management — Budget"},
            ].map(a=>{
              const v=job.approvals?.[a.key];
              return (<div key={a.key} className="info-row">
                <span className="info-key" style={{fontSize:11}}>{a.l}</span>
                <span className={`badge ${v==="approved"?"b-green":v==="revision"?"b-red":"b-grey"}`} style={{fontSize:10}}>{v==="approved"?"✓ Approved":v==="revision"?"⟳ Revision":"Pending"}</span>
              </div>);
            })}
            <div className="info-row"><span className="info-key" style={{fontSize:11}}>Contract Signed</span><span className={`badge ${job.approvals?.contract_signed?"b-green":"b-grey"}`} style={{fontSize:10}}>{job.approvals?.contract_signed?"✓ Signed":"Pending"}</span></div>
            <div className="info-row"><span className="info-key" style={{fontSize:11}}>Deposit Received</span><span className={`badge ${job.approvals?.deposit_received?"b-green":"b-grey"}`} style={{fontSize:10}}>{job.approvals?.deposit_received?"✓ Received":"Pending"}</span></div>
          </div>
          {job.notes&&<div className="info-blk"><div className="info-ttl">Notes</div><div style={{fontSize:12.5,color:"var(--cr3)",lineHeight:1.6}}>{job.notes}</div></div>}
        </div>
      </div>
    </div>
  );
}

// ── STAGE FIELDS ──────────────────────────────────────────────────────────
function IF({label,value,field,id,d,type="text",placeholder,options,auth}) {
  const [v,sv]=useState(value||"");
  return (<div style={{marginBottom:8}}>
    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".08em",color:"var(--cr3)",marginBottom:3}}>{label}</div>
    <div className="inline-field">
      {options?<select value={v} onChange={e=>sv(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select>
        :<input type={type} value={v} onChange={e=>sv(e.target.value)} placeholder={placeholder}/>}
      <button className="btn btn-ghost btn-sm" onClick={()=>d({type:"UPD_FIELD",id,field,val:type==="number"?Number(v):v,user:auth?.name})}>✓</button>
    </div>
  </div>);
}

function StageFields({type,job,d,auth,perm}) {
  return (<div style={{marginTop:11,paddingTop:11,borderTop:"1px solid var(--b)"}}>
    {type==="measurement"&&<><IF label="Measurement Date" value={job.measureDate} field="measureDate" id={job.id} d={d} type="date" auth={auth}/><IF label="Room Dimensions" value={job.measureNotes} field="measureNotes" id={job.id} d={d} placeholder="4.2m x 3.8m…" auth={auth}/></>}
    {type==="design"&&<IF label="Design File Reference" value={job.designFile} field="designFile" id={job.id} d={d} placeholder="KIT-2026-XXX.pdf" auth={auth}/>}
    {type==="cust_approval"&&<ApprovalField approvalKey="customer_design" label="Customer Design Approval" job={job} d={d} auth={auth} perm={perm} />}
    {type==="mgmt_approval"&&<ApprovalField approvalKey="management_design" label="Management Design Approval" job={job} d={d} auth={auth} perm={perm} />}
    {type==="budget"&&<>
      <IF label="Quote Number" value={job.quoteNo} field="quoteNo" id={job.id} d={d} placeholder="Q-2026-XXX" auth={auth}/>
      <IF label="Final Quote (JD)" value={job.finalQuote} field="finalQuote" id={job.id} d={d} type="number" auth={auth}/>
      <ApprovalField approvalKey="customer_budget" label="Customer Budget Approval" job={job} d={d} auth={auth} perm={perm} />
    </>}
    {type==="contract"&&<>
      <IF label="Contract Number" value={job.contractNo} field="contractNo" id={job.id} d={d} placeholder="C-2026-XXX" auth={auth}/>
      <IF label="Deposit Amount (JD)" value={job.deposit} field="deposit" id={job.id} d={d} type="number" auth={auth}/>
      <div style={{display:"flex",gap:7,marginTop:6,flexWrap:"wrap"}}>
        <button className={`btn btn-sm ${job.approvals?.contract_signed?"btn-green":"btn-ghost"}`} onClick={()=>d({type:"SET_APPR",id:job.id,key:"contract_signed",val:!job.approvals?.contract_signed,user:auth.name})}>{job.approvals?.contract_signed?"✓ Contract Signed":"Mark Signed"}</button>
        <button className={`btn btn-sm ${job.approvals?.deposit_received?"btn-green":"btn-ghost"}`} onClick={()=>d({type:"SET_APPR",id:job.id,key:"deposit_received",val:!job.approvals?.deposit_received,user:auth.name})}>{job.approvals?.deposit_received?"✓ Deposit Received":"Mark Deposit"}</button>
      </div>
    </>}
    {type==="factory"&&(perm.canFactory||perm.canEdit)&&<>
      <IF label="Factory Order No." value={job.factoryOrderNo} field="factoryOrderNo" id={job.id} d={d} placeholder="FAC-2026-XXX" auth={auth}/>
      <IF label="Production Status" value={job.factoryStatus||"Order Sent"} field="factoryStatus" id={job.id} d={d} options={FACTORY_STATUSES} auth={auth}/>
    </>}
    {type==="installation"&&<IF label="Installation Date" value={job.installDate} field="installDate" id={job.id} d={d} type="date" auth={auth}/>}
    {type==="aftersales"&&<IF label="Warranty (Months)" value={job.warrantyMonths||24} field="warrantyMonths" id={job.id} d={d} options={["12","18","24","36","48","60"]} auth={auth}/>}
  </div>);
}

function ApprovalField({approvalKey,label,job,d,auth,perm}) {
  const val=job.approvals?.[approvalKey];
  const canAppr=approvalKey.includes("management")?perm.canApprove:(perm.canEdit||perm.canApprove);
  return (<div style={{marginTop:8}}>
    <div className={`appr-card${val==="approved"?" approved":val==="revision"?" revision":""}`}>
      <div className="appr-lbl">{label}</div>
      <div className="appr-status" style={{color:val==="approved"?"var(--green)":val==="revision"?"var(--red)":"var(--cr3)"}}>{val==="approved"?"✓ Approved":val==="revision"?"⟳ Revision Requested":"Pending"}</div>
      {canAppr&&<div className="appr-btns">
        <button className="btn btn-green btn-xs" onClick={()=>d({type:"SET_APPR",id:job.id,key:approvalKey,val:"approved",user:auth.name})}>✓ Approve</button>
        <button className="btn btn-red btn-xs" onClick={()=>d({type:"SET_APPR",id:job.id,key:approvalKey,val:"revision",user:auth.name})}>⟳ Revision</button>
      </div>}
      {!canAppr&&<div style={{fontSize:11,color:"var(--cr3)",marginTop:4}}>🔒 Only {approvalKey.includes("management")?"Management":"authorized roles"} can approve</div>}
    </div>
  </div>);
}

// ── PIPELINE ──────────────────────────────────────────────────────────────
function Pipeline({jobs,dispatch,auth}) {
  const visStages=STAGES.filter(s=>s.visibleTo.includes(auth.role));
  return (<div className="kanban-wrap">
    <div className="kanban" style={{gridTemplateColumns:`repeat(${visStages.length},minmax(155px,1fr))`,minWidth:visStages.length*165}}>
      {visStages.map(s=>{
        const sj=jobs.filter(j=>j.stageId===s.id);
        return (<div key={s.id} className="kanban-col">
          <div className="kanban-head" style={{borderTop:`2px solid ${s.color}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div className="kanban-title" style={{color:s.color}}>{s.icon} {s.en}</div>
              <span className="kanban-cnt">{sj.length}</span>
            </div>
            <div style={{fontSize:10,color:"var(--cr3)",marginTop:2}}>{sj.length>0?fmt(sj.reduce((x,j)=>x+(j.budget||0),0)):"—"}</div>
          </div>
          <div className="kanban-cards">
            {sj.map(j=>(<div key={j.id} className="k-card" onClick={()=>dispatch({type:"SEL",id:j.id})}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                <div className="av" style={{width:18,height:18,background:AV_COLORS[j.id%8],fontSize:7,color:"#fff"}}>{initials(j.name)}</div>
                <div style={{fontSize:12.5,fontWeight:500,color:"var(--cr)"}}>{j.name}</div>
              </div>
              <div style={{fontSize:12,color:"var(--gold)"}}>{fmt(j.budget)}</div>
              <div style={{fontSize:10.5,color:"var(--cr3)",marginTop:2}}>{j.style}</div>
              <div className="prog" style={{marginTop:5}}><div className="prog-fill" style={{width:completionPct(j.completedTasks)+"%",background:s.color}}/></div>
            </div>))}
            {sj.length===0&&<div style={{fontSize:11,color:"var(--cr3)",textAlign:"center",padding:"10px 0"}}>—</div>}
          </div>
        </div>);
      })}
    </div>
  </div>);
}

// ── APPROVALS ─────────────────────────────────────────────────────────────
function Approvals({jobs,dispatch,auth,perm}) {
  const d=dispatch;
  const pending=jobs.filter(j=>j.approvals&&(j.approvals.customer_design===null||j.approvals.management_design===null||j.approvals.customer_budget===null));
  if(!pending.length) return <div className="empty" style={{marginTop:40}}><div className="ei">✅</div>All approvals are up to date</div>;
  return (<div style={{display:"flex",flexDirection:"column",gap:11}}>
    {pending.map(j=>(<div key={j.id} className="card">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div className="av" style={{width:34,height:34,background:AV_COLORS[j.id%8],fontSize:11,color:"#fff"}}>{initials(j.name)}</div>
        <div style={{flex:1}}><div style={{fontFamily:"var(--fd)",fontSize:15,color:"var(--cr)"}}>{j.name}</div>
          <span className={`badge ${SBADGE[j.stageId]}`}>{stageObj(j.stageId)?.icon} {stageObj(j.stageId)?.en}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={()=>d({type:"SEL",id:j.id})}>Open →</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7}}>
        {[
          {key:"customer_design",l:"Customer Design"},{key:"management_design",l:"Management Design"},
          {key:"customer_budget",l:"Customer Budget"},{key:"management_budget",l:"Management Budget"},
        ].map(a=>{
          const val=j.approvals?.[a.key];
          const canAppr=a.key.includes("management")?perm.canApprove:(perm.canEdit||perm.canApprove);
          return (<div key={a.key} className={`appr-card${val==="approved"?" approved":val==="revision"?" revision":""}`}>
            <div className="appr-lbl">{a.l}</div>
            <div className="appr-status" style={{fontSize:12,color:val==="approved"?"var(--green)":val==="revision"?"var(--red)":"var(--cr3)"}}>{val==="approved"?"✓":val==="revision"?"⟳":"—"}</div>
            {canAppr&&<div className="appr-btns">
              <button className="btn btn-green btn-xs" onClick={()=>d({type:"SET_APPR",id:j.id,key:a.key,val:"approved",user:auth.name})}>✓</button>
              <button className="btn btn-red btn-xs" onClick={()=>d({type:"SET_APPR",id:j.id,key:a.key,val:"revision",user:auth.name})}>⟳</button>
            </div>}
          </div>);
        })}
      </div>
    </div>))}
  </div>);
}

// ── FACTORY ───────────────────────────────────────────────────────────────
function FactoryView({jobs,dispatch,auth,perm}) {
  const fJobs=jobs.filter(j=>j.stageId==="factory"||j.factoryOrderNo);
  const SC={"Order Sent":"var(--blue)","Confirmed":"var(--gold)","In Production":"var(--pink)","QC Check":"var(--orange)","Ready for Delivery":"var(--purple)","Delivered":"var(--green)"};
  return (<div className="card" style={{padding:0,overflow:"hidden"}}>
    <div style={{padding:"12px 15px",borderBottom:"1px solid var(--b)"}}><div className="card-title" style={{margin:0}}>Production Tracker</div></div>
    <div className="tbl-wrap">
      <table>
        <thead><tr><th>Customer</th><th>Factory Order</th><th>Status</th><th>Quote</th><th>Install Date</th><th>Designer</th></tr></thead>
        <tbody>
          {fJobs.length===0&&<tr><td colSpan={6}><div className="empty"><div className="ei">🏭</div>No factory orders yet</div></td></tr>}
          {fJobs.map(j=>(<tr key={j.id} className="clk" onClick={()=>dispatch({type:"SEL",id:j.id})}>
            <td><div className="td-name">{j.name}</div><div className="td-sub">{j.style}</div></td>
            <td style={{color:"var(--pink)",fontWeight:500}}>{j.factoryOrderNo||"—"}</td>
            <td>{j.factoryStatus?<span className="badge" style={{background:`${SC[j.factoryStatus]||"#888"}22`,color:SC[j.factoryStatus]||"var(--cr3)"}}>{j.factoryStatus}</span>:<span className="badge b-grey">—</span>}</td>
            <td style={{color:"var(--gold)"}}>{fmt(j.finalQuote||j.budget)}</td>
            <td style={{fontSize:11,color:"var(--cr3)"}}>{fmtD(j.installDate)}</td>
            <td style={{fontSize:12,color:"var(--cr2)"}}>{j.designer}</td>
          </tr>))}
        </tbody>
      </table>
    </div>
  </div>);
}

// ── TASKS ─────────────────────────────────────────────────────────────────
function Tasks({jobs,dispatch,auth}) {
  const visStages=STAGES.filter(s=>s.visibleTo.includes(auth.role)&&s.id!=="aftersales");
  const active=jobs.filter(j=>j.stageId!=="aftersales");
  return (<div style={{display:"flex",flexDirection:"column",gap:11}}>
    {visStages.map(s=>{
      const sj=active.filter(j=>j.stageId===s.id);
      if(!sj.length) return null;
      return (<div key={s.id} className="card">
        <div className="card-title" style={{color:s.color}}>{s.icon} {s.en} <span style={{fontSize:12,color:"var(--cr3)",fontFamily:"var(--fb)",fontWeight:400}}>({sj.length})</span></div>
        {sj.map(j=>(<div key={j.id} style={{background:"var(--sf2)",border:"1px solid var(--b)",borderRadius:8,padding:"8px 11px",marginBottom:7,cursor:"pointer"}} onClick={()=>dispatch({type:"SEL",id:j.id})}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <div className="av" style={{width:22,height:22,background:AV_COLORS[j.id%8],fontSize:7,color:"#fff"}}>{initials(j.name)}</div>
            <span style={{fontWeight:500,color:"var(--cr)",fontSize:13}}>{j.name}</span>
            <span style={{fontSize:11,color:"var(--cr3)",marginLeft:4}}>{j.designer}</span>
            <span style={{marginLeft:"auto",color:"var(--gold)",fontSize:12}}>{fmt(j.budget)}</span>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {s.tasksEn.map((task,i)=>{const done=i<(j.completedTasks[s.id]||0);return <span key={i} className={`badge ${done?"b-green":"b-grey"}`} style={{fontSize:10}}>{done?"✓ ":""}{task}</span>;})}
          </div>
          <div className="prog" style={{marginTop:6}}><div className="prog-fill" style={{width:`${((j.completedTasks[s.id]||0)/s.tasksEn.length)*100}%`,background:s.color}}/></div>
        </div>))}
      </div>);
    })}
  </div>);
}

// ── REPORTS ───────────────────────────────────────────────────────────────
function Reports({jobs,totalRev}) {
  const contracted=jobs.filter(j=>["contract","factory","installation","aftersales"].includes(j.stageId));
  const bySource=SOURCES.map(s=>({s,c:jobs.filter(j=>j.source===s).length})).filter(x=>x.c>0).sort((a,b)=>b.c-a.c);
  const maxSrc=Math.max(...bySource.map(x=>x.c),1);
  const byDes=DESIGNERS_LIST.map(d=>({d,leads:jobs.filter(j=>j.designer===d).length,rev:jobs.filter(j=>j.designer===d&&["contract","factory","installation","aftersales"].includes(j.stageId)).reduce((x,j)=>x+(j.finalQuote||j.budget||0),0)}));
  return (<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
    <div className="card">
      <div className="card-title">Revenue Summary</div>
      {[{l:"Total Revenue",v:fmt(totalRev),c:"var(--gold)"},{l:"Pipeline Value",v:fmt(jobs.reduce((s,j)=>s+(j.budget||0),0)),c:"var(--blue)"},{l:"Avg Deal",v:fmt(Math.round(totalRev/(contracted.length||1))),c:"var(--cr)"},{l:"Contracts Signed",v:contracted.length,c:"var(--green)"},{l:"Total Jobs",v:jobs.length,c:"var(--cr)"},{l:"Completed",v:jobs.filter(j=>j.stageId==="aftersales").length,c:"var(--green)"}].map(r=>(
        <div key={r.l} className="info-row"><span className="info-key">{r.l}</span><span style={{color:r.c,fontWeight:600}}>{r.v}</span></div>
      ))}
    </div>
    <div className="card">
      <div className="card-title">Lead Sources</div>
      {bySource.map(x=>(<div key={x.s} style={{marginBottom:9}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"var(--cr3)"}}>{x.s}</span><span>{x.c}</span></div>
        <div className="prog" style={{height:5}}><div className="prog-fill" style={{width:`${(x.c/maxSrc)*100}%`}}/></div>
      </div>))}
    </div>
    <div className="card">
      <div className="card-title">Designer Performance</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
        <thead><tr>{["Designer","Jobs","Revenue"].map(h=><th key={h} style={{padding:"5px 0",fontSize:10,textAlign:h==="Revenue"?"right":"left",color:"var(--gd)",fontWeight:500}}>{h}</th>)}</tr></thead>
        <tbody>{byDes.map(x=>(<tr key={x.d}><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--cr)"}}>{x.d}</td><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--cr3)"}}>{x.leads}</td><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--gold)",fontWeight:600,textAlign:"right"}}>{fmt(x.rev)}</td></tr>))}</tbody>
      </table>
    </div>
    <div className="card">
      <div className="card-title">Popular Styles</div>
      {STYLES.map((s,i)=>{const c=jobs.filter(j=>j.style===s).length;if(!c)return null;return(<div key={s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(42,38,30,.4)"}}>
        <div style={{width:18,height:18,background:`rgba(201,168,76,${.15+i*.03})`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"var(--gold)",fontWeight:700}}>{i+1}</div>
        <div style={{flex:1,fontSize:12.5,color:"var(--cr)"}}>{s}</div>
        <div style={{fontSize:12,color:"var(--cr3)"}}>{c}</div>
        <div className="prog" style={{width:70,height:4}}><div className="prog-fill" style={{width:`${(c/jobs.length)*100}%`}}/></div>
      </div>);})}
    </div>
  </div>);
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────
const PRODS=[
  {id:1,name:"Modern Island Unit",style:"Modern",price:4200,sku:"MOD-ISL-001",desc:"Large central island with integrated sink"},
  {id:2,name:"Classic White Lacquer",style:"Classic",price:8500,sku:"CLS-WHT-002",desc:"Full set, high-gloss white lacquer"},
  {id:3,name:"Marble Countertop /m²",style:"All",price:380,sku:"CTR-MRB-003",desc:"Carrara marble, custom cut"},
  {id:4,name:"Smart Appliance Pack",style:"Modern",price:6200,sku:"SMA-APP-004",desc:"Oven, hob, dishwasher, fridge — smart"},
  {id:5,name:"Rustic Solid Oak Base",style:"Rustic",price:3100,sku:"RST-OAK-005",desc:"Solid oak, aged finish"},
  {id:6,name:"Industrial Black Range",style:"Industrial",price:5400,sku:"IND-BLK-006",desc:"Matte black, open shelving"},
  {id:7,name:"Minimalist Handle-less",style:"Minimalist",price:9800,sku:"MIN-HLS-007",desc:"Push-to-open, fully integrated"},
  {id:8,name:"Wall Cabinet Set",style:"All",price:2200,sku:"WLL-CAB-008",desc:"Upper wall cabinets, multiple finishes"},
];
const EMJ={Modern:"🏙️",Classic:"🏛️",Contemporary:"◼",Rustic:"🌿",Industrial:"⚙️",Minimalist:"□",Traditional:"🪵",Bespoke:"✦",All:"🍳"};
function Products() {
  const [f,setF]=useState("All");
  const shown=f==="All"?PRODS:PRODS.filter(p=>p.style===f||p.style==="All");
  return (<>
    <div style={{display:"flex",gap:6,marginBottom:13,flexWrap:"wrap"}}>
      {["All",...STYLES].map(s=><button key={s} className={`btn ${f===s?"btn-gold":"btn-ghost"} btn-sm`} onClick={()=>setF(s)}>{s}</button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11}}>
      {shown.map(p=>(<div key={p.id} className="card" style={{padding:13}}>
        <div style={{background:"var(--sf2)",borderRadius:8,height:72,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:9}}>{EMJ[p.style]||"🍳"}</div>
        <div style={{fontSize:9.5,color:"var(--cr3)",marginBottom:3}}>{p.sku}</div>
        <div style={{fontFamily:"var(--fd)",fontSize:13.5,color:"var(--cr)",marginBottom:5}}>{p.name}</div>
        <div style={{fontSize:11.5,color:"var(--cr3)",marginBottom:9}}>{p.desc}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{color:"var(--gold)",fontWeight:600}}>{fmt(p.price)}</span>
          <button className="btn btn-ghost btn-xs">+ Add</button>
        </div>
      </div>))}
    </div>
  </>);
}

// ── JOB MODAL ──────────────────────────────────────────────────────────────
function JobModal({job,onClose,onSave}) {
  const [f,sf]=useState(job||{name:"",phone:"",email:"",address:"",source:"Walk-In",style:"Modern",budget:"",priority:"Medium",designer:DESIGNERS_LIST[0],notes:""});
  const s=(k,v)=>sf(x=>({...x,[k]:v}));
  return (<div className="ov" onClick={onClose}>
    <div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">{job?"Edit Job":"New Kitchen Job"}</div>
      <div className="fg">
        <div className="field"><label>Full Name *</label><input value={f.name} onChange={e=>s("name",e.target.value)} /></div>
        <div className="field"><label>Phone *</label><input value={f.phone} onChange={e=>s("phone",e.target.value)} placeholder="+962 79…" /></div>
        <div className="field"><label>Email</label><input value={f.email||""} onChange={e=>s("email",e.target.value)} /></div>
        <div className="field"><label>Address</label><input value={f.address||""} onChange={e=>s("address",e.target.value)} /></div>
        <div className="field"><label>Source</label><select value={f.source} onChange={e=>s("source",e.target.value)}>{SOURCES.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>Kitchen Style</label><select value={f.style} onChange={e=>s("style",e.target.value)}>{STYLES.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>Budget (JD)</label><input type="number" value={f.budget} onChange={e=>s("budget",Number(e.target.value))} placeholder="15000" /></div>
        <div className="field"><label>Priority</label><select value={f.priority} onChange={e=>s("priority",e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></div>
        <div className="field fg-full"><label>Assigned Designer</label><select value={f.designer} onChange={e=>s("designer",e.target.value)}>{DESIGNERS_LIST.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="field fg-full"><label>Notes</label><textarea value={f.notes||""} onChange={e=>s("notes",e.target.value)} /></div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-gold" onClick={()=>{if(!f.name||!f.phone){alert("Name and phone required");return;}onSave(f);}}>{job?"Save":"Create Job"}</button>
      </div>
    </div>
  </div>);
}

// ── NOTE MODAL ─────────────────────────────────────────────────────────────
function NoteModal({id,user,onClose,onSave}) {
  const [txt,set]=useState("");
  return (<div className="ov" onClick={onClose}>
    <div className="modal" style={{width:420}} onClick={e=>e.stopPropagation()}>
      <div className="modal-title">+ Add Note</div>
      <div className="field"><label>Note</label><textarea value={txt} onChange={e=>set(e.target.value)} placeholder="e.g. Called customer, confirmed appointment…" style={{minHeight:90}} /></div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-gold" onClick={()=>{if(!txt.trim())return;onSave(id,txt.trim());}}>Save Note</button>
      </div>
    </div>
  </div>);
}

// ── WHATSAPP MODAL ─────────────────────────────────────────────────────────
const WA_MSGS = {
  contact: n=>`Hello ${n}, thank you for contacting NOVA Kitchens! We'd love to help design your dream kitchen. 🍳`,
  measurement: n=>`Hello ${n}, we'd like to confirm your measurement visit. Is the scheduled time convenient for you?`,
  design: n=>`Hello ${n}, your kitchen design is ready! We're excited to share it with you. ✏️`,
  budget: n=>`Hello ${n}, your kitchen quotation has been sent. Please review it and let us know your thoughts.`,
  contract: n=>`Hello ${n}, congratulations! Your contract has been signed and your project is now underway. 🎉`,
  factory: n=>`Hello ${n}, your kitchen is now being manufactured. We'll keep you updated on progress. 🏭`,
  installation: n=>`Hello ${n}, your kitchen is ready for installation! Our team will be with you at the scheduled time. 🔧`,
  aftersales: n=>`Hello ${n}, we hope you're enjoying your new NOVA kitchen! Do you have any feedback for us? ⭐`,
};
function WAModal({job,onClose}) {
  const msg=(WA_MSGS[job.stageId]||WA_MSGS.contact)(job.name);
  const phone=job.phone.replace(/\D/g,"");
  return (<div className="ov" onClick={onClose}>
    <div className="modal" style={{width:440}} onClick={e=>e.stopPropagation()}>
      <div className="modal-title">💬 WhatsApp — {job.name}</div>
      <div style={{fontSize:12.5,color:"var(--cr3)",marginBottom:6}}>Sending to: <strong style={{color:"var(--cr)"}}>{job.phone}</strong></div>
      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".08em",color:"var(--cr3)",marginBottom:4}}>Message:</div>
      <div className="wa-preview">{msg}</div>
      <div style={{fontSize:11,color:"var(--cr3)"}}>Stage: <span style={{color:"var(--gold)"}}>{stageObj(job.stageId)?.en}</span></div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <a href={`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="btn btn-wa" style={{textDecoration:"none"}} onClick={onClose}>💬 Open WhatsApp</a>
      </div>
    </div>
  </div>);
}

// ── QUOTE MODAL ────────────────────────────────────────────────────────────
function QuoteModal({job,onClose}) {
  const today=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
  const base=job.finalQuote||job.budget||0;
  const [items,setItems]=useState([
    {id:1,desc:"Base & Wall Cabinets",qty:1,unit:"set",price:Math.round(base*.35)},
    {id:2,desc:"Worktop & Splashback",qty:1,unit:"set",price:Math.round(base*.20)},
    {id:3,desc:"Appliances",qty:1,unit:"set",price:Math.round(base*.25)},
    {id:4,desc:"Hardware & Accessories",qty:1,unit:"set",price:Math.round(base*.10)},
    {id:5,desc:"Installation & Labour",qty:1,unit:"service",price:Math.round(base*.10)},
  ]);
  const total=items.reduce((s,it)=>s+(it.qty||0)*(it.price||0),0);
  const upd=(id,field,val)=>setItems(its=>its.map(it=>it.id===id?{...it,[field]:field==="qty"||field==="price"?Number(val):val}:it));
  const print=()=>{
    const el=document.getElementById("qp");if(!el)return;
    const w=window.open("","_blank","width=800,height=900");
    w.document.write(`<html><head><title>Quote ${job.quoteNo||""}</title><style>@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@400;500;600&display=swap');*{box-sizing:border-box}body{margin:20px;background:#fff;font-family:'Outfit',sans-serif;font-size:13px}</style></head><body>`);
    w.document.write(el.innerHTML);w.document.write("</body></html>");w.document.close();
    setTimeout(()=>w.print(),800);
  };
  return (<div className="ov" onClick={onClose}>
    <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">📄 Quote — {job.name}</div>
      <div style={{marginBottom:11}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".08em",color:"var(--cr3)",marginBottom:7}}>Edit items:</div>
        {items.map(it=>(<div key={it.id} className="qi-row">
          <input className="qi-input" value={it.desc} onChange={e=>upd(it.id,"desc",e.target.value)} placeholder="Description" />
          <input className="qi-input" type="number" value={it.qty} onChange={e=>upd(it.id,"qty",e.target.value)} />
          <input className="qi-input" value={it.unit} onChange={e=>upd(it.id,"unit",e.target.value)} />
          <input className="qi-input" type="number" value={it.price} onChange={e=>upd(it.id,"price",e.target.value)} />
          <button className="btn btn-red btn-xs" onClick={()=>setItems(its=>its.filter(x=>x.id!==it.id))}>✕</button>
        </div>))}
        <button className="btn btn-ghost btn-sm" onClick={()=>setItems(its=>[...its,{id:Date.now(),desc:"",qty:1,unit:"set",price:0}])}>+ Add Item</button>
        <div style={{textAlign:"right",fontSize:14,color:"var(--gold)",fontWeight:600,marginTop:8}}>Total: {fmt(total)}</div>
      </div>
      <div style={{height:1,background:"var(--b)",margin:"12px 0"}} />
      <div id="qp">
        <div className="quote-preview">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,paddingBottom:16,borderBottom:"2px solid #c9a84c"}}>
            <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#8a6f2e",fontWeight:700}}>✦ NOVA Kitchens</div><div style={{fontSize:11,color:"#8a6f2e",marginTop:2}}>Amman, Jordan</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"#2a2016"}}>Kitchen Design Quotation</div><div style={{fontSize:11.5,color:"#6a5a3a",marginTop:3}}>Ref: <strong>{job.quoteNo||"DRAFT"}</strong> · {today}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
            {[{l:"To",v:`${job.name} · ${job.phone}`},{l:"Style",v:job.style},{l:"Designer",v:job.designer},{l:"Valid For",v:"30 days"}].map(r=>(<div key={r.l} style={{background:"#faf8f3",borderRadius:6,padding:"9px 12px"}}><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:".1em",color:"#8a6f2e",marginBottom:3}}>{r.l}</div><div style={{fontSize:13,fontWeight:600,color:"#2a2016"}}>{r.v}</div></div>))}
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
            <thead><tr style={{background:"#2a2016"}}>{["Description","Qty","Unit","Price (JD)","Total (JD)"].map(h=><th key={h} style={{padding:"8px 10px",color:"#c9a84c",fontSize:10,textTransform:"uppercase",letterSpacing:".07em",textAlign:h.includes("Total")||h.includes("Price")?"right":"left"}}>{h}</th>)}</tr></thead>
            <tbody>
              {items.map(it=>(<tr key={it.id}><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0"}}>{it.desc}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0"}}>{it.qty}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0"}}>{it.unit}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0",textAlign:"right"}}>{Number(it.price).toLocaleString()}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0",textAlign:"right",fontWeight:600}}>{(it.qty*it.price).toLocaleString()}</td></tr>))}
              <tr style={{background:"#faf8f3"}}><td colSpan={4} style={{padding:"10px",textAlign:"right",fontWeight:700,fontSize:13}}>TOTAL</td><td style={{padding:"10px",textAlign:"right",fontWeight:700,fontSize:15,color:"#8a6f2e"}}>JD {total.toLocaleString()}</td></tr>
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:20,paddingTop:14,borderTop:"1px solid #e8e0d0"}}>
            <div style={{fontSize:11,color:"#8a6f2e",maxWidth:260,lineHeight:1.6}}>Valid 30 days from date above. Prices include materials and installation.</div>
            <div style={{textAlign:"center"}}><div style={{width:160,borderBottom:"1px solid #2a2016",height:36,marginBottom:4}} /><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:".1em",color:"#8a6f2e"}}>Authorized Signature</div></div>
          </div>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-gold" onClick={print}>🖨️ Print / Save PDF</button>
      </div>
    </div>
  </div>);
}
