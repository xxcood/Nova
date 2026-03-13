import { useState, useReducer, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   NOVA — CRM PRO v3
   Features: Login/Roles · Arabic/English · WhatsApp · PDF Quotes · Multi-user
═══════════════════════════════════════════════════════════════════════════ */

// ── TRANSLATIONS ──────────────────────────────────────────────────────────
const T = {
  en: {
    appName: "NOVA", appSub: "CRM Pro",
    login: "Sign In", logout: "Sign Out", username: "Username", password: "Password",
    wrongCreds: "Invalid username or password",
    dashboard: "Dashboard", jobs: "All Jobs", pipeline: "Pipeline",
    approvals: "Approvals", factory: "Factory", tasks: "Tasks",
    reports: "Reports", products: "Products", settings: "Settings",
    newJob: "+ New Job", editJob: "Edit Job", deleteJob: "Delete Job",
    save: "Save", cancel: "Cancel", confirm: "Confirm",
    search: "Search…", allStages: "All Stages",
    name: "Full Name", phone: "Phone", email: "Email", address: "Address",
    source: "Source", style: "Kitchen Style", budget: "Budget (JD)",
    priority: "Priority", designer: "Designer", notes: "Notes",
    stage: "Stage", progress: "Progress", lastActivity: "Last Activity",
    totalRevenue: "Total Revenue", activeJobs: "Active Jobs",
    pendingApprovals: "Pending Approvals", inFactory: "In Factory",
    completed: "Completed", advanceStage: "Advance Stage →",
    whatsapp: "WhatsApp", call: "Call", generateQuote: "Generate PDF Quote",
    approve: "✓ Approve", requestRevision: "⟳ Revision",
    contractSigned: "Contract Signed", depositReceived: "Deposit Received",
    addNote: "+ Note", activityLog: "Activity Log", noActivity: "No activity yet",
    measureDate: "Measurement Date", roomDimensions: "Room Dimensions",
    designFile: "Design File Reference", quoteNo: "Quote Number",
    finalQuote: "Final Quote (JD)", contractNo: "Contract Number",
    depositAmount: "Deposit Amount (JD)", factoryOrder: "Factory Order No.",
    productionStatus: "Production Status", installDate: "Installation Date",
    warrantyMonths: "Warranty (Months)", saveNote: "Save Note",
    noteplaceholder: "e.g. Called customer, confirmed measurement date…",
    roleAdmin: "Admin", roleDesigner: "Designer", roleSales: "Sales",
    roleFactory: "Factory", roleMgmt: "Management",
    contactInfo: "Contact", projectInfo: "Project", references: "References",
    approvalsTitle: "Approvals", custDesign: "Customer — Design",
    mgmtDesign: "Management — Design", custBudget: "Customer — Budget",
    mgmtBudget: "Management — Budget", pending: "Pending",
    approved: "Approved", revision: "Revision Requested",
    tasksList: "Tasks", checklist: "Checklist",
    pipelineHealth: "Pipeline Health", recentActivity: "Recent Activity",
    viewAll: "View All", jobsByStage: "Jobs by Stage",
    byStage: "By Stage", bySource: "By Source", byDesigner: "By Designer",
    byStyle: "By Style", performance: "Performance",
    lang: "عربي", switchLang: "Switch to Arabic",
    quoteTitle: "Kitchen Design Quotation",
    quoteFrom: "From", quoteTo: "To", quoteDate: "Date",
    quoteValid: "Valid For", quoteValidDays: "30 days",
    quoteRef: "Reference", quoteItems: "Items", quoteTotal: "Total",
    quoteNotes: "Notes", quoteSig: "Authorized Signature",
    overdue: "Overdue", dueToday: "Due Today", upcoming: "Upcoming",
    inProduction: "In Production", awaitingApproval: "Awaiting Approval",
    noJobs: "No jobs found", noApprovals: "All approvals up to date",
    noFactory: "No factory orders yet",
    warmMessage: "Sending WhatsApp to", openWhatsApp: "Open WhatsApp",
    welcomeBack: "Welcome back",
  },
  ar: {
    appName: "NOVA", appSub: "نظام إدارة العملاء",
    login: "تسجيل الدخول", logout: "تسجيل الخروج",
    username: "اسم المستخدم", password: "كلمة المرور",
    wrongCreds: "اسم المستخدم أو كلمة المرور غير صحيحة",
    dashboard: "لوحة التحكم", jobs: "جميع المشاريع", pipeline: "خط الإنتاج",
    approvals: "الموافقات", factory: "المصنع", tasks: "المهام",
    reports: "التقارير", products: "المنتجات", settings: "الإعدادات",
    newJob: "+ مشروع جديد", editJob: "تعديل المشروع", deleteJob: "حذف المشروع",
    save: "حفظ", cancel: "إلغاء", confirm: "تأكيد",
    search: "بحث…", allStages: "جميع المراحل",
    name: "الاسم الكامل", phone: "الهاتف", email: "البريد الإلكتروني",
    address: "العنوان", source: "المصدر", style: "نوع المطبخ",
    budget: "الميزانية (دينار)", priority: "الأولوية",
    designer: "المصمم", notes: "ملاحظات",
    stage: "المرحلة", progress: "التقدم", lastActivity: "آخر نشاط",
    totalRevenue: "إجمالي الإيرادات", activeJobs: "المشاريع النشطة",
    pendingApprovals: "موافقات معلقة", inFactory: "في المصنع",
    completed: "مكتمل", advanceStage: "التقدم للمرحلة التالية ←",
    whatsapp: "واتساب", call: "اتصال", generateQuote: "إنشاء عرض سعر PDF",
    approve: "✓ موافقة", requestRevision: "⟳ طلب تعديل",
    contractSigned: "تم توقيع العقد", depositReceived: "تم استلام العربون",
    addNote: "+ ملاحظة", activityLog: "سجل النشاط", noActivity: "لا يوجد نشاط",
    measureDate: "تاريخ القياس", roomDimensions: "أبعاد الغرفة",
    designFile: "مرجع ملف التصميم", quoteNo: "رقم عرض السعر",
    finalQuote: "عرض السعر النهائي (دينار)", contractNo: "رقم العقد",
    depositAmount: "مبلغ العربون (دينار)", factoryOrder: "رقم أمر التصنيع",
    productionStatus: "حالة الإنتاج", installDate: "تاريخ التركيب",
    warrantyMonths: "الضمان (أشهر)", saveNote: "حفظ الملاحظة",
    noteplaceholder: "مثال: تم الاتصال بالعميل وتأكيد موعد القياس…",
    roleAdmin: "مدير", roleDesigner: "مصمم", roleSales: "مبيعات",
    roleFactory: "مصنع", roleMgmt: "إدارة",
    contactInfo: "معلومات الاتصال", projectInfo: "معلومات المشروع",
    references: "المراجع", approvalsTitle: "الموافقات",
    custDesign: "العميل — التصميم", mgmtDesign: "الإدارة — التصميم",
    custBudget: "العميل — الميزانية", mgmtBudget: "الإدارة — الميزانية",
    pending: "معلق", approved: "موافق عليه", revision: "طلب تعديل",
    tasksList: "المهام", checklist: "قائمة التحقق",
    pipelineHealth: "صحة خط الإنتاج", recentActivity: "النشاط الأخير",
    viewAll: "عرض الكل", jobsByStage: "المشاريع حسب المرحلة",
    byStage: "حسب المرحلة", bySource: "حسب المصدر",
    byDesigner: "حسب المصمم", byStyle: "حسب النوع", performance: "الأداء",
    lang: "English", switchLang: "التبديل إلى الإنجليزية",
    quoteTitle: "عرض سعر تصميم مطبخ",
    quoteFrom: "من", quoteTo: "إلى", quoteDate: "التاريخ",
    quoteValid: "صالح لمدة", quoteValidDays: "30 يوم",
    quoteRef: "المرجع", quoteItems: "البنود", quoteTotal: "الإجمالي",
    quoteNotes: "ملاحظات", quoteSig: "التوقيع المعتمد",
    overdue: "متأخر", dueToday: "مستحق اليوم", upcoming: "قادم",
    inProduction: "قيد الإنتاج", awaitingApproval: "بانتظار الموافقة",
    noJobs: "لا توجد مشاريع", noApprovals: "جميع الموافقات محدّثة",
    noFactory: "لا توجد طلبات مصنع",
    warmMessage: "إرسال واتساب إلى", openWhatsApp: "فتح واتساب",
    welcomeBack: "مرحباً بعودتك",
  }
};

// ── USERS & ROLES ─────────────────────────────────────────────────────────
const USERS = [
  { id:1, username:"admin",    password:"admin123",   name:"Ahmad Manager",   role:"admin",    avatar:"AM", color:"#3d5c38" },
  { id:2, username:"sara",     password:"sara123",    name:"Sara Al-Khatib",  role:"designer", avatar:"SA", color:"#41546a" },
  { id:3, username:"omar",     password:"omar123",    name:"Omar Nasser",     role:"designer", avatar:"ON", color:"#5c3b3b" },
  { id:4, username:"leila",    password:"leila123",   name:"Leila Haddad",    role:"designer", avatar:"LH", color:"#5c4e3b" },
  { id:5, username:"karim",    password:"karim123",   name:"Karim Mansour",   role:"designer", avatar:"KM", color:"#3b5a5c" },
  { id:6, username:"sales",    password:"sales123",   name:"Sales Team",      role:"sales",    avatar:"ST", color:"#523b5c" },
  { id:7, username:"factory",  password:"factory123", name:"Factory Manager", role:"factory",  avatar:"FM", color:"#4a3b5c" },
  { id:8, username:"mgmt",     password:"mgmt123",    name:"Management",      role:"mgmt",     avatar:"MG", color:"#3b4a5c" },
];

// Role permissions
const PERMS = {
  admin:    { canEdit:true,  canDelete:true,  canApprove:true,  canFactory:true,  seeAll:true  },
  mgmt:     { canEdit:false, canDelete:false, canApprove:true,  canFactory:false, seeAll:true  },
  designer: { canEdit:true,  canDelete:false, canApprove:false, canFactory:false, seeAll:false },
  sales:    { canEdit:true,  canDelete:false, canApprove:false, canFactory:false, seeAll:true  },
  factory:  { canEdit:false, canDelete:false, canApprove:false, canFactory:true,  seeAll:true  },
};

// ── PIPELINE STAGES ───────────────────────────────────────────────────────
const STAGES = [
  { id:"contact",      en:"First Contact",        ar:"التواصل الأول",       icon:"📞", color:"#5ca8e0",
    tasksEn:["Identify source","Qualify budget","Log customer info","Assign designer"],
    tasksAr:["تحديد المصدر","تحديد الميزانية","تسجيل بيانات العميل","تعيين المصمم"] },
  { id:"measurement",  en:"Measurement Visit",    ar:"زيارة القياس",        icon:"📐", color:"#7ec8e3",
    tasksEn:["Book site visit","Record room dimensions","Note plumbing/electric","Take photos"],
    tasksAr:["حجز الزيارة","تسجيل أبعاد الغرفة","ملاحظة السباكة/الكهرباء","التقاط صور"] },
  { id:"design",       en:"Design Creation",      ar:"إنشاء التصميم",       icon:"✏️", color:"#c9a84c",
    tasksEn:["Create 2D floor plan","Render 3D design","Select materials","Prepare design pack"],
    tasksAr:["إنشاء مخطط 2D","تصيير التصميم 3D","اختيار المواد","إعداد حزمة التصميم"] },
  { id:"cust_approval", en:"Customer Approval",   ar:"موافقة العميل",       icon:"👤", color:"#e08c3c",
    tasksEn:["Present design","Note revision requests","Get written approval","Update if needed"],
    tasksAr:["عرض التصميم","تدوين طلبات التعديل","الحصول على موافقة خطية","التحديث إذا لزم"] },
  { id:"mgmt_approval", en:"Management Approval", ar:"موافقة الإدارة",      icon:"🏛️", color:"#d4a843",
    tasksEn:["Submit to management","Review costings","Get sign-off","Finalize spec"],
    tasksAr:["تقديم للإدارة","مراجعة التكاليف","الحصول على موافقة","إنهاء المواصفات"] },
  { id:"budget",       en:"Budget & Quotation",   ar:"الميزانية والعرض",    icon:"💰", color:"#9c6ce0",
    tasksEn:["Prepare itemized quote","Apply discounts","Send formal quotation","Follow up"],
    tasksAr:["إعداد عرض مفصل","تطبيق الخصومات","إرسال عرض رسمي","المتابعة"] },
  { id:"contract",     en:"Sign Contract",        ar:"توقيع العقد",         icon:"📝", color:"#4caf7d",
    tasksEn:["Prepare contract","Collect deposit 50%","Get signature","Log contract number"],
    tasksAr:["إعداد العقد","تحصيل العربون 50%","الحصول على التوقيع","تسجيل رقم العقد"] },
  { id:"factory",      en:"Factory / Production", ar:"المصنع / الإنتاج",    icon:"🏭", color:"#e05ca0",
    tasksEn:["Send production order","Confirm factory receipt","Track production","QC check"],
    tasksAr:["إرسال أمر الإنتاج","تأكيد استلام المصنع","متابعة الإنتاج","فحص الجودة"] },
  { id:"installation", en:"Delivery & Installation", ar:"التسليم والتركيب", icon:"🔧", color:"#4caf7d",
    tasksEn:["Schedule delivery","Confirm install team","Complete installation","Customer sign-off"],
    tasksAr:["جدولة التسليم","تأكيد فريق التركيب","إتمام التركيب","توقيع العميل"] },
  { id:"aftersales",   en:"After-Sales",           ar:"ما بعد البيع",        icon:"⭐", color:"#c9a84c",
    tasksEn:["Send satisfaction survey","Log snagging issues","Issue warranty cert","Request review"],
    tasksAr:["إرسال استبيان","تسجيل المشكلات","إصدار شهادة الضمان","طلب تقييم"] },
];
const STAGE_IDS = STAGES.map(s=>s.id);
const SOURCES = ["Walk-In","Referral","Website","Instagram","Facebook","Phone","Exhibition","Google Ads","Partner"];
const SOURCES_AR = ["زيارة مباشرة","إحالة","موقع إلكتروني","إنستغرام","فيسبوك","هاتف","معرض","إعلانات جوجل","شريك"];
const STYLES = ["Modern","Classic","Contemporary","Rustic","Industrial","Minimalist","Traditional","Bespoke"];
const STYLES_AR = ["عصري","كلاسيكي","معاصر","ريفي","صناعي","بسيط","تقليدي","مخصص"];
const DESIGNERS = ["Sara Al-Khatib","Omar Nasser","Leila Haddad","Karim Mansour"];
const FACTORY_STATUSES = ["Order Sent","Confirmed","In Production","QC Check","Ready for Delivery","Delivered"];
const FACTORY_STATUSES_AR = ["تم إرسال الطلب","تم التأكيد","قيد الإنتاج","فحص الجودة","جاهز للتسليم","تم التسليم"];

const mkApprovals = () => ({ customer_design:null, management_design:null, customer_budget:null, management_budget:null, contract_signed:false, deposit_received:false });

// ── SEED DATA ─────────────────────────────────────────────────────────────
const SEED_JOBS = [
  { id:1, name:"Ahmad Al-Rashid", phone:"+962791234567", email:"ahmad@email.com", address:"Abdoun, Amman", source:"Referral", style:"Modern", priority:"High", budget:18500, finalQuote:17800, deposit:8900, stageId:"installation", designer:"Sara Al-Khatib", notes:"Prefers white lacquer. Island with seating.", measureDate:"2026-02-10", measureNotes:"4.2m x 3.8m. Gas on north wall.", designFile:"KIT-2026-041-3D.pdf", quoteNo:"Q-2026-041", contractNo:"C-2026-019", factoryOrderNo:"FAC-2026-088", factoryStatus:"In Production", installDate:"2026-03-18", warrantyMonths:24, approvals:{ customer_design:"approved", management_design:"approved", customer_budget:"approved", management_budget:"approved", contract_signed:true, deposit_received:true }, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:4,contract:4,factory:3,installation:1,aftersales:0}, createdAt:"2026-01-15", lastActivity:"2026-03-08", activityLog:[{id:"a1",date:"2026-03-08",text:"Installation scheduled for 2026-03-18",user:"Ahmad Manager"},{id:"a2",date:"2026-03-01",text:"Factory order confirmed FAC-2026-088",user:"Factory Manager"},{id:"a3",date:"2026-02-20",text:"Contract signed, deposit JD 8,900 received",user:"Sales Team"}] },
  { id:2, name:"Mona Khalil", phone:"+962772345678", email:"mona.k@mail.com", address:"Swefieh, Amman", source:"Instagram", style:"Classic", priority:"High", budget:12000, finalQuote:11500, deposit:null, stageId:"budget", designer:"Omar Nasser", notes:"Wants marble countertops.", measureDate:"2026-02-25", measureNotes:"3.6m x 2.9m. U-shape.", designFile:"KIT-2026-047-3D.pdf", quoteNo:"Q-2026-047", contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, approvals:{ customer_design:"approved", management_design:"approved", customer_budget:null, management_budget:"approved", contract_signed:false, deposit_received:false }, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:2,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-01", lastActivity:"2026-03-07", activityLog:[{id:"b1",date:"2026-03-07",text:"Quote Q-2026-047 sent to customer",user:"Omar Nasser"}] },
  { id:3, name:"Tariq Hussain", phone:"+962783456789", email:"tariq.h@email.jo", address:"Gardens, Amman", source:"Walk-In", style:"Contemporary", priority:"Medium", budget:9500, finalQuote:null, deposit:null, stageId:"design", designer:"Leila Haddad", notes:"Open-plan preference.", measureDate:"2026-03-02", measureNotes:"5.1m x 4.0m open plan.", designFile:null, quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, approvals:mkApprovals(), completedTasks:{contact:4,measurement:4,design:1,cust_approval:0,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-20", lastActivity:"2026-03-05", activityLog:[{id:"c1",date:"2026-03-05",text:"Measurement visit completed",user:"Leila Haddad"}] },
  { id:4, name:"Rana Aziz", phone:"+962794567890", email:"rana@home.com", address:"Dabouq, Amman", source:"Website", style:"Minimalist", priority:"Medium", budget:22000, finalQuote:null, deposit:null, stageId:"measurement", designer:"Karim Mansour", notes:"High-end project.", measureDate:"2026-03-13", measureNotes:null, designFile:null, quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, approvals:mkApprovals(), completedTasks:{contact:4,measurement:0,design:0,cust_approval:0,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-03-08", lastActivity:"2026-03-08", activityLog:[{id:"d1",date:"2026-03-08",text:"Lead created from website enquiry",user:"Sales Team"}] },
  { id:5, name:"Sami Qasim", phone:"+962775678901", email:"sami.q@email.com", address:"Khalda, Amman", source:"Referral", style:"Modern", priority:"High", budget:31000, finalQuote:30500, deposit:15250, stageId:"aftersales", designer:"Sara Al-Khatib", notes:"Installation complete. Very satisfied.", measureDate:"2025-12-01", measureNotes:"6.0m x 4.5m large kitchen.", designFile:"KIT-2026-018-3D.pdf", quoteNo:"Q-2026-018", contractNo:"C-2026-005", factoryOrderNo:"FAC-2026-022", factoryStatus:"Delivered", installDate:"2026-02-15", warrantyMonths:24, approvals:{ customer_design:"approved", management_design:"approved", customer_budget:"approved", management_budget:"approved", contract_signed:true, deposit_received:true }, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:4,contract:4,factory:4,installation:4,aftersales:2}, createdAt:"2025-11-20", lastActivity:"2026-03-01", activityLog:[{id:"e1",date:"2026-03-01",text:"Satisfaction survey sent",user:"Ahmad Manager"},{id:"e2",date:"2026-02-15",text:"Installation completed and signed off",user:"Sara Al-Khatib"}] },
  { id:6, name:"Faris Al-Omari", phone:"+962797890123", email:"faris@omari.jo", address:"Jubeiha, Amman", source:"Phone", style:"Rustic", priority:"Medium", budget:15000, finalQuote:null, deposit:null, stageId:"cust_approval", designer:"Leila Haddad", notes:"Farmhouse style. Wants solid wood.", measureDate:"2026-02-28", measureNotes:"4.8m x 3.2m. Existing island.", designFile:"KIT-2026-052-DRAFT.pdf", quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, approvals:{ customer_design:null, management_design:"approved", customer_budget:null, management_budget:null, contract_signed:false, deposit_received:false }, completedTasks:{contact:4,measurement:4,design:4,cust_approval:1,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-10", lastActivity:"2026-03-06", activityLog:[{id:"f1",date:"2026-03-06",text:"Design presented to customer",user:"Leila Haddad"}] },
];

const QUOTE_ITEMS_DEFAULT = [
  { desc:"Base Cabinets (custom)", qty:1, unit:"set", price:0 },
  { desc:"Wall Cabinets", qty:1, unit:"set", price:0 },
  { desc:"Worktop", qty:1, unit:"m²", price:0 },
  { desc:"Appliances", qty:1, unit:"set", price:0 },
  { desc:"Installation", qty:1, unit:"service", price:0 },
];

// ── HELPERS ───────────────────────────────────────────────────────────────
const AV_COLORS = ["#3d5c38","#3b506b","#5c3b3b","#5c4e3b","#3b5a5c","#523b5c"];
const initials = n => n.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
const fmt = n => n ? `JD ${Number(n).toLocaleString()}` : "—";
const fmtD = (d,lang) => { if(!d) return "—"; return new Date(d).toLocaleDateString(lang==="ar"?"ar-JO":"en-GB",{day:"2-digit",month:"short",year:"numeric"}); };
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const stageIdx = id => STAGE_IDS.indexOf(id);
const stageObj = id => STAGES.find(s=>s.id===id);
const stageLabel = (id,lang) => { const s=stageObj(id); return s ? (lang==="ar"?s.ar:s.en) : id; };
const completionPct = ct => { const v=Object.values(ct); return Math.round(v.reduce((a,b)=>a+b,0)/(STAGES.length*4)*100); };
const STAGE_BADGE = { contact:"b-blue", measurement:"b-blue", design:"b-gold", cust_approval:"b-orange", mgmt_approval:"b-orange", budget:"b-purple", contract:"b-green", factory:"b-pink", installation:"b-green", aftersales:"b-gold" };

// WhatsApp message templates
const waTemplates = {
  contact: (name,lang) => lang==="ar" ? `مرحباً ${name}، شكراً لتواصلك مع NOVA! يسعدنا خدمتك.` : `Hello ${name}, thank you for contacting NOVA! We'd love to help design your dream kitchen.`,
  measurement: (name,lang) => lang==="ar" ? `مرحباً ${name}، نود تأكيد موعد الزيارة لأخذ القياسات. هل الوقت المحدد مناسب لك؟` : `Hello ${name}, we'd like to confirm your measurement visit appointment. Is the scheduled time convenient for you?`,
  design: (name,lang) => lang==="ar" ? `مرحباً ${name}، تصميم مطبخك جاهز! نحن متحمسون لمشاركته معك.` : `Hello ${name}, your kitchen design is ready! We're excited to share it with you.`,
  budget: (name,lang) => lang==="ar" ? `مرحباً ${name}، تم إرسال عرض السعر الخاص بمطبخك. يرجى مراجعته وإخبارنا برأيك.` : `Hello ${name}, your kitchen quotation has been sent. Please review it and let us know your thoughts.`,
  contract: (name,lang) => lang==="ar" ? `مرحباً ${name}، مبروك! تم توقيع عقدك وبدأ العمل على مشروعك.` : `Hello ${name}, congratulations! Your contract has been signed and your project is now underway.`,
  factory: (name,lang) => lang==="ar" ? `مرحباً ${name}، مطبخك قيد التصنيع الآن في المصنع. سنبقيك على اطلاع بالتقدم.` : `Hello ${name}, your kitchen is now being manufactured. We'll keep you updated on progress.`,
  installation: (name,lang) => lang==="ar" ? `مرحباً ${name}، مطبخك جاهز للتركيب! فريقنا سيكون لديك في الموعد المحدد.` : `Hello ${name}, your kitchen is ready for installation! Our team will be with you at the scheduled time.`,
  aftersales: (name,lang) => lang==="ar" ? `مرحباً ${name}، نأمل أنك راضٍ عن مطبخك الجديد! هل لديك أي ملاحظات؟` : `Hello ${name}, we hope you're enjoying your new kitchen! Do you have any feedback for us?`,
};

// ── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700&family=Outfit:wght@300;400;500;600&display=swap');
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
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:4px}

/* Login */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden}
.login-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%, rgba(201,168,76,.06) 0%, transparent 60%),radial-gradient(ellipse at 70% 80%, rgba(90,174,224,.04) 0%, transparent 50%)}
.login-card{background:var(--sf);border:1px solid var(--b2);border-radius:16px;padding:40px;width:380px;position:relative;z-index:1}
.login-logo{font-family:var(--fd);font-size:26px;color:var(--gold);text-align:center;margin-bottom:4px}
.login-sub{font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:var(--cr3);text-align:center;margin-bottom:32px}
.login-err{background:rgba(224,85,85,.12);border:1px solid rgba(224,85,85,.3);border-radius:8px;padding:10px 14px;font-size:12.5px;color:var(--red);margin-bottom:14px;text-align:center}
.login-users{margin-top:20px;padding-top:20px;border-top:1px solid var(--b)}
.login-users-title{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--cr3);margin-bottom:10px;text-align:center}
.login-user-chip{display:inline-flex;align-items:center;gap:6px;background:var(--sf2);border:1px solid var(--b);border-radius:20px;padding:4px 10px;font-size:11px;color:var(--cr2);cursor:pointer;transition:var(--tr);margin:3px}
.login-user-chip:hover{border-color:var(--gd);color:var(--cr)}

/* App layout */
.app{display:flex;height:100vh;overflow:hidden}
.sb{width:228px;min-width:228px;background:var(--sf);border-right:1px solid var(--b);display:flex;flex-direction:column;overflow-y:auto;transition:var(--tr)}
.rtl .sb{border-right:none;border-left:1px solid var(--b)}
.sb-logo{padding:20px 16px 16px;border-bottom:1px solid var(--b)}
.sb-logo-main{font-family:var(--fd);font-size:19px;color:var(--gold);letter-spacing:.04em}
.rtl .sb-logo-main{font-family:var(--fa);letter-spacing:0}
.sb-logo-sub{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:var(--cr3);margin-top:3px}
.rtl .sb-logo-sub{letter-spacing:0;font-size:10px}
.sb-user{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--b);background:var(--sf2)}
.sb-user-name{font-size:12px;font-weight:500;color:var(--cr)}
.sb-user-role{font-size:10px;color:var(--cr3);text-transform:uppercase;letter-spacing:.08em}
.sb-section{padding:12px 8px 0}
.sb-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.16em;color:var(--gd);padding:0 8px;margin-bottom:5px}
.rtl .sb-lbl{letter-spacing:0;font-size:10px}
.sb-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;color:var(--cr2);font-size:12.5px;font-weight:400;transition:var(--tr);user-select:none;position:relative}
.rtl .sb-item{flex-direction:row-reverse;text-align:right}
.sb-item:hover{background:var(--sf2);color:var(--cr)}
.sb-item.on{background:var(--gg);color:var(--gold)}
.sb-item .ico{width:17px;text-align:center;font-size:14px;flex-shrink:0}
.sb-badge{margin-left:auto;background:var(--gold);color:#000;font-size:10px;font-weight:700;border-radius:20px;padding:1px 6px}
.rtl .sb-badge{margin-left:0;margin-right:auto}
.sb-badge.red{background:var(--red);color:#fff}
.sb-bottom{margin-top:auto;padding:12px 8px;border-top:1px solid var(--b)}

/* Main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{background:var(--sf);border-bottom:1px solid var(--b);height:52px;padding:0 20px;display:flex;align-items:center;gap:10px;flex-shrink:0}
.topbar-title{font-family:var(--fd);font-size:20px;color:var(--cr);flex:1}
.rtl .topbar-title{font-family:var(--fa);font-size:18px;text-align:right}
.topbar-title small{font-family:var(--fb);font-size:11px;color:var(--cr3);margin-left:8px;font-weight:300}
.rtl .topbar-title small{font-family:var(--fa);margin-left:0;margin-right:8px}
.content{flex:1;overflow-y:auto;padding:18px}

/* Buttons */
.btn{padding:6px 13px;border-radius:8px;border:none;cursor:pointer;font-family:var(--fb);font-size:12.5px;font-weight:500;transition:var(--tr);display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.rtl .btn{font-family:var(--fa)}
.btn-gold{background:var(--gold);color:#000}.btn-gold:hover{background:#d4b460}
.btn-ghost{background:var(--sf2);color:var(--cr2);border:1px solid var(--b)}.btn-ghost:hover{color:var(--cr);border-color:var(--b2)}
.btn-green{background:rgba(77,184,122,.14);color:var(--green);border:1px solid rgba(77,184,122,.3)}.btn-green:hover{background:rgba(77,184,122,.24)}
.btn-red{background:rgba(224,85,85,.12);color:var(--red);border:1px solid rgba(224,85,85,.25)}.btn-red:hover{background:rgba(224,85,85,.22)}
.btn-wa{background:rgba(37,211,102,.13);color:#25d366;border:1px solid rgba(37,211,102,.3)}.btn-wa:hover{background:rgba(37,211,102,.22)}
.btn-blue{background:rgba(90,174,224,.13);color:var(--blue);border:1px solid rgba(90,174,224,.25)}
.btn-sm{padding:4px 10px;font-size:11.5px}
.btn-xs{padding:2px 8px;font-size:11px}

/* Cards */
.card{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:18px}
.card-title{font-family:var(--fd);font-size:16px;color:var(--cr);margin-bottom:14px}
.rtl .card-title{font-family:var(--fa);font-size:15px}

/* Stats */
.stats-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
.stat{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:14px;position:relative;overflow:hidden}
.stat::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--gold))}
.stat-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--cr3)}
.rtl .stat-lbl{letter-spacing:0;font-size:11px}
.stat-val{font-family:var(--fd);font-size:26px;color:var(--cr);margin:3px 0 1px}
.stat-sub{font-size:10.5px;color:var(--cr3)}
.stat-ico{position:absolute;right:12px;top:12px;font-size:20px;opacity:.18}
.rtl .stat-ico{right:auto;left:12px}

/* Table */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th{padding:9px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;letter-spacing:.09em;color:var(--gd);font-weight:500;border-bottom:1px solid var(--b);white-space:nowrap}
.rtl th{text-align:right;letter-spacing:0;font-size:10.5px}
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
.stage-track{display:flex;gap:0;margin-bottom:16px;border-radius:8px;overflow:hidden;border:1px solid var(--b)}
.stage-step{flex:1;padding:7px 3px;text-align:center;font-size:8.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;cursor:pointer;transition:var(--tr);border-right:1px solid var(--b)}
.rtl .stage-step{border-right:none;border-left:1px solid var(--b);letter-spacing:0;font-size:9px;font-family:var(--fa)}
.stage-step:last-child{border-right:none}
.rtl .stage-step:last-child{border-left:none}
.stage-step:hover{filter:brightness(1.15)}
.stage-step-icon{font-size:13px;display:block;margin-bottom:2px}
.stage-step-short{font-size:8px;line-height:1.2;display:block}
.rtl .stage-step-short{font-size:9px}

/* Job detail */
.job-layout{display:grid;grid-template-columns:1fr 300px;gap:14px}
.stage-panel{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);overflow:hidden}
.stage-panel-head{padding:14px 16px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:10px}
.stage-panel-body{padding:16px}
.checklist{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
.check-item{display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;background:var(--sf2);border:1px solid var(--b);cursor:pointer;transition:var(--tr)}
.rtl .check-item{flex-direction:row-reverse}
.check-item:hover{border-color:var(--b2)}
.check-item.done{border-color:rgba(77,184,122,.3);background:rgba(77,184,122,.06)}
.check-box{width:17px;height:17px;border-radius:5px;border:1.5px solid var(--b2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--tr);font-size:10px}
.check-item.done .check-box{background:var(--green);border-color:var(--green);color:#fff}
.check-lbl{font-size:12.5px;color:var(--cr2);flex:1}
.rtl .check-lbl{font-family:var(--fa)}
.check-item.done .check-lbl{color:var(--cr3);text-decoration:line-through}

/* Approval */
.appr-card{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:10px 12px}
.appr-card.approved{border-color:rgba(77,184,122,.35);background:rgba(77,184,122,.07)}
.appr-card.revision{border-color:rgba(224,85,85,.35);background:rgba(224,85,85,.07)}
.appr-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--cr3);margin-bottom:5px}
.rtl .appr-lbl{letter-spacing:0;font-size:11px;font-family:var(--fa)}
.appr-status{font-size:12.5px;font-weight:600}
.appr-btns{display:flex;gap:5px;margin-top:6px;flex-wrap:wrap}

/* Customer panel */
.cust-side{display:flex;flex-direction:column;gap:10px}
.info-blk{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:13px}
.info-ttl{font-size:9.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--gd);margin-bottom:9px}
.rtl .info-ttl{letter-spacing:0;font-size:11px;font-family:var(--fa)}
.info-row{display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid rgba(42,38,30,.4);font-size:12.5px;gap:8px}
.rtl .info-row{flex-direction:row-reverse}
.info-row:last-child{border-bottom:none}
.info-key{color:var(--cr3);white-space:nowrap;flex-shrink:0}
.info-val{color:var(--cr);font-weight:500;text-align:right;word-break:break-word}
.rtl .info-val{text-align:left}
.gold-val{color:var(--gold);font-weight:600}

/* Activity log */
.act-log{display:flex;flex-direction:column}
.act-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(42,38,30,.4)}
.act-item:last-child{border-bottom:none}
.act-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0;margin-top:5px}
.act-text{font-size:12px;color:var(--cr2);flex:1;line-height:1.5}
.act-user{font-size:10.5px;color:var(--gd);margin-top:1px}
.act-date{font-size:10.5px;color:var(--cr3);margin-top:1px}

/* Modal */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px);animation:fi .15s ease}
@keyframes fi{from{opacity:0}to{opacity:1}}
.modal{background:var(--sf);border:1px solid var(--b2);border-radius:14px;padding:24px;width:580px;max-width:96vw;max-height:92vh;overflow-y:auto;animation:su .2s ease}
.modal-lg{width:720px}
@keyframes su{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
.modal-title{font-family:var(--fd);font-size:20px;color:var(--gold);margin-bottom:16px}
.rtl .modal-title{font-family:var(--fa)}
.modal-foot{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--b)}
.rtl .modal-foot{flex-direction:row-reverse}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.fg-full{grid-column:1/-1}
.field{display:flex;flex-direction:column;gap:4px}
.field label{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--cr3)}
.rtl .field label{letter-spacing:0;font-size:11px;font-family:var(--fa)}
.field input,.field select,.field textarea{background:var(--sf2);border:1px solid var(--b);border-radius:7px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;transition:var(--tr);width:100%}
.rtl .field input,.rtl .field select,.rtl .field textarea{font-family:var(--fa);text-align:right}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--gold2);box-shadow:0 0 0 3px var(--gg)}
.field textarea{resize:vertical;min-height:68px}
select option{background:var(--sf2)}

/* Search */
.search-in{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:7px 11px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;width:195px;transition:var(--tr)}
.search-in:focus{border-color:var(--gold2);width:230px}
.filter-sel{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none}

/* Pipeline */
.kanban-wrap{overflow-x:auto;padding-bottom:8px}
.kanban{display:grid;gap:9px;min-width:1600px}
.kanban-col{background:var(--sf);border:1px solid var(--b);border-radius:var(--r)}
.kanban-head{padding:9px 10px;border-bottom:1px solid var(--b)}
.kanban-title{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em}
.rtl .kanban-title{letter-spacing:0;font-size:11px;font-family:var(--fa)}
.kanban-meta{font-size:10px;color:var(--cr3);margin-top:2px}
.kanban-cnt{font-size:10px;background:var(--sf2);border-radius:20px;padding:1px 6px;color:var(--cr3)}
.kanban-cards{padding:8px;display:flex;flex-direction:column;gap:6px;min-height:70px}
.k-card{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:8px;cursor:pointer;transition:var(--tr)}
.k-card:hover{border-color:var(--b2);transform:translateY(-1px)}
.k-name{font-size:12.5px;font-weight:500;color:var(--cr)}
.k-val{font-size:12px;color:var(--gold);margin-top:2px}
.k-meta{font-size:10.5px;color:var(--cr3);margin-top:2px}

/* Progress */
.prog{height:4px;border-radius:4px;background:var(--b);overflow:hidden;margin-top:5px}
.prog-fill{height:100%;border-radius:4px;transition:width .4s ease}

/* Toast */
.toast{position:fixed;bottom:20px;right:20px;z-index:999;background:var(--sf);border:1px solid var(--b);border-left:3px solid var(--gold);border-radius:8px;padding:10px 15px;font-size:12.5px;color:var(--cr);box-shadow:0 6px 24px rgba(0,0,0,.5);animation:tri .25s ease;max-width:320px}
.rtl .toast{right:auto;left:20px;border-left:1px solid var(--b);border-right:3px solid var(--gold);font-family:var(--fa)}
@keyframes tri{from{transform:translateX(50px);opacity:0}to{transform:none;opacity:1}}
.rtl .toast{animation:trir .25s ease}
@keyframes trir{from{transform:translateX(-50px);opacity:0}to{transform:none;opacity:1}}

/* Avatar */
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}

/* WhatsApp modal */
.wa-preview{background:var(--sf2);border:1px solid var(--b);border-radius:12px;padding:14px;margin:12px 0;font-size:13px;color:var(--cr2);line-height:1.7;white-space:pre-wrap;border-left:3px solid #25d366}
.rtl .wa-preview{border-left:1px solid var(--b);border-right:3px solid #25d366;font-family:var(--fa);text-align:right}

/* PDF Quote */
.quote-preview{background:#fff;color:#1a1a1a;border-radius:8px;padding:32px;font-family:'Outfit',sans-serif;min-height:500px}
.quote-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #c9a84c}
.quote-company{font-family:'Cormorant Garamond',serif;font-size:22px;color:#8a6f2e;font-weight:700}
.quote-title-big{font-family:'Cormorant Garamond',serif;font-size:20px;color:#2a2016;margin-bottom:4px}
.quote-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px}
.q-meta-blk{background:#faf8f3;border-radius:6px;padding:10px 12px}
.q-meta-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#8a6f2e;margin-bottom:4px}
.q-meta-val{font-size:13px;font-weight:600;color:#2a2016}
.quote-items-table{width:100%;border-collapse:collapse;margin-bottom:16px}
.quote-items-table th{padding:8px 10px;background:#2a2016;color:#c9a84c;font-size:10px;text-transform:uppercase;letter-spacing:.08em;text-align:left}
.quote-items-table td{padding:8px 10px;border-bottom:1px solid #e8e0d0;font-size:12.5px}
.quote-items-table tr:last-child td{border-bottom:none}
.quote-total-row{background:#faf8f3;font-weight:700}
.quote-footer{margin-top:24px;padding-top:16px;border-top:1px solid #e8e0d0;display:flex;justify-content:space-between;align-items:flex-end}
.quote-sig-line{width:180px;border-bottom:1px solid #2a2016;margin-bottom:6px;height:40px}
.quote-sig-lbl{font-size:10px;color:#8a6f2e;text-transform:uppercase;letter-spacing:.08em}

/* Quote items editor */
.qi-row{display:grid;grid-template-columns:2fr 60px 80px 100px 32px;gap:6px;align-items:center;margin-bottom:6px}
.qi-input{background:var(--sf2);border:1px solid var(--b);border-radius:6px;padding:6px 8px;color:var(--cr);font-family:var(--fb);font-size:12px;outline:none;width:100%}
.qi-input:focus{border-color:var(--gold2)}

/* Inline field save */
.inline-field{display:flex;gap:6px;align-items:center}
.inline-field input,.inline-field select{flex:1;background:var(--sf2);border:1px solid var(--b);border-radius:7px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;transition:var(--tr)}
.rtl .inline-field input,.rtl .inline-field select{font-family:var(--fa);text-align:right}
.inline-field input:focus,.inline-field select:focus{border-color:var(--gold2)}

/* Misc */
.empty{text-align:center;padding:32px 20px;color:var(--cr3);font-size:12.5px}
.empty .ei{font-size:26px;margin-bottom:8px}
.two-col{display:grid;grid-template-columns:1fr 300px;gap:14px}
.role-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.07em}
.tabs{display:flex;gap:2px;background:var(--sf2);border-radius:8px;padding:3px;margin-bottom:14px;width:fit-content}
.tab{padding:5px 12px;border-radius:6px;font-size:12.5px;cursor:pointer;color:var(--cr3);transition:var(--tr)}
.tab.on{background:var(--sf);color:var(--cr)}
.divider{height:1px;background:var(--b);margin:12px 0}
.rtl .info-val{font-family:var(--fa)}
.rtl .badge{font-family:var(--fa)}

@media(max-width:900px){
  .sb{width:180px;min-width:180px}
  .stats-row{grid-template-columns:repeat(3,1fr)}
  .two-col,.job-layout{grid-template-columns:1fr}
}
`;

// ── REDUCER ───────────────────────────────────────────────────────────────
function reducer(s, a) {
  const log = (text, user) => ({ id:uid(), date:new Date().toISOString().slice(0,10), text, user: user||"System" });
  switch(a.type) {
    case "VIEW": return {...s, view:a.v, sel:null};
    case "SEL": return {...s, sel:a.id, view:"job"};
    case "MODAL": return {...s, modal:a.modal, mdata:a.data||null};
    case "CLM": return {...s, modal:null, mdata:null};
    case "LANG": return {...s, lang: s.lang==="en"?"ar":"en"};
    case "SEARCH": return {...s, search:a.v};
    case "FILTER": return {...s, filter:a.v};
    case "TOAST": return {...s, toast:a.msg};
    case "CTST": return {...s, toast:null};
    case "ADD_JOB": {
      const j = {...a.job, id:uid(), createdAt:new Date().toISOString().slice(0,10), lastActivity:new Date().toISOString().slice(0,10), stageId:"contact", approvals:mkApprovals(), activityLog:[log("Job created — "+a.job.source, a.user)], completedTasks:{contact:0,measurement:0,design:0,cust_approval:0,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, finalQuote:null, deposit:null, quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, designFile:null };
      return {...s, jobs:[j,...s.jobs], modal:null, toast:"✦ "+j.name+" added"};
    }
    case "UPD_JOB": {
      const jobs = s.jobs.map(j=>j.id===a.job.id?{...j,...a.job}:j);
      return {...s, jobs, modal:null, toast:"Job updated"};
    }
    case "DEL_JOB": return {...s, jobs:s.jobs.filter(j=>j.id!==a.id), sel:null, view:"jobs", toast:"Job deleted"};
    case "ADV_STAGE": {
      const j=s.jobs.find(x=>x.id===a.id); const idx=stageIdx(j.stageId);
      if(idx>=STAGE_IDS.length-1) return s;
      const ns=STAGE_IDS[idx+1];
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,stageId:ns,lastActivity:new Date().toISOString().slice(0,10),activityLog:[log(`Advanced to: ${stageObj(ns)?.en}`,a.user),...(x.activityLog||[])]}:x);
      return {...s,jobs,toast:`→ ${stageObj(ns)?.en}`};
    }
    case "SET_STAGE": {
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,stageId:a.stage,lastActivity:new Date().toISOString().slice(0,10),activityLog:[log(`Stage → ${stageObj(a.stage)?.en}`,a.user),...(x.activityLog||[])]}:x);
      return {...s,jobs,toast:`Stage → ${stageObj(a.stage)?.en}`};
    }
    case "TOGGLE_TASK": {
      const j=s.jobs.find(x=>x.id===a.id); const cur=j.completedTasks[a.stage]||0;
      const max=stageObj(a.stage).tasksEn.length; const next=a.idx<cur?cur-1:Math.min(cur+1,max);
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,completedTasks:{...x.completedTasks,[a.stage]:next}}:x);
      return {...s,jobs};
    }
    case "SET_APPR": {
      const l=log(`${a.key.replace(/_/g," ")} → ${a.val}`,a.user);
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,approvals:{...x.approvals,[a.key]:a.val},activityLog:[l,...(x.activityLog||[])],lastActivity:l.date}:x);
      return {...s,jobs,toast:"Approval updated"};
    }
    case "ADD_LOG": {
      const l=log(a.text,a.user);
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,activityLog:[l,...(x.activityLog||[])],lastActivity:l.date}:x);
      return {...s,jobs,modal:null,toast:"Note added"};
    }
    case "UPD_FIELD": {
      const l=log(`${a.field} updated`,a.user);
      const jobs=s.jobs.map(x=>x.id===a.id?{...x,[a.field]:a.val,activityLog:[l,...(x.activityLog||[])],lastActivity:l.date}:x);
      return {...s,jobs,toast:"Saved ✓"};
    }
    default: return s;
  }
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null);
  const [state, dispatch] = useReducer(reducer, { jobs:SEED_JOBS, view:"dashboard", sel:null, modal:null, mdata:null, search:"", filter:"all", toast:null, lang:"en" });
  const { jobs, view, sel, modal, mdata, search, filter, toast, lang } = state;
  const t = T[lang];
  const rtl = lang==="ar";
  const d = useCallback(a=>dispatch(a),[]);
  const perm = auth ? PERMS[auth.role] : {};

  useEffect(()=>{if(toast){const x=setTimeout(()=>d({type:"CTST"}),3200);return()=>clearTimeout(x);}},[toast]);

  if(!auth) return <LoginScreen lang={lang} t={t} rtl={rtl} onLogin={u=>setAuth(u)} onLang={()=>d({type:"LANG"})} />;

  const selJob = jobs.find(j=>j.id===sel);
  const filtered = jobs.filter(j=>{
    const q=search.toLowerCase();
    const mq=!q||j.name.toLowerCase().includes(q)||j.phone.includes(q)||(j.email||"").toLowerCase().includes(q);
    const mf=filter==="all"||j.stageId===filter;
    const mRole = perm.seeAll || auth.role==="designer" ? (perm.seeAll||j.designer===auth.name) : true;
    return mq&&mf&&mRole;
  });

  const visJobs = perm.seeAll ? jobs : jobs.filter(j=>j.designer===auth.name||auth.role==="factory");
  const totalRev = visJobs.filter(j=>["contract","factory","installation","aftersales"].includes(j.stageId)).reduce((s,j)=>s+(j.finalQuote||j.budget||0),0);
  const activeCount = visJobs.filter(j=>j.stageId!=="aftersales").length;
  const pendAppr = visJobs.filter(j=>j.approvals&&(j.approvals.customer_design===null||j.approvals.management_design===null)&&["cust_approval","mgmt_approval"].includes(j.stageId)).length;
  const factCount = visJobs.filter(j=>j.stageId==="factory").length;

  const NAV = [
    {v:"dashboard",ico:"◈",lbl:t.dashboard},
    {v:"jobs",ico:"⊕",lbl:t.jobs,badge:visJobs.filter(j=>j.stageId==="contact").length||null},
    {v:"pipeline",ico:"⋮⋮⋮",lbl:t.pipeline},
    ...(perm.canApprove?[{v:"approvals",ico:"✦",lbl:t.approvals,badge:pendAppr||null,red:true}]:[]),
    ...(perm.canFactory||auth.role==="factory"?[{v:"factory",ico:"🏭",lbl:t.factory,badge:factCount||null}]:[]),
    {v:"tasks",ico:"✓",lbl:t.tasksList},
    ...(perm.seeAll?[{v:"reports",ico:"▦",lbl:t.reports}]:[]),
    {v:"products",ico:"◻",lbl:t.products},
  ];

  const ROLE_COLOR = {admin:"rgba(201,168,76,.2)",designer:"rgba(90,174,224,.2)",sales:"rgba(77,184,122,.2)",factory:"rgba(224,92,160,.2)",mgmt:"rgba(155,108,224,.2)"};
  const ROLE_TEXT = {admin:t.roleAdmin,designer:t.roleDesigner,sales:t.roleSales,factory:t.roleFactory,mgmt:t.roleMgmt};

  return (
    <>
      <style>{CSS}</style>
      <div className="app" style={{direction:rtl?"rtl":"ltr"}}>
        {/* Sidebar */}
        <nav className={`sb${rtl?" rtl":""}`}>
          <div className="sb-logo">
            <div className="sb-logo-main">✦ {t.appName}</div>
            <div className="sb-logo-sub">{t.appSub}</div>
          </div>
          <div className="sb-user">
            <div className="av" style={{width:30,height:30,background:auth.color,fontSize:10,color:"#fff"}}>{auth.avatar}</div>
            <div>
              <div className="sb-user-name">{auth.name}</div>
              <div className="sb-user-role">{ROLE_TEXT[auth.role]}</div>
            </div>
          </div>
          <div className="sb-section">
            {NAV.map(n=>(
              <div key={n.v} className={`sb-item${(view===n.v||(view==="job"&&n.v==="jobs"))?" on":""}`} onClick={()=>d({type:"VIEW",v:n.v})}>
                <span className="ico">{n.ico}</span>{n.lbl}
                {n.badge?<span className={`sb-badge${n.red?" red":""}`}>{n.badge}</span>:null}
              </div>
            ))}
          </div>
          <div className="sb-bottom">
            <div className="sb-item" onClick={()=>d({type:"LANG"})}>
              <span className="ico">🌐</span>{t.lang}
            </div>
            <div className="sb-item" onClick={()=>setAuth(null)}>
              <span className="ico">→</span>{t.logout}
            </div>
          </div>
        </nav>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div className={`topbar-title${rtl?" rtl":""}`}>
              {{dashboard:t.dashboard,jobs:t.jobs,job:selJob?.name||"",pipeline:t.pipeline,approvals:t.approvals,factory:t.factory,tasks:t.tasks,reports:t.reports,products:t.products}[view]}
              <small>{{dashboard:"",jobs:"",job:stageLabel(selJob?.stageId,lang),pipeline:"",approvals:"",factory:"",tasks:"",reports:"",products:""}[view]}</small>
            </div>
            {view==="jobs"&&<>
              <input className={`search-in${rtl?" rtl":""}`} placeholder={t.search} value={search} onChange={e=>d({type:"SEARCH",v:e.target.value})} />
              <select className="filter-sel" value={filter} onChange={e=>d({type:"FILTER",v:e.target.value})}>
                <option value="all">{t.allStages}</option>
                {STAGES.map(s=><option key={s.id} value={s.id}>{rtl?s.ar:s.en}</option>)}
              </select>
            </>}
            {(view==="jobs"||view==="dashboard")&&perm.canEdit&&<button className="btn btn-gold" onClick={()=>d({type:"MODAL",modal:"add"})}>{t.newJob}</button>}
            {view==="job"&&selJob&&<>
              {perm.canEdit&&<button className="btn btn-ghost btn-sm" onClick={()=>d({type:"MODAL",modal:"edit",data:selJob})}>{t.editJob}</button>}
              <button className="btn btn-ghost btn-sm" onClick={()=>d({type:"MODAL",modal:"note",data:{id:selJob.id}})}>+ {rtl?"ملاحظة":"Note"}</button>
              <button className="btn btn-wa btn-sm" onClick={()=>d({type:"MODAL",modal:"wa",data:selJob})}>💬 {t.whatsapp}</button>
              <button className="btn btn-blue btn-sm" onClick={()=>d({type:"MODAL",modal:"quote",data:selJob})}>📄 {rtl?"عرض سعر":"Quote"}</button>
              {stageIdx(selJob.stageId)<STAGE_IDS.length-1&&perm.canEdit&&<button className="btn btn-gold btn-sm" onClick={()=>d({type:"ADV_STAGE",id:selJob.id,user:auth.name})}>{t.advanceStage}</button>}
            </>}
          </div>

          <div className="content">
            {view==="dashboard"&&<Dashboard jobs={visJobs} totalRev={totalRev} activeCount={activeCount} pendAppr={pendAppr} factCount={factCount} dispatch={d} t={t} lang={lang} auth={auth} />}
            {view==="jobs"&&<JobsTable jobs={filtered} dispatch={d} t={t} lang={lang} auth={auth} perm={perm} />}
            {view==="job"&&selJob&&<JobDetail job={selJob} dispatch={d} t={t} lang={lang} auth={auth} perm={perm} />}
            {view==="pipeline"&&<Pipeline jobs={visJobs} dispatch={d} t={t} lang={lang} />}
            {view==="approvals"&&<Approvals jobs={visJobs} dispatch={d} t={t} lang={lang} auth={auth} perm={perm} />}
            {view==="factory"&&<FactoryView jobs={visJobs} dispatch={d} t={t} lang={lang} auth={auth} perm={perm} />}
            {view==="tasks"&&<Tasks jobs={visJobs} dispatch={d} t={t} lang={lang} auth={auth} />}
            {view==="reports"&&<Reports jobs={visJobs} totalRev={totalRev} t={t} lang={lang} />}
            {view==="products"&&<Products t={t} lang={lang} />}
          </div>
        </div>

        {/* Modals */}
        {modal==="add"&&<JobModal lang={lang} t={t} rtl={rtl} onClose={()=>d({type:"CLM"})} onSave={j=>d({type:"ADD_JOB",job:j,user:auth.name})} />}
        {modal==="edit"&&mdata&&<JobModal lang={lang} t={t} rtl={rtl} job={mdata} onClose={()=>d({type:"CLM"})} onSave={j=>d({type:"UPD_JOB",job:j})} />}
        {modal==="note"&&mdata&&<NoteModal lang={lang} t={t} rtl={rtl} id={mdata.id} user={auth.name} onClose={()=>d({type:"CLM"})} onSave={(id,text)=>d({type:"ADD_LOG",id,text,user:auth.name})} />}
        {modal==="wa"&&mdata&&<WAModal lang={lang} t={t} rtl={rtl} job={mdata} onClose={()=>d({type:"CLM"})} />}
        {modal==="quote"&&mdata&&<QuoteModal lang={lang} t={t} rtl={rtl} job={mdata} onClose={()=>d({type:"CLM"})} />}

        {toast&&<div className={`toast${rtl?" rtl":""}`}>{toast}</div>}
      </div>
    </>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function LoginScreen({lang,t,rtl,onLogin,onLang}) {
  const [user,setUser]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState("");
  const tryLogin = () => {
    const u = USERS.find(x=>x.username===user&&x.password===pass);
    if(u) onLogin(u); else setErr(t.wrongCreds);
  };
  return (
    <>
      <style>{CSS}</style>
      <div className={`login-wrap${rtl?" rtl":""}`} style={{direction:rtl?"rtl":"ltr"}}>
        <div className="login-bg" />
        <div className="login-card">
          <div className="login-logo">✦ {t.appName}</div>
          <div className="login-sub">{t.appSub}</div>
          {err&&<div className="login-err">{err}</div>}
          <div className="field" style={{marginBottom:12}}>
            <label>{t.username}</label>
            <input value={user} onChange={e=>{setUser(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="admin" autoFocus />
          </div>
          <div className="field" style={{marginBottom:16}}>
            <label>{t.password}</label>
            <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="••••••••" />
          </div>
          <button className="btn btn-gold" style={{width:"100%",justifyContent:"center",padding:"10px"}} onClick={tryLogin}>{t.login}</button>
          <div style={{marginTop:12,display:"flex",justifyContent:"center"}}>
            <button className="btn btn-ghost btn-sm" onClick={onLang}>🌐 {t.lang}</button>
          </div>
          <div className="login-users">
            <div className="login-users-title">{rtl?"أدخل بصفة:":"Quick login:"}</div>
            <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center"}}>
              {USERS.map(u=>(
                <div key={u.id} className="login-user-chip" onClick={()=>onLogin(u)}>
                  <div className="av" style={{width:18,height:18,background:u.color,fontSize:7,color:"#fff"}}>{u.avatar}</div>
                  {u.name.split(" ")[0]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({jobs,totalRev,activeCount,pendAppr,factCount,dispatch,t,lang,auth}) {
  const d=dispatch; const rtl=lang==="ar";
  const recent=[...jobs].sort((a,b)=>new Date(b.lastActivity)-new Date(a.lastActivity)).slice(0,6);
  const byStage=STAGES.map(s=>({...s,cnt:jobs.filter(j=>j.stageId===s.id).length,val:jobs.filter(j=>j.stageId===s.id).reduce((x,j)=>x+(j.budget||0),0)}));
  return (<>
    <div className="stats-row">
      {[
        {l:t.activeJobs,v:activeCount,s:"",ico:"📋",c:"var(--blue)"},
        {l:t.totalRevenue,v:fmt(totalRev),s:"",ico:"💰",c:"var(--gold)"},
        {l:t.pendingApprovals,v:pendAppr,s:"",ico:"⏳",c:"var(--red)"},
        {l:t.inFactory,v:factCount,s:"",ico:"🏭",c:"var(--pink)"},
        {l:t.completed,v:jobs.filter(j=>j.stageId==="aftersales").length,s:"",ico:"⭐",c:"var(--green)"},
      ].map(s=>(
        <div key={s.l} className="stat" style={{"--c":s.c}}>
          <div className="stat-ico">{s.ico}</div>
          <div className="stat-lbl">{s.l}</div>
          <div className="stat-val">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="two-col">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Stage summary */}
        <div className="card">
          <div className="card-title">{t.jobsByStage}</div>
          <div style={{overflowX:"auto"}}>
            <div style={{display:"flex",gap:7,minWidth:700}}>
              {byStage.map(s=>(
                <div key={s.id} style={{flex:1,background:"var(--sf2)",border:"1px solid var(--b)",borderTop:`2px solid ${s.color}`,borderRadius:8,padding:"9px 6px",textAlign:"center",cursor:"pointer",minWidth:0}} onClick={()=>dispatch({type:"VIEW",v:"pipeline"})}>
                  <div style={{fontSize:15}}>{s.icon}</div>
                  <div style={{fontSize:rtl?10:9,fontWeight:700,color:s.color,textTransform:"uppercase",letterSpacing:rtl?0:".05em",margin:"2px 0",fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{rtl?s.ar:s.en}</div>
                  <div style={{fontSize:20,fontFamily:"var(--fd)",color:"var(--cr)"}}>{s.cnt}</div>
                  <div style={{fontSize:10,color:"var(--cr3)"}}>{s.cnt>0?fmt(s.val):"—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Recent */}
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"13px 16px",borderBottom:"1px solid var(--b)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div className="card-title" style={{margin:0}}>{t.recentActivity}</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"VIEW",v:"jobs"})}>{t.viewAll}</button>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>{t.name}</th><th>{t.stage}</th><th>{t.progress}</th><th>{t.budget}</th></tr></thead>
              <tbody>
                {recent.map(j=>{
                  const pct=completionPct(j.completedTasks);
                  return (<tr key={j.id} className="clk" onClick={()=>dispatch({type:"SEL",id:j.id})}>
                    <td><div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="av" style={{width:28,height:28,background:AV_COLORS[j.id%6<6?j.id%6:0],fontSize:9,color:"#fff"}}>{initials(j.name)}</div>
                      <div><div className="td-name">{j.name}</div><div className="td-sub">{j.source}</div></div>
                    </div></td>
                    <td><span className={`badge ${STAGE_BADGE[j.stageId]}`}>{stageObj(j.stageId)?.icon} {stageLabel(j.stageId,lang)}</span></td>
                    <td style={{minWidth:90}}><div style={{fontSize:10,color:"var(--cr3)",marginBottom:2}}>{pct}%</div><div className="prog"><div className="prog-fill" style={{width:pct+"%",background:"var(--gold)"}}/></div></td>
                    <td style={{color:"var(--gold)",fontWeight:500}}>{fmt(j.budget)}</td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Right */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {pendAppr>0&&(<div className="card" style={{borderColor:"rgba(224,144,58,.3)"}}>
          <div className="card-title" style={{color:"var(--orange)"}}>⏳ {t.awaitingApproval}</div>
          {jobs.filter(j=>j.approvals?.customer_design===null&&j.stageId==="cust_approval").map(j=>(
            <div key={j.id} style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>dispatch({type:"SEL",id:j.id})}>
              <div className="av" style={{width:24,height:24,background:AV_COLORS[j.id%6<6?j.id%6:0],fontSize:8,color:"#fff"}}>{initials(j.name)}</div>
              <div style={{flex:1}}><div style={{fontSize:12.5,color:"var(--cr)"}}>{j.name}</div></div>
              <span className="badge b-orange" style={{fontSize:10}}>{t.pending}</span>
            </div>
          ))}
        </div>)}
        <div className="card">
          <div className="card-title">{t.pipelineHealth}</div>
          {STAGES.slice(0,6).map(s=>{
            const cnt=jobs.filter(j=>j.stageId===s.id).length;
            const max=Math.max(...STAGES.map(st=>jobs.filter(j=>j.stageId===st.id).length),1);
            return (<div key={s.id} style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}>
                <span style={{color:"var(--cr3)",fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{s.icon} {rtl?s.ar:s.en}</span>
                <span style={{color:"var(--cr)"}}>{cnt}</span>
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
function JobsTable({jobs,dispatch,t,lang,auth,perm}) {
  const rtl=lang==="ar";
  return (
    <div className="card" style={{padding:0,overflow:"hidden"}}>
      <div className="tbl-wrap">
        <table>
          <thead><tr>
            <th>{t.name}</th><th>{t.stage}</th><th>{t.designer}</th>
            <th>{t.style}</th><th>{t.budget}</th><th>{t.progress}</th><th>{t.lastActivity}</th>
            {perm.canEdit&&<th></th>}
          </tr></thead>
          <tbody>
            {jobs.length===0&&<tr><td colSpan={8}><div className="empty"><div className="ei">🔍</div>{t.noJobs}</div></td></tr>}
            {jobs.map(j=>{
              const pct=completionPct(j.completedTasks);
              return (<tr key={j.id} className="clk" onClick={()=>dispatch({type:"SEL",id:j.id})}>
                <td><div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div className="av" style={{width:28,height:28,background:AV_COLORS[j.id%6<6?j.id%6:0],fontSize:9,color:"#fff"}}>{initials(j.name)}</div>
                  <div><div className="td-name">{j.name}</div><div className="td-sub">{j.phone}</div></div>
                </div></td>
                <td><span className={`badge ${STAGE_BADGE[j.stageId]}`}>{stageObj(j.stageId)?.icon} {stageLabel(j.stageId,lang)}</span></td>
                <td style={{fontSize:12,color:"var(--cr2)"}}>{j.designer}</td>
                <td style={{fontSize:12}}>{j.style}</td>
                <td style={{color:"var(--gold)",fontWeight:500}}>{fmt(j.budget)}</td>
                <td style={{minWidth:80}}><div style={{fontSize:10,color:"var(--cr3)",marginBottom:2}}>{pct}%</div><div className="prog"><div className="prog-fill" style={{width:pct+"%",background:"var(--gold)"}}/></div></td>
                <td style={{fontSize:11,color:"var(--cr3)"}}>{fmtD(j.lastActivity,lang)}</td>
                {perm.canEdit&&<td onClick={e=>e.stopPropagation()}>
                  <select className="btn btn-ghost btn-xs" style={{padding:"3px 6px"}} value={j.stageId}
                    onChange={e=>dispatch({type:"SET_STAGE",id:j.id,stage:e.target.value,user:auth.name})}>
                    {STAGES.map(s=><option key={s.id} value={s.id}>{rtl?s.ar:s.en}</option>)}
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
function JobDetail({job,dispatch,t,lang,auth,perm}) {
  const d=dispatch; const rtl=lang==="ar";
  const sg=stageObj(job.stageId); const sidx=stageIdx(job.stageId);
  const [activeStage,setAS]=useState(job.stageId);
  useEffect(()=>setAS(job.stageId),[job.stageId]);
  const asg=stageObj(activeStage);
  const tasks=rtl?asg?.tasksAr:asg?.tasksEn;

  return (
    <div>
      {/* Stage track */}
      <div className="stage-track" style={{marginBottom:14}}>
        {STAGES.map((s,i)=>{
          const done=i<sidx; const active=s.id===job.stageId; const viewing=s.id===activeStage;
          return (<div key={s.id} className="stage-step" style={{background:done?"rgba(77,184,122,.1)":active?`${s.color}20`:"var(--sf2)",color:done?"var(--green)":active?s.color:"var(--cr3)",borderTopColor:viewing?"var(--gold)":done?"var(--green)":active?s.color:"var(--b)",borderTop:`${viewing?"2":done||active?"1":"0"}px solid`}} onClick={()=>setAS(s.id)}>
            <span className="stage-step-icon">{done?"✓":s.icon}</span>
            <span className="stage-step-short" style={{fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{rtl?s.ar.split(" ")[0]:s.en.split(" ")[0]}</span>
          </div>);
        })}
      </div>

      <div className="job-layout">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Stage panel */}
          <div className="stage-panel">
            <div className="stage-panel-head" style={{borderLeft:rtl?"none":`3px solid ${asg?.color}`,borderRight:rtl?`3px solid ${asg?.color}`:"none"}}>
              <span style={{fontSize:20}}>{asg?.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--cr)",fontFamily:rtl?"var(--fa)":"var(--fd)"}}>{rtl?asg?.ar:asg?.en}</div>
                <div style={{fontSize:11.5,color:"var(--cr3)",fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{rtl?"المرحلة الحالية للمشروع":"Current project stage"}</div>
              </div>
              {activeStage===job.stageId&&<span className="badge b-gold" style={{fontSize:10}}>{rtl?"الحالي":"Current"}</span>}
            </div>
            <div className="stage-panel-body">
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:rtl?0:".09em",color:"var(--cr3)",marginBottom:7,fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{t.checklist}</div>
              <div className="checklist">
                {tasks?.map((task,i)=>{
                  const done=i<(job.completedTasks[activeStage]||0);
                  return (<div key={i} className={`check-item${done?" done":""}`} onClick={()=>perm.canEdit&&d({type:"TOGGLE_TASK",id:job.id,stage:activeStage,idx:i})}>
                    <div className="check-box">{done?"✓":""}</div>
                    <span className="check-lbl">{task}</span>
                  </div>);
                })}
              </div>
              {/* Stage-specific fields */}
              {activeStage==="measurement"&&<StageFields type="measurement" job={job} d={d} t={t} lang={lang} auth={auth} perm={perm} />}
              {activeStage==="design"&&<StageFields type="design" job={job} d={d} t={t} lang={lang} auth={auth} perm={perm} />}
              {(activeStage==="cust_approval"||activeStage==="mgmt_approval")&&<ApprovalStage stage={activeStage} job={job} d={d} t={t} lang={lang} auth={auth} perm={perm} />}
              {activeStage==="budget"&&<StageFields type="budget" job={job} d={d} t={t} lang={lang} auth={auth} perm={perm} />}
              {activeStage==="contract"&&<StageFields type="contract" job={job} d={d} t={t} lang={lang} auth={auth} perm={perm} />}
              {activeStage==="factory"&&<StageFields type="factory" job={job} d={d} t={t} lang={lang} auth={auth} perm={perm} />}
              {activeStage==="installation"&&<StageFields type="installation" job={job} d={d} t={t} lang={lang} auth={auth} perm={perm} />}
              {activeStage==="aftersales"&&<StageFields type="aftersales" job={job} d={d} t={t} lang={lang} auth={auth} perm={perm} />}
              {/* Advance */}
              {activeStage===job.stageId&&sidx<STAGE_IDS.length-1&&perm.canEdit&&(
                <button className="btn btn-gold" style={{marginTop:12,width:"100%",justifyContent:"center"}} onClick={()=>d({type:"ADV_STAGE",id:job.id,user:auth.name})}>{t.advanceStage}</button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            <a href={`tel:${job.phone}`} className="btn btn-ghost btn-sm">📞 {t.call}</a>
            <button className="btn btn-wa btn-sm" onClick={()=>d({type:"MODAL",modal:"wa",data:job})}>💬 {t.whatsapp}</button>
            <button className="btn btn-blue btn-sm" onClick={()=>d({type:"MODAL",modal:"quote",data:job})}>📄 {t.generateQuote}</button>
            {perm.canDelete&&<button className="btn btn-red btn-sm" style={{marginLeft:"auto"}} onClick={()=>{if(window.confirm(rtl?"هل تريد حذف هذا المشروع؟":"Delete this job?"))d({type:"DEL_JOB",id:job.id})}}>{t.deleteJob}</button>}
          </div>

          {/* Activity log */}
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
              <div className="card-title" style={{margin:0}}>{t.activityLog}</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>d({type:"MODAL",modal:"note",data:{id:job.id}})}>+ {rtl?"ملاحظة":"Note"}</button>
            </div>
            <div className="act-log">
              {(job.activityLog||[]).length===0&&<div className="empty"><div className="ei">📋</div>{t.noActivity}</div>}
              {(job.activityLog||[]).map(a=>(
                <div key={a.id} className="act-item">
                  <div className="act-dot"/>
                  <div><div className="act-text" style={{fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{a.text}</div>
                    <div style={{display:"flex",gap:8}}><div className="act-user">{a.user}</div><div className="act-date">{fmtD(a.date,lang)}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer side panel */}
        <div className="cust-side">
          <div className="info-blk">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div className="av" style={{width:42,height:42,background:AV_COLORS[job.id%6<6?job.id%6:0],fontSize:13,color:"#fff"}}>{initials(job.name)}</div>
              <div><div style={{fontFamily:rtl?"var(--fa)":"var(--fd)",fontSize:16,color:"var(--cr)"}}>{job.name}</div>
                <span className={`badge ${STAGE_BADGE[job.stageId]}`}>{sg?.icon} {stageLabel(job.stageId,lang)}</span>
              </div>
            </div>
            <div className="info-ttl">{t.contactInfo}</div>
            {[{k:t.phone,v:job.phone},{k:t.email,v:job.email||"—"},{k:t.address,v:job.address||"—"}].map(r=>(<div key={r.k} className="info-row"><span className="info-key">{r.k}</span><span className="info-val">{r.v}</span></div>))}
          </div>
          <div className="info-blk">
            <div className="info-ttl">{t.projectInfo}</div>
            {[
              {k:t.style,v:job.style},{k:t.source,v:job.source},{k:t.designer,v:job.designer},
              {k:t.priority,v:job.priority},{k:t.budget,v:<span className="gold-val">{fmt(job.budget)}</span>},
              ...(job.finalQuote?[{k:rtl?"العرض النهائي":t.finalQuote,v:<span className="gold-val">{fmt(job.finalQuote)}</span>}]:[]),
              ...(job.deposit?[{k:t.depositAmount,v:<span style={{color:"var(--green)"}}>{fmt(job.deposit)}</span>}]:[]),
            ].map((r,i)=>(<div key={i} className="info-row"><span className="info-key">{r.k}</span><span className="info-val">{r.v}</span></div>))}
          </div>
          {(job.quoteNo||job.contractNo||job.factoryOrderNo)&&(<div className="info-blk">
            <div className="info-ttl">{t.references}</div>
            {job.quoteNo&&<div className="info-row"><span className="info-key">{t.quoteNo}</span><span className="info-val" style={{color:"var(--gold)"}}>{job.quoteNo}</span></div>}
            {job.contractNo&&<div className="info-row"><span className="info-key">{t.contractNo}</span><span className="info-val" style={{color:"var(--green)"}}>{job.contractNo}</span></div>}
            {job.factoryOrderNo&&<div className="info-row"><span className="info-key">{t.factoryOrder}</span><span className="info-val" style={{color:"var(--pink)"}}>{job.factoryOrderNo}</span></div>}
          </div>)}
          <div className="info-blk">
            <div className="info-ttl">{t.approvalsTitle}</div>
            {[
              {key:"customer_design",l:t.custDesign},{key:"management_design",l:t.mgmtDesign},
              {key:"customer_budget",l:t.custBudget},{key:"management_budget",l:t.mgmtBudget},
            ].map(a=>{
              const v=job.approvals?.[a.key];
              return (<div key={a.key} className="info-row">
                <span className="info-key" style={{fontSize:11}}>{a.l}</span>
                <span className={`badge ${v==="approved"?"b-green":v==="revision"?"b-red":"b-grey"}`} style={{fontSize:10}}>{v==="approved"?`✓ ${t.approved}`:v==="revision"?`⟳ ${rtl?"تعديل":"Revision"}`:t.pending}</span>
              </div>);
            })}
            <div className="info-row"><span className="info-key" style={{fontSize:11}}>{t.contractSigned}</span><span className={`badge ${job.approvals?.contract_signed?"b-green":"b-grey"}`} style={{fontSize:10}}>{job.approvals?.contract_signed?`✓ ${rtl?"موقّع":"Signed"}`:t.pending}</span></div>
            <div className="info-row"><span className="info-key" style={{fontSize:11}}>{t.depositReceived}</span><span className={`badge ${job.approvals?.deposit_received?"b-green":"b-grey"}`} style={{fontSize:10}}>{job.approvals?.deposit_received?`✓ ${rtl?"مستلم":"Received"}`:t.pending}</span></div>
          </div>
          {job.notes&&(<div className="info-blk"><div className="info-ttl">{t.notes}</div><div style={{fontSize:12.5,color:"var(--cr3)",lineHeight:1.6,fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{job.notes}</div></div>)}
        </div>
      </div>
    </div>
  );
}

// ── STAGE FIELDS ──────────────────────────────────────────────────────────
function IF({label,value,field,id,d,type="text",placeholder,options,auth}) {
  const [v,sv]=useState(value||"");
  return (<div style={{marginBottom:9}}>
    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".08em",color:"var(--cr3)",marginBottom:4}}>{label}</div>
    <div className="inline-field">
      {options ? <select value={v} onChange={e=>sv(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select>
        : <input type={type} value={v} onChange={e=>sv(e.target.value)} placeholder={placeholder}/>}
      <button className="btn btn-ghost btn-sm" onClick={()=>d({type:"UPD_FIELD",id,field,val:type==="number"?Number(v):v,user:auth?.name})}>✓</button>
    </div>
    {value&&type!=="date"&&<div style={{fontSize:11,color:"var(--cr3)",marginTop:3}}>{value}</div>}
  </div>);
}

function StageFields({type,job,d,t,lang,auth,perm}) {
  const rtl=lang==="ar";
  const FS=["Order Sent","Confirmed","In Production","QC Check","Ready for Delivery","Delivered"];
  const FS_AR=["تم إرسال الطلب","تم التأكيد","قيد الإنتاج","فحص الجودة","جاهز للتسليم","تم التسليم"];
  if(!perm.canEdit&&type!=="factory") return null;
  return (<div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--b)"}}>
    {type==="measurement"&&<><IF label={t.measureDate} value={job.measureDate} field="measureDate" id={job.id} d={d} type="date" auth={auth}/><IF label={t.roomDimensions} value={job.measureNotes} field="measureNotes" id={job.id} d={d} placeholder="4.2m x 3.8m…" auth={auth}/></>}
    {type==="design"&&<IF label={t.designFile} value={job.designFile} field="designFile" id={job.id} d={d} placeholder="KIT-2026-XXX.pdf" auth={auth}/>}
    {type==="budget"&&<>
      <IF label={t.quoteNo} value={job.quoteNo} field="quoteNo" id={job.id} d={d} placeholder="Q-2026-XXX" auth={auth}/>
      <IF label={t.finalQuote} value={job.finalQuote} field="finalQuote" id={job.id} d={d} type="number" placeholder="15000" auth={auth}/>
      <div style={{marginTop:8}}>
        <div style={{fontSize:10,textTransform:"uppercase",color:"var(--cr3)",marginBottom:6}}>{rtl?"موافقة العميل على الميزانية":"Customer Budget Approval"}</div>
        <div className={`appr-card${job.approvals?.customer_budget==="approved"?" approved":job.approvals?.customer_budget==="revision"?" revision":""}`}>
          <div className="appr-status" style={{color:job.approvals?.customer_budget==="approved"?"var(--green)":job.approvals?.customer_budget==="revision"?"var(--red)":"var(--cr3)",fontSize:12.5,marginBottom:6}}>
            {job.approvals?.customer_budget==="approved"?`✓ ${t.approved}`:job.approvals?.customer_budget==="revision"?`⟳ ${t.revision}`:t.pending}
          </div>
          <div className="appr-btns">
            <button className="btn btn-green btn-xs" onClick={()=>d({type:"SET_APPR",id:job.id,key:"customer_budget",val:"approved",user:auth.name})}>{t.approve}</button>
            <button className="btn btn-red btn-xs" onClick={()=>d({type:"SET_APPR",id:job.id,key:"customer_budget",val:"revision",user:auth.name})}>{t.requestRevision}</button>
          </div>
        </div>
      </div>
    </>}
    {type==="contract"&&<>
      <IF label={t.contractNo} value={job.contractNo} field="contractNo" id={job.id} d={d} placeholder="C-2026-XXX" auth={auth}/>
      <IF label={t.depositAmount} value={job.deposit} field="deposit" id={job.id} d={d} type="number" auth={auth}/>
      <div style={{display:"flex",gap:7,marginTop:6,flexWrap:"wrap"}}>
        <button className={`btn btn-sm ${job.approvals?.contract_signed?"btn-green":"btn-ghost"}`} onClick={()=>d({type:"SET_APPR",id:job.id,key:"contract_signed",val:!job.approvals?.contract_signed,user:auth.name})}>{job.approvals?.contract_signed?`✓ ${t.contractSigned}`:t.contractSigned}</button>
        <button className={`btn btn-sm ${job.approvals?.deposit_received?"btn-green":"btn-ghost"}`} onClick={()=>d({type:"SET_APPR",id:job.id,key:"deposit_received",val:!job.approvals?.deposit_received,user:auth.name})}>{job.approvals?.deposit_received?`✓ ${t.depositReceived}`:t.depositReceived}</button>
      </div>
    </>}
    {type==="factory"&&(perm.canFactory||perm.canEdit)&&<>
      <IF label={t.factoryOrder} value={job.factoryOrderNo} field="factoryOrderNo" id={job.id} d={d} placeholder="FAC-2026-XXX" auth={auth}/>
      <IF label={t.productionStatus} value={job.factoryStatus||"Order Sent"} field="factoryStatus" id={job.id} d={d} options={rtl?FS_AR:FS} auth={auth}/>
      {job.factoryStatus&&<span className={`badge ${job.factoryStatus==="Delivered"||job.factoryStatus==="تم التسليم"?"b-green":job.factoryStatus?.includes("Production")||job.factoryStatus?.includes("إنتاج")?"b-pink":"b-gold"}`} style={{marginTop:4}}>{job.factoryStatus}</span>}
    </>}
    {type==="installation"&&<IF label={t.installDate} value={job.installDate} field="installDate" id={job.id} d={d} type="date" auth={auth}/>}
    {type==="aftersales"&&<IF label={t.warrantyMonths} value={job.warrantyMonths||24} field="warrantyMonths" id={job.id} d={d} options={["12","18","24","36","48","60"]} auth={auth}/>}
  </div>);
}

function ApprovalStage({stage,job,d,t,lang,auth,perm}) {
  const rtl=lang==="ar";
  const isCustomer=stage==="cust_approval";
  const key=isCustomer?"customer_design":"management_design";
  const val=job.approvals?.[key];
  const canAppr = isCustomer ? (perm.canEdit||perm.canApprove) : perm.canApprove;
  return (<div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--b)"}}>
    <div className={`appr-card${val==="approved"?" approved":val==="revision"?" revision":""}`}>
      <div className="appr-lbl">{isCustomer?t.custDesign:t.mgmtDesign}</div>
      <div className="appr-status" style={{color:val==="approved"?"var(--green)":val==="revision"?"var(--red)":"var(--cr3)",marginBottom:6}}>
        {val==="approved"?`✓ ${t.approved}`:val==="revision"?`⟳ ${t.revision}`:t.pending}
      </div>
      {canAppr&&<div className="appr-btns">
        <button className="btn btn-green btn-xs" onClick={()=>d({type:"SET_APPR",id:job.id,key,val:"approved",user:auth.name})}>{t.approve}</button>
        <button className="btn btn-red btn-xs" onClick={()=>d({type:"SET_APPR",id:job.id,key,val:"revision",user:auth.name})}>{t.requestRevision}</button>
      </div>}
      {!canAppr&&<div style={{fontSize:11.5,color:"var(--cr3)",marginTop:4}}>{rtl?"لا تملك صلاحية الموافقة":"You don't have approval permission"}</div>}
    </div>
  </div>);
}

// ── PIPELINE ──────────────────────────────────────────────────────────────
function Pipeline({jobs,dispatch,t,lang}) {
  const rtl=lang==="ar";
  return (<div className="kanban-wrap">
    <div className="kanban" style={{gridTemplateColumns:`repeat(${STAGES.length},minmax(155px,1fr))`}}>
      {STAGES.map(s=>{
        const sj=jobs.filter(j=>j.stageId===s.id);
        const val=sj.reduce((x,j)=>x+(j.budget||0),0);
        return (<div key={s.id} className="kanban-col">
          <div className="kanban-head" style={{borderTop:`2px solid ${s.color}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div className="kanban-title" style={{color:s.color,fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{s.icon} {rtl?s.ar:s.en}</div>
              <span className="kanban-cnt">{sj.length}</span>
            </div>
            <div className="kanban-meta">{sj.length>0?fmt(val):"—"}</div>
          </div>
          <div className="kanban-cards">
            {sj.map(j=>(<div key={j.id} className="k-card" onClick={()=>dispatch({type:"SEL",id:j.id})}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                <div className="av" style={{width:18,height:18,background:AV_COLORS[j.id%6<6?j.id%6:0],fontSize:7,color:"#fff"}}>{initials(j.name)}</div>
                <div className="k-name">{j.name}</div>
              </div>
              <div className="k-val">{fmt(j.budget)}</div>
              <div className="k-meta">{j.style}</div>
              <div className="prog" style={{marginTop:5}}><div className="prog-fill" style={{width:completionPct(j.completedTasks)+"%",background:s.color}}/></div>
            </div>))}
            {sj.length===0&&<div style={{fontSize:11,color:"var(--cr3)",textAlign:"center",padding:"10px 0",fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{rtl?"—":"—"}</div>}
          </div>
        </div>);
      })}
    </div>
  </div>);
}

// ── APPROVALS ─────────────────────────────────────────────────────────────
function Approvals({jobs,dispatch,t,lang,auth,perm}) {
  const d=dispatch; const rtl=lang==="ar";
  const pending=jobs.filter(j=>j.approvals&&(j.approvals.customer_design===null||j.approvals.management_design===null||j.approvals.customer_budget===null));
  if(!pending.length) return <div className="empty" style={{marginTop:40}}><div className="ei">✅</div>{t.noApprovals}</div>;
  return (<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {pending.map(j=>(
      <div key={j.id} className="card">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div className="av" style={{width:34,height:34,background:AV_COLORS[j.id%6<6?j.id%6:0],fontSize:11,color:"#fff"}}>{initials(j.name)}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:rtl?"var(--fa)":"var(--fd)",fontSize:15,color:"var(--cr)"}}>{j.name}</div>
            <span className={`badge ${STAGE_BADGE[j.stageId]}`}>{stageObj(j.stageId)?.icon} {stageLabel(j.stageId,lang)}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>d({type:"SEL",id:j.id})}>{rtl?"فتح ←":"Open →"}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {[
            {key:"customer_design",l:t.custDesign},{key:"management_design",l:t.mgmtDesign},
            {key:"customer_budget",l:t.custBudget},{key:"management_budget",l:t.mgmtBudget},
          ].map(a=>{
            const val=j.approvals?.[a.key];
            const canAppr = a.key.includes("management") ? perm.canApprove : (perm.canEdit||perm.canApprove);
            return (<div key={a.key} className={`appr-card${val==="approved"?" approved":val==="revision"?" revision":""}`}>
              <div className="appr-lbl">{a.l}</div>
              <div className="appr-status" style={{fontSize:12,color:val==="approved"?"var(--green)":val==="revision"?"var(--red)":"var(--cr3)"}}>
                {val==="approved"?`✓ ${t.approved}`:val==="revision"?`⟳`:t.pending}
              </div>
              {canAppr&&<div className="appr-btns">
                <button className="btn btn-green btn-xs" onClick={()=>d({type:"SET_APPR",id:j.id,key:a.key,val:"approved",user:auth.name})}>✓</button>
                <button className="btn btn-red btn-xs" onClick={()=>d({type:"SET_APPR",id:j.id,key:a.key,val:"revision",user:auth.name})}>⟳</button>
              </div>}
            </div>);
          })}
        </div>
      </div>
    ))}
  </div>);
}

// ── FACTORY ───────────────────────────────────────────────────────────────
function FactoryView({jobs,dispatch,t,lang,auth,perm}) {
  const rtl=lang==="ar";
  const fJobs=jobs.filter(j=>j.stageId==="factory"||j.factoryOrderNo);
  const SC={"Order Sent":"var(--blue)","Confirmed":"var(--gold)","In Production":"var(--pink)","QC Check":"var(--orange)","Ready for Delivery":"var(--purple)","Delivered":"var(--green)"};
  return (<div className="card" style={{padding:0,overflow:"hidden"}}>
    <div style={{padding:"13px 16px",borderBottom:"1px solid var(--b)"}}><div className="card-title" style={{margin:0}}>{t.factory}</div></div>
    <div className="tbl-wrap">
      <table>
        <thead><tr><th>{t.name}</th><th>{t.factoryOrder}</th><th>{t.productionStatus}</th><th>{t.finalQuote}</th><th>{t.installDate}</th><th>{t.designer}</th></tr></thead>
        <tbody>
          {fJobs.length===0&&<tr><td colSpan={6}><div className="empty"><div className="ei">🏭</div>{t.noFactory}</div></td></tr>}
          {fJobs.map(j=>(
            <tr key={j.id} className="clk" onClick={()=>dispatch({type:"SEL",id:j.id})}>
              <td><div className="td-name">{j.name}</div><div className="td-sub">{j.style}</div></td>
              <td style={{color:"var(--pink)",fontWeight:500}}>{j.factoryOrderNo||"—"}</td>
              <td>{j.factoryStatus?<span className="badge" style={{background:`${SC[j.factoryStatus]||"var(--cr3)"}22`,color:SC[j.factoryStatus]||"var(--cr3)"}}>{j.factoryStatus}</span>:<span className="badge b-grey">—</span>}</td>
              <td style={{color:"var(--gold)"}}>{fmt(j.finalQuote||j.budget)}</td>
              <td style={{fontSize:11,color:"var(--cr3)"}}>{fmtD(j.installDate,lang)}</td>
              <td style={{fontSize:12,color:"var(--cr2)"}}>{j.designer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>);
}

// ── TASKS ─────────────────────────────────────────────────────────────────
function Tasks({jobs,dispatch,t,lang,auth}) {
  const rtl=lang==="ar";
  const active=jobs.filter(j=>j.stageId!=="aftersales");
  return (<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {STAGES.filter(s=>s.id!=="aftersales").map(s=>{
      const sj=active.filter(j=>j.stageId===s.id);
      if(!sj.length) return null;
      return (<div key={s.id} className="card">
        <div className="card-title" style={{color:s.color,fontFamily:rtl?"var(--fa)":"var(--fd)"}}>{s.icon} {rtl?s.ar:s.en} <span style={{fontSize:12,color:"var(--cr3)",fontFamily:rtl?"var(--fa)":"var(--fb)",fontWeight:400}}>({sj.length})</span></div>
        {sj.map(j=>(
          <div key={j.id} style={{background:"var(--sf2)",border:"1px solid var(--b)",borderRadius:8,padding:"9px 11px",marginBottom:7,cursor:"pointer"}} onClick={()=>dispatch({type:"SEL",id:j.id})}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div className="av" style={{width:24,height:24,background:AV_COLORS[j.id%6<6?j.id%6:0],fontSize:8,color:"#fff"}}>{initials(j.name)}</div>
              <span style={{fontWeight:500,color:"var(--cr)",fontSize:13}}>{j.name}</span>
              <span style={{fontSize:11,color:"var(--cr3)",marginLeft:4}}>{j.designer}</span>
              <span style={{marginLeft:"auto",color:"var(--gold)",fontSize:12}}>{fmt(j.budget)}</span>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {(rtl?s.tasksAr:s.tasksEn).map((task,i)=>{
                const done=i<(j.completedTasks[s.id]||0);
                return <span key={i} className={`badge ${done?"b-green":"b-grey"}`} style={{fontSize:10,fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{done?"✓ ":""}{task}</span>;
              })}
            </div>
            <div className="prog" style={{marginTop:7}}><div className="prog-fill" style={{width:`${((j.completedTasks[s.id]||0)/(rtl?s.tasksAr:s.tasksEn).length)*100}%`,background:s.color}}/></div>
          </div>
        ))}
      </div>);
    })}
  </div>);
}

// ── REPORTS ───────────────────────────────────────────────────────────────
function Reports({jobs,totalRev,t,lang}) {
  const rtl=lang==="ar";
  const contracted=jobs.filter(j=>["contract","factory","installation","aftersales"].includes(j.stageId));
  const sources=SOURCES.map((s,i)=>({s:rtl?SOURCES_AR[i]:s,c:jobs.filter(j=>j.source===s).length})).filter(x=>x.c>0).sort((a,b)=>b.c-a.c);
  const maxSrc=Math.max(...sources.map(x=>x.c),1);
  const byDes=DESIGNERS.map(d=>({d,leads:jobs.filter(j=>j.designer===d).length,rev:jobs.filter(j=>j.designer===d&&["contract","factory","installation","aftersales"].includes(j.stageId)).reduce((x,j)=>x+(j.finalQuote||j.budget||0),0)}));
  const byStyle=STYLES.map((s,i)=>({s:rtl?STYLES_AR[i]:s,c:jobs.filter(j=>j.style===s).length})).filter(x=>x.c>0).sort((a,b)=>b.c-a.c);
  return (<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
    <div className="card">
      <div className="card-title">{rtl?"ملخص الإيرادات":"Revenue Summary"}</div>
      {[
        {l:rtl?"إجمالي العقود":t.totalRevenue,v:fmt(totalRev),c:"var(--gold)"},
        {l:rtl?"قيمة خط المبيعات":"Pipeline Value",v:fmt(jobs.reduce((s,j)=>s+(j.budget||0),0)),c:"var(--blue)"},
        {l:rtl?"متوسط حجم الصفقة":"Avg Deal Size",v:fmt(Math.round(totalRev/(contracted.length||1))),c:"var(--cr)"},
        {l:rtl?"عقود موقّعة":"Contracts Signed",v:contracted.length,c:"var(--green)"},
        {l:rtl?"إجمالي المشاريع":t.activeJobs,v:jobs.length,c:"var(--cr)"},
        {l:rtl?"في المصنع":t.inFactory,v:jobs.filter(j=>j.stageId==="factory").length,c:"var(--pink)"},
        {l:rtl?"مكتمل":t.completed,v:jobs.filter(j=>j.stageId==="aftersales").length,c:"var(--green)"},
      ].map(r=>(<div key={r.l} className="info-row"><span className="info-key">{r.l}</span><span style={{color:r.c,fontWeight:600}}>{r.v}</span></div>))}
    </div>
    <div className="card">
      <div className="card-title">{rtl?"مصادر العملاء":t.bySource}</div>
      {sources.map(x=>(<div key={x.s} style={{marginBottom:9}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"var(--cr3)",fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{x.s}</span><span>{x.c}</span></div>
        <div className="prog" style={{height:5}}><div className="prog-fill" style={{width:`${(x.c/maxSrc)*100}%`}}/></div>
      </div>))}
    </div>
    <div className="card">
      <div className="card-title">{rtl?"أداء المصممين":t.byDesigner}</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
        <thead><tr>{[rtl?"المصمم":"Designer",rtl?"مشاريع":"Jobs",rtl?"الإيرادات":"Revenue"].map(h=><th key={h} style={{padding:"5px 0",fontSize:10,textAlign:h==="Revenue"||h==="الإيرادات"?"right":"left",color:"var(--gd)",fontWeight:500}}>{h}</th>)}</tr></thead>
        <tbody>{byDes.map(x=>(<tr key={x.d}><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--cr)"}}>{x.d.split(" ").slice(0,2).join(" ")}</td><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--cr3)"}}>{x.leads}</td><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--gold)",fontWeight:600,textAlign:"right"}}>{fmt(x.rev)}</td></tr>))}</tbody>
      </table>
    </div>
    <div className="card">
      <div className="card-title">{rtl?"الأنماط الأكثر طلباً":t.byStyle}</div>
      {byStyle.map((x,i)=>(<div key={x.s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(42,38,30,.4)"}}>
        <div style={{width:20,height:20,background:`rgba(201,168,76,${.15+i*.04})`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"var(--gold)",fontWeight:700}}>{i+1}</div>
        <div style={{flex:1,fontSize:12.5,color:"var(--cr)",fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{x.s}</div>
        <div style={{fontSize:12,color:"var(--cr3)"}}>{x.c}</div>
        <div className="prog" style={{width:70,height:4}}><div className="prog-fill" style={{width:`${(x.c/jobs.length)*100}%`}}/></div>
      </div>))}
    </div>
  </div>);
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────
const PRODS=[
  {id:1,en:"Modern Island Unit",ar:"وحدة جزيرة عصرية",style:"Modern",price:4200,sku:"MOD-ISL-001",descEn:"Large central island with integrated sink",descAr:"جزيرة مركزية كبيرة مع حوض متكامل"},
  {id:2,en:"Classic White Lacquer",ar:"طقم لاكيه أبيض كلاسيكي",style:"Classic",price:8500,sku:"CLS-WHT-002",descEn:"Full set, high-gloss white lacquer",descAr:"طقم كامل، لاكيه أبيض لامع"},
  {id:3,en:"Marble Countertop /m²",ar:"سطح رخام للمتر",style:"All",price:380,sku:"CTR-MRB-003",descEn:"Carrara marble, custom cut",descAr:"رخام كاررا، قصّ حسب الطلب"},
  {id:4,en:"Smart Appliance Pack",ar:"حزمة أجهزة ذكية",style:"Modern",price:6200,sku:"SMA-APP-004",descEn:"Oven, hob, dishwasher, fridge — smart",descAr:"فرن، موقد، غسالة، ثلاجة — ذكية"},
  {id:5,en:"Rustic Solid Oak Base",ar:"قاعدة خشب بلوط ريفي",style:"Rustic",price:3100,sku:"RST-OAK-005",descEn:"Solid oak, aged finish, soft-close",descAr:"بلوط صلب، تشطيب عتيق"},
  {id:6,en:"Industrial Black Range",ar:"طقم أسود صناعي",style:"Industrial",price:5400,sku:"IND-BLK-006",descEn:"Matte black, open shelving",descAr:"أسود مطفأ، أرفف مفتوحة"},
  {id:7,en:"Minimalist Handle-less",ar:"طقم بدون مقابض",style:"Minimalist",price:9800,sku:"MIN-HLS-007",descEn:"Push-to-open, fully integrated",descAr:"يفتح بالضغط، متكامل بالكامل"},
  {id:8,en:"Wall Cabinet Set",ar:"خزائن حائط",style:"All",price:2200,sku:"WLL-CAB-008",descEn:"Upper wall cabinets, multiple finishes",descAr:"خزائن علوية، تشطيبات متعددة"},
  {id:9,en:"Quartz Worktop /m²",ar:"سطح كوارتز للمتر",style:"All",price:280,sku:"CTR-QTZ-009",descEn:"Engineered quartz, stain-resistant",descAr:"كوارتز هندسي مقاوم للبقع"},
  {id:10,en:"Traditional Shaker",ar:"مطبخ شاكر تقليدي",style:"Traditional",price:7600,sku:"TRD-SHK-010",descEn:"Classic shaker doors, painted finish",descAr:"أبواب شاكر كلاسيكية، تشطيب مدهون"},
];
const EMOJIS={Modern:"🏙️",Classic:"🏛️",Contemporary:"◼",Rustic:"🌿",Industrial:"⚙️",Minimalist:"□",Traditional:"🪵",Bespoke:"✦",All:"🍳"};
function Products({t,lang}) {
  const rtl=lang==="ar";
  const [f,setF]=useState("All");
  const shown=f==="All"?PRODS:PRODS.filter(p=>p.style===f||p.style==="All");
  return (<>
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
      {["All",...STYLES].map((s,i)=>(
        <button key={s} className={`btn ${f===s?"btn-gold":"btn-ghost"} btn-sm`} onClick={()=>setF(s)} style={{fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{s==="All"?(rtl?"الكل":"All"):(rtl?STYLES_AR[i-1]:s)}</button>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11}}>
      {shown.map(p=>(<div key={p.id} className="card" style={{padding:13}}>
        <div style={{background:"var(--sf2)",borderRadius:8,height:75,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:9}}>{EMOJIS[p.style]||"🍳"}</div>
        <div style={{fontSize:9.5,color:"var(--cr3)",marginBottom:3}}>{p.sku} · {p.style}</div>
        <div style={{fontFamily:rtl?"var(--fa)":"var(--fd)",fontSize:13.5,color:"var(--cr)",marginBottom:5}}>{rtl?p.ar:p.en}</div>
        <div style={{fontSize:11.5,color:"var(--cr3)",marginBottom:9,lineHeight:1.5,fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{rtl?p.descAr:p.descEn}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{color:"var(--gold)",fontWeight:600}}>{fmt(p.price)}</span>
          <button className="btn btn-ghost btn-xs" style={{fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{rtl?"+ إضافة":"+ Add"}</button>
        </div>
      </div>))}
    </div>
  </>);
}

// ── WHATSAPP MODAL ─────────────────────────────────────────────────────────
function WAModal({job,lang,t,rtl,onClose}) {
  const template = waTemplates[job.stageId] || waTemplates.contact;
  const msg = template(job.name, lang);
  const phone = job.phone.replace(/\D/g,"");
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  return (<div className="ov" onClick={onClose}>
    <div className={`modal${rtl?" rtl":""}`} style={{width:460,direction:rtl?"rtl":"ltr"}} onClick={e=>e.stopPropagation()}>
      <div className="modal-title">💬 {t.whatsapp} — {job.name}</div>
      <div style={{fontSize:12.5,color:"var(--cr3)",marginBottom:8,fontFamily:rtl?"var(--fa)":"var(--fb)"}}>
        {t.warmMessage}: <strong style={{color:"var(--cr)"}}>{job.phone}</strong>
      </div>
      <div style={{fontSize:11,color:"var(--cr3)",marginBottom:4,textTransform:"uppercase",letterSpacing:rtl?0:".08em",fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{rtl?"الرسالة المقترحة:":"Suggested message:"}</div>
      <div className={`wa-preview${rtl?" rtl":""}`}>{msg}</div>
      <div style={{fontSize:11,color:"var(--cr3)",marginBottom:12,fontFamily:rtl?"var(--fa)":"var(--fb)"}}>
        {rtl?"المرحلة الحالية":"Current stage"}: <span style={{color:"var(--gold)"}}>{stageLabel(job.stageId,lang)}</span>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
        <a href={waUrl} target="_blank" rel="noreferrer" className="btn btn-wa" style={{textDecoration:"none"}} onClick={onClose}>
          💬 {t.openWhatsApp}
        </a>
      </div>
    </div>
  </div>);
}

// ── QUOTE MODAL ────────────────────────────────────────────────────────────
function QuoteModal({job,lang,t,rtl,onClose}) {
  const today=new Date().toLocaleDateString(lang==="ar"?"ar-JO":"en-GB",{day:"2-digit",month:"long",year:"numeric"});
  const [items,setItems]=useState(QUOTE_ITEMS_DEFAULT.map((it,i)=>({...it,id:i,price:i===4?Math.round((job.finalQuote||job.budget||0)*0.08):Math.round((job.finalQuote||job.budget||0)*0.18)})));
  const total=items.reduce((s,it)=>s+(it.qty||0)*(it.price||0),0);
  const updItem=(id,field,val)=>setItems(its=>its.map(it=>it.id===id?{...it,[field]:field==="qty"||field==="price"?Number(val):val}:it));
  const addItem=()=>setItems(its=>[...its,{id:Date.now(),desc:"",qty:1,unit:"set",price:0}]);
  const remItem=id=>setItems(its=>its.filter(it=>it.id!==id));

  const printQuote = () => {
    const el = document.getElementById("quote-print-area");
    if(!el) return;
    const w = window.open("","_blank","width=800,height=900");
    w.document.write(`<html><head><title>Quote ${job.quoteNo||""}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@400;500;600&display=swap');
      body{margin:0;padding:0;background:#fff;font-family:'Outfit',sans-serif}
      *{box-sizing:border-box}
    </style></head><body>`);
    w.document.write(el.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    setTimeout(()=>{w.print();},800);
  };

  return (<div className="ov" onClick={onClose}>
    <div className={`modal modal-lg${rtl?" rtl":""}`} style={{direction:rtl?"rtl":"ltr"}} onClick={e=>e.stopPropagation()}>
      <div className="modal-title">📄 {t.generateQuote} — {job.name}</div>

      {/* Items editor */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:rtl?0:".09em",color:"var(--cr3)",marginBottom:8,fontFamily:rtl?"var(--fa)":"var(--fb)"}}>{rtl?"بنود عرض السعر — قابلة للتعديل":"Quote items — editable"}</div>
        {items.map(it=>(<div key={it.id} className="qi-row">
          <input className="qi-input" value={it.desc} onChange={e=>updItem(it.id,"desc",e.target.value)} placeholder={rtl?"وصف البند":"Item description"} />
          <input className="qi-input" type="number" value={it.qty} onChange={e=>updItem(it.id,"qty",e.target.value)} />
          <input className="qi-input" value={it.unit} onChange={e=>updItem(it.id,"unit",e.target.value)} />
          <input className="qi-input" type="number" value={it.price} onChange={e=>updItem(it.id,"price",e.target.value)} placeholder="0" />
          <button className="btn btn-red btn-xs" onClick={()=>remItem(it.id)}>✕</button>
        </div>))}
        <button className="btn btn-ghost btn-sm" onClick={addItem}>+ {rtl?"إضافة بند":"Add item"}</button>
        <div style={{textAlign:"right",fontSize:14,color:"var(--gold)",fontWeight:600,marginTop:8}}>{rtl?"الإجمالي":"Total"}: {fmt(total)}</div>
      </div>

      <div className="divider" />

      {/* Preview */}
      <div id="quote-print-area">
        <div className="quote-preview">
          <div className="quote-header">
            <div>
              <div className="quote-company">✦ NOVA</div>
              <div style={{fontSize:12,color:"#8a6f2e",marginTop:3}}>Amman, Jordan · prestige-kitchens.jo</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div className="quote-title-big">{t.quoteTitle}</div>
              <div style={{fontSize:12,color:"#6a5a3a"}}>{t.quoteRef}: <strong>{job.quoteNo||"DRAFT"}</strong></div>
            </div>
          </div>
          <div className="quote-meta-grid">
            <div className="q-meta-blk"><div className="q-meta-lbl">{t.quoteTo}</div><div className="q-meta-val">{job.name}</div><div style={{fontSize:11,color:"#6a5a3a",marginTop:2}}>{job.phone}{job.email?` · ${job.email}`:""}</div></div>
            <div className="q-meta-blk"><div className="q-meta-lbl">{t.quoteDate}</div><div className="q-meta-val">{today}</div><div style={{fontSize:11,color:"#6a5a3a",marginTop:2}}>{t.quoteValid}: {t.quoteValidDays}</div></div>
            <div className="q-meta-blk"><div className="q-meta-lbl">{rtl?"نوع المطبخ":"Kitchen Style"}</div><div className="q-meta-val">{job.style}</div></div>
            <div className="q-meta-blk"><div className="q-meta-lbl">{rtl?"المصمم":t.designer}</div><div className="q-meta-val">{job.designer}</div></div>
          </div>
          <table className="quote-items-table">
            <thead><tr><th style={{width:"50%"}}>{rtl?"البند":"Description"}</th><th>{rtl?"الكمية":"Qty"}</th><th>{rtl?"الوحدة":"Unit"}</th><th style={{textAlign:"right"}}>{rtl?"السعر (دينار)":"Price (JD)"}</th><th style={{textAlign:"right"}}>{rtl?"المجموع":"Total"}</th></tr></thead>
            <tbody>
              {items.map(it=>(<tr key={it.id}>
                <td>{it.desc||"—"}</td><td>{it.qty}</td><td>{it.unit}</td>
                <td style={{textAlign:"right"}}>{Number(it.price).toLocaleString()}</td>
                <td style={{textAlign:"right",fontWeight:600}}>{(it.qty*it.price).toLocaleString()}</td>
              </tr>))}
              <tr className="quote-total-row">
                <td colSpan={4} style={{textAlign:"right",paddingRight:12,fontSize:13}}>{rtl?"الإجمالي الكلي":"TOTAL"}</td>
                <td style={{textAlign:"right",fontSize:15,color:"#8a6f2e"}}>JD {total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          {job.notes&&<div style={{background:"#faf8f3",borderRadius:6,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#5a4a2a"}}><strong>{t.quoteNotes}:</strong> {job.notes}</div>}
          <div className="quote-footer">
            <div style={{fontSize:11,color:"#8a6f2e",maxWidth:260,lineHeight:1.6}}>
              {rtl?"هذا العرض صالح لمدة 30 يوماً من تاريخه. الأسعار تشمل المواد والتركيب.":"This quotation is valid for 30 days from the date above. Prices include materials and installation."}
            </div>
            <div style={{textAlign:"center"}}>
              <div className="quote-sig-line" />
              <div className="quote-sig-lbl">{t.quoteSig}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
        <button className="btn btn-gold" onClick={printQuote}>🖨️ {rtl?"طباعة / تنزيل PDF":"Print / Save PDF"}</button>
      </div>
    </div>
  </div>);
}

// ── JOB MODAL ──────────────────────────────────────────────────────────────
function JobModal({job,lang,t,rtl,onClose,onSave}) {
  const [f,sf]=useState(job||{name:"",phone:"",email:"",address:"",source:"Walk-In",style:"Modern",budget:"",priority:"Medium",designer:DESIGNERS[0],notes:""});
  const s=(k,v)=>sf(x=>({...x,[k]:v}));
  const srcList=rtl?SOURCES_AR:SOURCES;
  const styList=rtl?STYLES_AR:STYLES;
  return (<div className="ov" onClick={onClose}>
    <div className={`modal${rtl?" rtl":""}`} style={{direction:rtl?"rtl":"ltr"}} onClick={e=>e.stopPropagation()}>
      <div className="modal-title">{job?t.editJob:(rtl?"مشروع مطبخ جديد":"New Kitchen Job")}</div>
      <div className="fg">
        <div className="field"><label>{t.name} *</label><input value={f.name} onChange={e=>s("name",e.target.value)} /></div>
        <div className="field"><label>{t.phone} *</label><input value={f.phone} onChange={e=>s("phone",e.target.value)} placeholder="+962 79…" /></div>
        <div className="field"><label>{t.email}</label><input value={f.email||""} onChange={e=>s("email",e.target.value)} /></div>
        <div className="field"><label>{t.address}</label><input value={f.address||""} onChange={e=>s("address",e.target.value)} /></div>
        <div className="field"><label>{t.source}</label>
          <select value={f.source} onChange={e=>s("source",SOURCES[srcList.indexOf(e.target.value)]||e.target.value)}>
            {srcList.map((x,i)=><option key={i} value={x}>{x}</option>)}</select></div>
        <div className="field"><label>{t.style}</label>
          <select value={f.style} onChange={e=>s("style",STYLES[styList.indexOf(e.target.value)]||e.target.value)}>
            {styList.map((x,i)=><option key={i} value={x}>{x}</option>)}</select></div>
        <div className="field"><label>{t.budget}</label><input type="number" value={f.budget} onChange={e=>s("budget",Number(e.target.value))} placeholder="15000" /></div>
        <div className="field"><label>{t.priority}</label><select value={f.priority} onChange={e=>s("priority",e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></div>
        <div className="field fg-full"><label>{t.designer}</label><select value={f.designer} onChange={e=>s("designer",e.target.value)}>{DESIGNERS.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="field fg-full"><label>{t.notes}</label><textarea value={f.notes||""} onChange={e=>s("notes",e.target.value)} /></div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
        <button className="btn btn-gold" onClick={()=>{if(!f.name||!f.phone){alert(rtl?"الاسم والهاتف مطلوبان":"Name and phone required");return;}onSave(f);}}>{job?t.save:(rtl?"إنشاء":"Create")}</button>
      </div>
    </div>
  </div>);
}

// ── NOTE MODAL ─────────────────────────────────────────────────────────────
function NoteModal({id,user,lang,t,rtl,onClose,onSave}) {
  const [txt,set]=useState("");
  return (<div className="ov" onClick={onClose}>
    <div className={`modal${rtl?" rtl":""}`} style={{width:420,direction:rtl?"rtl":"ltr"}} onClick={e=>e.stopPropagation()}>
      <div className="modal-title">+ {t.addNote}</div>
      <div className="field"><label>{rtl?"الملاحظة":"Note"}</label><textarea value={txt} onChange={e=>set(e.target.value)} placeholder={t.noteplaceholder} style={{minHeight:90}} /></div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
        <button className="btn btn-gold" onClick={()=>{if(!txt.trim())return;onSave(id,txt.trim());}}>{t.saveNote}</button>
      </div>
    </div>
  </div>);
}
