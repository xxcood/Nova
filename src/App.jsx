import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  onSnapshot, setDoc, addDoc, deleteDoc,
  updateDoc, writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUSGspNQXR0yZBwO98sCyiGQmpHzEjQrI",
  authDomain: "nova-crm-e049b.firebaseapp.com",
  projectId: "nova-crm-e049b",
  storageBucket: "nova-crm-e049b.firebasestorage.app",
  messagingSenderId: "570958271422",
  appId: "1:570958271422:web:18a7e6cccd1bf6a2339fef"
};
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const jobsCol = collection(db, "jobs");
const usersCol = collection(db, "users");

const ROLES = {
  admin:    { label:"Admin",      labelAr:"مدير النظام", color:"#c9a84c", nav:["dashboard","jobs","pipeline","approvals","factory","tasks","reports","products","users"], canEdit:true,  canDelete:true,  canApprove:true,  canFactory:true,  seeAllJobs:true,  canManageUsers:true,  desc:"Full system access" },
  sales:    { label:"Sales",      labelAr:"مبيعات",      color:"#5aaee0", nav:["dashboard","jobs","pipeline","tasks"],                                                      canEdit:true,  canDelete:false, canApprove:false, canFactory:false, seeAllJobs:true,  canManageUsers:false, desc:"Add leads, manage contacts" },
  designer: { label:"Designer",   labelAr:"مصمم",        color:"#9b6ce0", nav:["jobs","tasks","products"],                                                                  canEdit:true,  canDelete:false, canApprove:false, canFactory:false, seeAllJobs:false, canManageUsers:false, desc:"View and edit assigned jobs" },
  mgmt:     { label:"Management", labelAr:"إدارة",       color:"#e0903a", nav:["dashboard","approvals","reports"],                                                          canEdit:false, canDelete:false, canApprove:true,  canFactory:false, seeAllJobs:true,  canManageUsers:false, desc:"Approve designs and budgets" },
  factory:  { label:"Factory",    labelAr:"مصنع",        color:"#e05ca0", nav:["factory","tasks"],                                                                          canEdit:false, canDelete:false, canApprove:false, canFactory:true,  seeAllJobs:true,  canManageUsers:false, desc:"Manage production orders" },
  customer: { label:"Customer",   labelAr:"عميل",        color:"#c9a84c", nav:["progress"],                                                                                 canEdit:false, canDelete:false, canApprove:false, canFactory:false, seeAllJobs:false, canManageUsers:false, desc:"Track kitchen project" },
};

const INITIAL_USERS = [
  { id:"u1", username:"admin",   password:"admin123",   name:"Ahmad Manager",   role:"admin",    avatar:"AM", active:true },
  { id:"u2", username:"sara",    password:"sara123",    name:"Sara Al-Khatib",  role:"designer", avatar:"SA", active:true },
  { id:"u3", username:"omar",    password:"omar123",    name:"Omar Nasser",     role:"designer", avatar:"ON", active:true },
  { id:"u4", username:"leila",   password:"leila123",   name:"Leila Haddad",    role:"designer", avatar:"LH", active:true },
  { id:"u5", username:"karim",   password:"karim123",   name:"Karim Mansour",   role:"designer", avatar:"KM", active:true },
  { id:"u6", username:"sales",   password:"sales123",   name:"Sales Team",      role:"sales",    avatar:"ST", active:true },
  { id:"u7", username:"factory", password:"factory123", name:"Factory Manager", role:"factory",  avatar:"FM", active:true },
  { id:"u8", username:"mgmt",    password:"mgmt123",    name:"Management",      role:"mgmt",     avatar:"MG", active:true },
];

const STAGES = [
  { id:"contact",       en:"First Contact",           ar:"التواصل الأول",       icon:"📞", color:"#5ca8e0", cL:"Order Received",       cLA:"تم استلام الطلب",     vTo:["admin","sales","designer","mgmt","factory"], eBy:["admin","sales"],           tE:["Identify source","Qualify budget","Log customer info","Assign designer"],             tA:["تحديد المصدر","تحديد الميزانية","تسجيل بيانات العميل","تعيين المصمم"] },
  { id:"measurement",   en:"Measurement Visit",       ar:"زيارة القياس",         icon:"📐", color:"#7ec8e3", cL:"Site Measurement",       cLA:"قياس الموقع",         vTo:["admin","sales","designer"],                   eBy:["admin","sales","designer"], tE:["Book site visit","Record dimensions","Note plumbing","Take photos"],                 tA:["حجز الزيارة","تسجيل الأبعاد","ملاحظة السباكة","التقاط صور"] },
  { id:"design",        en:"Design Creation",         ar:"إنشاء التصميم",        icon:"✏️", color:"#c9a84c", cL:"Design In Progress",     cLA:"التصميم قيد التنفيذ", vTo:["admin","sales","designer","mgmt"],            eBy:["admin","designer"],         tE:["Create 2D plan","Render 3D design","Select materials","Prepare design pack"],       tA:["إنشاء مخطط 2D","تصيير التصميم 3D","اختيار المواد","إعداد حزمة التصميم"] },
  { id:"cust_approval", en:"Customer Approval",       ar:"موافقة العميل",         icon:"👤", color:"#e08c3c", cL:"Awaiting Your Approval", cLA:"بانتظار موافقتك",    vTo:["admin","sales","designer","mgmt"],            eBy:["admin","sales","mgmt"],     tE:["Present design","Note revisions","Get written approval","Update if needed"],        tA:["عرض التصميم","تدوين التعديلات","الحصول على موافقة","التحديث إذا لزم"] },
  { id:"mgmt_approval", en:"Management Approval",     ar:"موافقة الإدارة",        icon:"🏛️", color:"#d4a843", cL:"Final Review",           cLA:"المراجعة النهائية",  vTo:["admin","mgmt"],                               eBy:["admin","mgmt"],             tE:["Submit to management","Review costings","Get sign-off","Finalize spec"],            tA:["تقديم للإدارة","مراجعة التكاليف","الحصول على موافقة","إنهاء المواصفات"] },
  { id:"budget",        en:"Budget & Quotation",      ar:"الميزانية والعرض",      icon:"💰", color:"#9c6ce0", cL:"Quotation Prepared",     cLA:"تم إعداد عرض السعر", vTo:["admin","sales","mgmt"],                       eBy:["admin","sales"],            tE:["Prepare itemized quote","Apply discounts","Send quotation","Follow up"],             tA:["إعداد عرض مفصل","تطبيق الخصومات","إرسال العرض","المتابعة"] },
  { id:"contract",      en:"Sign Contract",           ar:"توقيع العقد",           icon:"📝", color:"#4caf7d", cL:"Contract Signed",        cLA:"تم توقيع العقد",     vTo:["admin","sales","mgmt"],                       eBy:["admin","sales"],            tE:["Prepare contract","Collect deposit","Get signature","Log contract number"],         tA:["إعداد العقد","تحصيل العربون","الحصول على التوقيع","تسجيل رقم العقد"] },
  { id:"factory",       en:"Factory / Production",    ar:"المصنع / الإنتاج",      icon:"🏭", color:"#e05ca0", cL:"Being Manufactured",     cLA:"قيد التصنيع",        vTo:["admin","factory","mgmt"],                     eBy:["admin","factory"],          tE:["Send production order","Confirm receipt","Track production","QC check"],            tA:["إرسال أمر الإنتاج","تأكيد الاستلام","متابعة الإنتاج","فحص الجودة"] },
  { id:"installation",  en:"Delivery & Installation", ar:"التسليم والتركيب",       icon:"🔧", color:"#4caf7d", cL:"Installation Day",       cLA:"يوم التركيب",        vTo:["admin","sales","factory"],                    eBy:["admin","sales","factory"],  tE:["Schedule delivery","Confirm install team","Complete installation","Sign-off"],      tA:["جدولة التسليم","تأكيد فريق التركيب","إتمام التركيب","توقيع العميل"] },
  { id:"aftersales",    en:"After-Sales",             ar:"ما بعد البيع",          icon:"⭐", color:"#c9a84c", cL:"Project Complete!",      cLA:"اكتمل مشروعك!",     vTo:["admin","sales","mgmt"],                       eBy:["admin","sales"],            tE:["Send survey","Log snagging","Issue warranty cert","Request review"],                tA:["إرسال استبيان","تسجيل المشكلات","إصدار شهادة الضمان","طلب تقييم"] },
];
const STAGE_IDS = STAGES.map(s=>s.id);
const SOURCES = ["Walk-In","Referral","Website","Instagram","Facebook","Phone","Exhibition","Google Ads","Partner"];
const STYLES = ["Modern","Classic","Contemporary","Rustic","Industrial","Minimalist","Traditional","Bespoke"];
const DESIGNERS_LIST = ["Sara Al-Khatib","Omar Nasser","Leila Haddad","Karim Mansour"];
const FACTORY_STATUSES = ["Order Sent","Confirmed","In Production","QC Check","Ready for Delivery","Delivered"];
const AV_COLORS = ["#3d5c38","#3b506b","#5c3b3b","#5c4e3b","#3b5a5c","#523b5c","#4a3b5c","#3b4a5c"];
const RC = { admin:"#8a6f2e", sales:"#2e5c8a", designer:"#5c2e8a", mgmt:"#8a4a2e", factory:"#2e8a5c", customer:"#6b5520" };
const mkA = () => ({ customer_design:null, management_design:null, customer_budget:null, management_budget:null, contract_signed:false, deposit_received:false });
const mkT = () => ({ contact:0,measurement:0,design:0,cust_approval:0,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0 });
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const tod = () => new Date().toISOString().slice(0,10);
const ini = n => n.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
const fmt = n => n ? `JD ${Number(n).toLocaleString()}` : "—";
const fmtD = d => { if(!d) return "—"; return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); };
const sIdx = id => STAGE_IDS.indexOf(id);
const sObj = id => STAGES.find(s=>s.id===id);
const pct = ct => ct ? Math.round(Object.values(ct).reduce((a,b)=>a+b,0)/(STAGES.length*4)*100) : 0;
const SB = { contact:"b-blue",measurement:"b-blue",design:"b-gold",cust_approval:"b-orange",mgmt_approval:"b-orange",budget:"b-purple",contract:"b-green",factory:"b-pink",installation:"b-green",aftersales:"b-gold" };

const SEED = [
  { _id:"seed1", name:"Ahmad Al-Rashid", phone:"+962791234567", email:"ahmad@email.com", address:"Abdoun, Amman", source:"Referral", style:"Modern", priority:"High", budget:18500, finalQuote:17800, deposit:8900, stageId:"installation", designer:"Sara Al-Khatib", notes:"White lacquer. Island.", measureDate:"2026-02-10", measureNotes:"4.2m x 3.8m.", designFile:"KIT-041.pdf", quoteNo:"Q-2026-041", contractNo:"C-2026-019", factoryOrderNo:"FAC-088", factoryStatus:"In Production", installDate:"2026-03-18", warrantyMonths:24, customerId:"9876543210", customerPhone:"+962791234567", approvals:{customer_design:"approved",management_design:"approved",customer_budget:"approved",management_budget:"approved",contract_signed:true,deposit_received:true}, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:4,contract:4,factory:3,installation:1,aftersales:0}, createdAt:"2026-01-15", lastActivity:"2026-03-08", activityLog:[{id:"a1",date:"2026-03-08",text:"Installation scheduled",user:"Ahmad Manager"}] },
  { _id:"seed2", name:"Mona Khalil", phone:"+962772345678", email:"mona@mail.com", address:"Swefieh, Amman", source:"Instagram", style:"Classic", priority:"High", budget:12000, finalQuote:11500, deposit:null, stageId:"budget", designer:"Omar Nasser", notes:"Marble countertops.", measureDate:"2026-02-25", measureNotes:"3.6m x 2.9m.", designFile:"KIT-047.pdf", quoteNo:"Q-2026-047", contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, customerId:"8765432109", customerPhone:"+962772345678", approvals:{customer_design:"approved",management_design:"approved",customer_budget:null,management_budget:"approved",contract_signed:false,deposit_received:false}, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:2,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-01", lastActivity:"2026-03-07", activityLog:[{id:"b1",date:"2026-03-07",text:"Quote sent",user:"Omar Nasser"}] },
  { _id:"seed3", name:"Tariq Hussain", phone:"+962783456789", email:"tariq@email.jo", address:"Gardens, Amman", source:"Walk-In", style:"Contemporary", priority:"Medium", budget:9500, finalQuote:null, deposit:null, stageId:"design", designer:"Leila Haddad", notes:"Open-plan.", measureDate:"2026-03-02", measureNotes:"5.1m x 4.0m.", designFile:null, quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, customerId:"7654321098", customerPhone:"+962783456789", approvals:mkA(), completedTasks:{contact:4,measurement:4,design:1,cust_approval:0,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-20", lastActivity:"2026-03-05", activityLog:[{id:"c1",date:"2026-03-05",text:"Measurement done",user:"Leila Haddad"}] },
  { _id:"seed4", name:"Rana Aziz", phone:"+962794567890", email:"rana@home.com", address:"Dabouq, Amman", source:"Website", style:"Minimalist", priority:"Medium", budget:22000, finalQuote:null, deposit:null, stageId:"measurement", designer:"Karim Mansour", notes:"High-end.", measureDate:"2026-03-13", measureNotes:null, designFile:null, quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, customerId:"6543210987", customerPhone:"+962794567890", approvals:mkA(), completedTasks:mkT(), createdAt:"2026-03-08", lastActivity:"2026-03-08", activityLog:[{id:"d1",date:"2026-03-08",text:"Lead created",user:"Sales Team"}] },
  { _id:"seed5", name:"Sami Qasim", phone:"+962775678901", email:"sami@email.com", address:"Khalda, Amman", source:"Referral", style:"Modern", priority:"High", budget:31000, finalQuote:30500, deposit:15250, stageId:"aftersales", designer:"Sara Al-Khatib", notes:"Very satisfied.", measureDate:"2025-12-01", measureNotes:"6.0m x 4.5m.", designFile:"KIT-018.pdf", quoteNo:"Q-2026-018", contractNo:"C-2026-005", factoryOrderNo:"FAC-022", factoryStatus:"Delivered", installDate:"2026-02-15", warrantyMonths:24, customerId:"5432109876", customerPhone:"+962775678901", approvals:{customer_design:"approved",management_design:"approved",customer_budget:"approved",management_budget:"approved",contract_signed:true,deposit_received:true}, completedTasks:{contact:4,measurement:4,design:4,cust_approval:4,mgmt_approval:4,budget:4,contract:4,factory:4,installation:4,aftersales:2}, createdAt:"2025-11-20", lastActivity:"2026-03-01", activityLog:[{id:"e1",date:"2026-03-01",text:"Survey sent",user:"Ahmad Manager"}] },
  { _id:"seed6", name:"Faris Al-Omari", phone:"+962797890123", email:"faris@omari.jo", address:"Jubeiha, Amman", source:"Phone", style:"Rustic", priority:"Medium", budget:15000, finalQuote:null, deposit:null, stageId:"cust_approval", designer:"Leila Haddad", notes:"Farmhouse style.", measureDate:"2026-02-28", measureNotes:"4.8m x 3.2m.", designFile:"KIT-052.pdf", quoteNo:null, contractNo:null, factoryOrderNo:null, factoryStatus:null, installDate:null, warrantyMonths:null, customerId:"4321098765", customerPhone:"+962797890123", approvals:{customer_design:null,management_design:"approved",customer_budget:null,management_budget:null,contract_signed:false,deposit_received:false}, completedTasks:{contact:4,measurement:4,design:4,cust_approval:1,mgmt_approval:0,budget:0,contract:0,factory:0,installation:0,aftersales:0}, createdAt:"2026-02-10", lastActivity:"2026-03-06", activityLog:[{id:"f1",date:"2026-03-06",text:"Design presented",user:"Leila Haddad"}] },
];

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Tajawal:wght@300;400;500;700&family=Outfit:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0d0c0a;--sf:#171510;--sf2:#1e1c17;--b:#2a261e;--b2:#332f24;--gold:#c9a84c;--gold2:#a88535;--gg:rgba(201,168,76,.13);--gd:#6b5520;--cr:#ede8dc;--cr2:#b0a898;--cr3:#726b5e;--green:#4db87a;--red:#e05555;--blue:#5aaee0;--orange:#e0903a;--purple:#9b6ce0;--pink:#e05ca0;--fd:'Cormorant Garamond',serif;--fb:'Outfit',sans-serif;--fa:'Tajawal',sans-serif;--r:10px;--tr:0.18s ease}
body{background:var(--bg);color:var(--cr);font-family:var(--fb);font-size:13px;line-height:1.5}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:var(--b2);border-radius:4px}
.loading{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:var(--bg)}
.loading-logo{font-family:var(--fd);font-size:32px;color:var(--gold)}
.spinner{width:36px;height:36px;border:3px solid var(--b2);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.sync-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--green);animation:pulse 2s ease infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes tri{from{transform:translateX(50px);opacity:0}to{transform:none;opacity:1}}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden}
.login-card{background:var(--sf);border:1px solid var(--b2);border-radius:16px;padding:36px;width:400px;max-width:95vw;z-index:1;animation:su .3s ease}
.login-logo{font-family:var(--fd);font-size:28px;color:var(--gold);text-align:center;margin-bottom:3px}
.login-sub{font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:var(--cr3);text-align:center;margin-bottom:22px}
.login-err{background:rgba(224,85,85,.12);border:1px solid rgba(224,85,85,.3);border-radius:8px;padding:9px 14px;font-size:12.5px;color:var(--red);margin-bottom:12px;text-align:center}
.tab-sw{display:flex;background:var(--sf2);border-radius:10px;padding:3px;margin-bottom:20px;border:1px solid var(--b)}
.tab-sw-btn{flex:1;padding:9px;border:none;border-radius:8px;cursor:pointer;font-family:var(--fb);font-size:12.5px;font-weight:500;transition:var(--tr);background:transparent;color:var(--cr3)}
.tab-sw-btn.on{background:var(--sf);color:var(--cr);box-shadow:0 2px 8px rgba(0,0,0,.4)}
.cust-portal{min-height:100vh;background:var(--bg);display:flex;flex-direction:column;align-items:center;padding:24px 16px}
.cust-hdr{width:100%;max-width:640px;display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}
.cust-card{background:var(--sf);border:1px solid var(--b);border-radius:14px;padding:24px;width:100%;max-width:640px;margin-bottom:14px;animation:su .3s ease}
.s-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid var(--b);background:var(--sf2);transition:var(--tr);margin-bottom:8px}
.s-row.done{border-color:rgba(77,184,122,.35);background:rgba(77,184,122,.06)}
.s-row.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08)}
.s-row.upcoming{opacity:.45}
.s-ico{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.s-row.done .s-ico{background:rgba(77,184,122,.2)}.s-row.active .s-ico{background:rgba(201,168,76,.2)}.s-row.upcoming .s-ico{background:var(--b)}
.big-prog{height:10px;border-radius:10px;background:var(--b);overflow:hidden;margin:8px 0}
.big-prog-fill{height:100%;border-radius:10px;background:linear-gradient(90deg,var(--gold2),var(--gold));transition:width 1s ease}
.app{display:flex;height:100vh;overflow:hidden}
.sb{width:224px;min-width:224px;background:var(--sf);border-right:1px solid var(--b);display:flex;flex-direction:column;overflow-y:auto}
.sb-logo{padding:18px 16px 14px;border-bottom:1px solid var(--b)}
.sb-logo-name{font-family:var(--fd);font-size:20px;color:var(--gold)}
.sb-logo-sub{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:var(--cr3);margin-top:2px}
.sb-sync{font-size:10px;color:var(--green);margin-top:4px;display:flex;align-items:center;gap:5px}
.sb-user{padding:11px 14px;border-bottom:1px solid var(--b);background:var(--sf2);display:flex;align-items:center;gap:9px}
.sb-uname{font-size:12px;font-weight:600;color:var(--cr)}.sb-urole{font-size:10px;color:var(--cr3)}
.sb-nav{padding:10px 8px 0;flex:1}
.sb-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;color:var(--cr2);font-size:12.5px;transition:var(--tr);user-select:none}
.sb-item:hover{background:var(--sf2);color:var(--cr)}.sb-item.on{background:var(--gg);color:var(--gold)}
.sb-item .ico{width:18px;text-align:center;font-size:14px;flex-shrink:0}
.sb-badge{margin-left:auto;background:var(--gold);color:#000;font-size:10px;font-weight:700;border-radius:20px;padding:1px 6px}
.sb-badge.red{background:var(--red);color:#fff}
.sb-bot{padding:10px 8px;border-top:1px solid var(--b)}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{background:var(--sf);border-bottom:1px solid var(--b);height:52px;padding:0 20px;display:flex;align-items:center;gap:10px;flex-shrink:0}
.topbar-title{font-family:var(--fd);font-size:20px;color:var(--cr);flex:1}
.content{flex:1;overflow-y:auto;padding:18px}
.rbanner{padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:12.5px;display:flex;align-items:center;gap:10px;border:1px solid}
.btn{padding:6px 13px;border-radius:8px;border:none;cursor:pointer;font-family:var(--fb);font-size:12.5px;font-weight:500;transition:var(--tr);display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.btn-gold{background:var(--gold);color:#000}.btn-gold:hover{background:#d4b460}
.btn-ghost{background:var(--sf2);color:var(--cr2);border:1px solid var(--b)}.btn-ghost:hover{color:var(--cr);border-color:var(--b2)}
.btn-green{background:rgba(77,184,122,.14);color:var(--green);border:1px solid rgba(77,184,122,.3)}
.btn-red{background:rgba(224,85,85,.12);color:var(--red);border:1px solid rgba(224,85,85,.25)}
.btn-blue{background:rgba(90,174,224,.12);color:var(--blue);border:1px solid rgba(90,174,224,.25)}
.btn-wa{background:rgba(37,211,102,.12);color:#25d366;border:1px solid rgba(37,211,102,.28)}
.btn-sm{padding:4px 10px;font-size:11.5px}.btn-xs{padding:2px 8px;font-size:11px}
.card{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:16px}
.card-title{font-family:var(--fd);font-size:16px;color:var(--cr);margin-bottom:13px}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.stat{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:14px;position:relative;overflow:hidden}
.stat::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--gold))}
.stat-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--cr3)}
.stat-val{font-family:var(--fd);font-size:26px;color:var(--cr);margin:3px 0 1px}
.stat-ico{position:absolute;right:12px;top:12px;font-size:20px;opacity:.18}
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th{padding:9px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;letter-spacing:.09em;color:var(--gd);font-weight:500;border-bottom:1px solid var(--b);white-space:nowrap}
td{padding:9px 10px;border-bottom:1px solid rgba(42,38,30,.5);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr.clk:hover td{background:rgba(201,168,76,.03);cursor:pointer}
.td-name{font-weight:500;color:var(--cr);font-size:13px}.td-sub{font-size:10.5px;color:var(--cr3);margin-top:1px}
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap}
.b-blue{background:rgba(90,174,224,.14);color:var(--blue)}.b-gold{background:rgba(201,168,76,.14);color:var(--gold)}
.b-orange{background:rgba(224,144,58,.14);color:var(--orange)}.b-green{background:rgba(77,184,122,.14);color:var(--green)}
.b-red{background:rgba(224,85,85,.14);color:var(--red)}.b-purple{background:rgba(155,108,224,.14);color:var(--purple)}
.b-pink{background:rgba(224,92,160,.14);color:var(--pink)}.b-grey{background:rgba(112,104,94,.14);color:var(--cr3)}
.st-track{display:flex;margin-bottom:14px;border-radius:8px;overflow:hidden;border:1px solid var(--b)}
.st-step{flex:1;padding:7px 3px;text-align:center;font-size:8.5px;font-weight:600;text-transform:uppercase;cursor:pointer;transition:var(--tr);border-right:1px solid var(--b)}
.st-step:last-child{border-right:none}
.st-step-ico{font-size:13px;display:block;margin-bottom:2px}
.jlayout{display:grid;grid-template-columns:1fr 298px;gap:13px}
.spanel{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);overflow:hidden}
.spanel-hd{padding:13px 15px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:10px}
.spanel-bd{padding:15px}
.chklist{display:flex;flex-direction:column;gap:5px;margin-bottom:13px}
.ch-item{display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;background:var(--sf2);border:1px solid var(--b);cursor:pointer;transition:var(--tr)}
.ch-item.done{border-color:rgba(77,184,122,.3);background:rgba(77,184,122,.06)}
.ch-box{width:17px;height:17px;border-radius:5px;border:1.5px solid var(--b2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px}
.ch-item.done .ch-box{background:var(--green);border-color:var(--green);color:#fff}
.ch-lbl{font-size:12.5px;color:var(--cr2);flex:1}
.ch-item.done .ch-lbl{color:var(--cr3);text-decoration:line-through}
.cside{display:flex;flex-direction:column;gap:10px}
.iblk{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:13px}
.ittl{font-size:9.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--gd);margin-bottom:9px}
.irow{display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid rgba(42,38,30,.4);font-size:12.5px;gap:8px}
.irow:last-child{border-bottom:none}
.ikey{color:var(--cr3);white-space:nowrap;flex-shrink:0}.ival{color:var(--cr);font-weight:500;text-align:right;word-break:break-word}
.gval{color:var(--gold);font-weight:600}
.aprc{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:10px 12px}
.aprc.approved{border-color:rgba(77,184,122,.35);background:rgba(77,184,122,.07)}
.aprc.revision{border-color:rgba(224,85,85,.35);background:rgba(224,85,85,.07)}
.aprc-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--cr3);margin-bottom:5px}
.aprc-st{font-size:12.5px;font-weight:600;margin-bottom:6px}
.aprc-btns{display:flex;gap:5px;flex-wrap:wrap}
.act-log{display:flex;flex-direction:column}
.act-item{display:flex;gap:9px;padding:8px 0;border-bottom:1px solid rgba(42,38,30,.4)}
.act-item:last-child{border-bottom:none}
.act-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0;margin-top:5px}
.act-txt{font-size:12px;color:var(--cr2);flex:1;line-height:1.5}.act-meta{font-size:10.5px;color:var(--cr3);margin-top:1px}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px);animation:fi .15s ease}
.modal{background:var(--sf);border:1px solid var(--b2);border-radius:14px;padding:24px;width:560px;max-width:96vw;max-height:92vh;overflow-y:auto;animation:su .2s ease}
.modal-lg{width:700px}
.modal-title{font-family:var(--fd);font-size:20px;color:var(--gold);margin-bottom:16px}
.modal-foot{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--b)}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:11px}.fg-full{grid-column:1/-1}
.field{display:flex;flex-direction:column;gap:4px}
.field label{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--cr3)}
.field input,.field select,.field textarea{background:var(--sf2);border:1px solid var(--b);border-radius:7px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;transition:var(--tr);width:100%}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--gold2);box-shadow:0 0 0 3px var(--gg)}
.field textarea{resize:vertical;min-height:68px}
select option{background:var(--sf2)}
.ugrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.ucard{background:var(--sf);border:1px solid var(--b);border-radius:var(--r);padding:14px;position:relative;transition:var(--tr)}
.ucard:hover{border-color:var(--b2)}.ucard.inactive{opacity:.5}
.ucard-acts{position:absolute;top:10px;right:10px;display:flex;gap:5px}
.kn-wrap{overflow-x:auto;padding-bottom:8px}
.kn{display:grid;gap:9px}
.kn-col{background:var(--sf);border:1px solid var(--b);border-radius:var(--r)}
.kn-hd{padding:9px 10px;border-bottom:1px solid var(--b)}
.kn-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}
.kn-cnt{font-size:10px;background:var(--sf2);border-radius:20px;padding:1px 6px;color:var(--cr3)}
.kn-cards{padding:8px;display:flex;flex-direction:column;gap:6px;min-height:60px}
.k-card{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:8px;cursor:pointer;transition:var(--tr)}
.k-card:hover{border-color:var(--b2);transform:translateY(-1px)}
.prog{height:4px;border-radius:4px;background:var(--b);overflow:hidden;margin-top:4px}
.prog-fill{height:100%;border-radius:4px;transition:width .4s ease}
.search-in{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:7px 11px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;width:190px;transition:var(--tr)}
.search-in:focus{border-color:var(--gold2);width:230px}
.fsel{background:var(--sf2);border:1px solid var(--b);border-radius:8px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none}
.toast{position:fixed;bottom:20px;right:20px;z-index:999;background:var(--sf);border:1px solid var(--b);border-left:3px solid var(--gold);border-radius:8px;padding:10px 15px;font-size:12.5px;color:var(--cr);box-shadow:0 6px 24px rgba(0,0,0,.5);animation:tri .25s ease;max-width:300px}
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}
.empty{text-align:center;padding:32px 20px;color:var(--cr3);font-size:12.5px}
.empty .ei{font-size:26px;margin-bottom:8px}
.two-col{display:grid;grid-template-columns:1fr 298px;gap:14px}
.inf{display:flex;gap:6px;align-items:center}
.inf input,.inf select{flex:1;background:var(--sf2);border:1px solid var(--b);border-radius:7px;padding:7px 10px;color:var(--cr);font-family:var(--fb);font-size:12.5px;outline:none;transition:var(--tr)}
.inf input:focus,.inf select:focus{border-color:var(--gold2)}
.wa-prev{background:var(--sf2);border:1px solid var(--b);border-radius:12px;padding:14px;margin:10px 0;font-size:13px;color:var(--cr2);line-height:1.7;white-space:pre-wrap;border-left:3px solid #25d366}
.qprev{background:#fff;color:#1a1a1a;border-radius:8px;padding:28px;font-family:'Outfit',sans-serif}
.qi-row{display:grid;grid-template-columns:2fr 50px 80px 100px 28px;gap:6px;align-items:center;margin-bottom:6px}
.qi-in{background:var(--sf2);border:1px solid var(--b);border-radius:6px;padding:6px 8px;color:var(--cr);font-family:var(--fb);font-size:12px;outline:none;width:100%}
@media(max-width:900px){.sb{width:180px;min-width:180px}.stats-row{grid-template-columns:repeat(2,1fr)}.two-col,.jlayout{grid-template-columns:1fr}.ugrid{grid-template-columns:repeat(2,1fr)}}
`;

const avC = id => AV_COLORS[Math.abs((id||"").charCodeAt(0)||0)%8];

export default function App() {
  const [auth,setAuth]=useState(null);
  const [jobs,setJobs]=useState([]);
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("dashboard");
  const [sel,setSel]=useState(null);
  const [modal,setModal]=useState(null);
  const [mdata,setMdata]=useState(null);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [toast,setToast]=useState(null);
  const [lang,setLang]=useState("en");
  const rtl=lang==="ar";
  const showT=useCallback(msg=>{setToast(msg);setTimeout(()=>setToast(null),3000);},[]);
  const openM=(m,d=null)=>{setModal(m);setMdata(d);};
  const closeM=()=>{setModal(null);setMdata(null);};
  const mkLog=(txt,usr)=>({id:uid(),date:tod(),text:txt,user:usr||"System"});

  useEffect(()=>{
    const u1=onSnapshot(jobsCol,snap=>{
      setJobs(snap.docs.map(d=>({fbId:d.id,...d.data()})));
      setLoading(false);
    });
    const u2=onSnapshot(usersCol,async snap=>{
      if(snap.empty){
        const b=writeBatch(db);
        INITIAL_USERS.forEach(u=>{const{id,...r}=u;b.set(doc(usersCol,id),r);});
        await b.commit();
        for(const j of SEED){const{_id,...r}=j;await setDoc(doc(jobsCol,_id),r);}
      } else {
        setUsers(snap.docs.map(d=>({fbId:d.id,...d.data()})));
      }
    });
    return()=>{u1();u2();};
  },[]);

  const addJob=async(data,uname)=>{
    const j={...data,createdAt:tod(),lastActivity:tod(),stageId:"contact",approvals:mkA(),completedTasks:mkT(),activityLog:[mkLog("Job created — "+data.source,uname)],finalQuote:null,deposit:null,quoteNo:null,contractNo:null,factoryOrderNo:null,factoryStatus:null,installDate:null,warrantyMonths:null,designFile:null,customerId:data.customerId||"",customerPhone:data.customerPhone||""};
    await addDoc(jobsCol,j);showT("✦ New: "+j.name);closeM();
  };
  const updJob=async(fbId,data)=>{await updateDoc(doc(jobsCol,fbId),data);showT("Saved ✓");closeM();};
  const delJob=async fbId=>{await deleteDoc(doc(jobsCol,fbId));setSel(null);setView("jobs");showT("Deleted");};
  const advStage=async(job,uname)=>{
    const i=sIdx(job.stageId);if(i>=STAGE_IDS.length-1)return;
    const ns=STAGE_IDS[i+1];const l=mkLog("Advanced to: "+sObj(ns)?.en,uname);
    await updateDoc(doc(jobsCol,job.fbId),{stageId:ns,lastActivity:tod(),activityLog:[l,...(job.activityLog||[])]});
    showT("→ "+sObj(ns)?.en);
  };
  const setStage=async(job,stage,uname)=>{
    const l=mkLog("Stage → "+sObj(stage)?.en,uname);
    await updateDoc(doc(jobsCol,job.fbId),{stageId:stage,lastActivity:tod(),activityLog:[l,...(job.activityLog||[])]});
    showT("Stage → "+sObj(stage)?.en);
  };
  const togTask=async(job,stage,idx)=>{
    const cur=job.completedTasks[stage]||0;const max=sObj(stage).tE.length;
    const nxt=idx<cur?cur-1:Math.min(cur+1,max);
    await updateDoc(doc(jobsCol,job.fbId),{[`completedTasks.${stage}`]:nxt});
  };
  const setAppr=async(job,key,val,uname)=>{
    const l=mkLog(key.replace(/_/g," ")+" → "+val,uname);
    await updateDoc(doc(jobsCol,job.fbId),{[`approvals.${key}`]:val,lastActivity:tod(),activityLog:[l,...(job.activityLog||[])]});
    showT("Approval updated");
  };
  const addNote=async(job,text,uname)=>{
    const l=mkLog(text,uname);
    await updateDoc(doc(jobsCol,job.fbId),{activityLog:[l,...(job.activityLog||[])],lastActivity:tod()});
    showT("Note added");closeM();
  };
  const updField=async(job,field,val,uname)=>{
    const l=mkLog(field+" updated",uname);
    await updateDoc(doc(jobsCol,job.fbId),{[field]:val,lastActivity:tod(),activityLog:[l,...(job.activityLog||[])]});
    showT("Saved ✓");
  };
  const addUser=async data=>{await setDoc(doc(usersCol,uid()),{...data,active:true});showT("User added: "+data.name);closeM();};
  const updUser=async(fbId,data)=>{await updateDoc(doc(usersCol,fbId),data);showT("Updated");closeM();};
  const togUser=async u=>{await updateDoc(doc(usersCol,u.fbId),{active:!u.active});showT(u.name+" "+(u.active?"deactivated":"activated"));};
  const delUser=async fbId=>{if(fbId==="u1"){showT("Cannot delete main admin!");return;}await deleteDoc(doc(usersCol,fbId));showT("Removed");closeM();};

  if(loading) return <><style>{CSS}</style><div className="loading"><div className="loading-logo">✦ NOVAHome</div><div className="spinner"/><div style={{fontSize:12,color:"var(--cr3)"}}>Connecting to database…</div></div></>;
  if(!auth) return <><style>{CSS}</style><LoginScreen users={users} jobs={jobs} lang={lang} rtl={rtl} onLogin={setAuth} onLang={()=>setLang(l=>l==="en"?"ar":"en")}/></>;
  if(auth.role==="customer"){
    const cj=jobs.find(j=>j.fbId===auth.jobId);
    return <><style>{CSS}</style><CustPortal job={cj} lang={lang} rtl={rtl} onLang={()=>setLang(l=>l==="en"?"ar":"en")} onLogout={()=>setAuth(null)}/></>;
  }

  const role=ROLES[auth.role];
  const vis=role.seeAllJobs?jobs:jobs.filter(j=>j.designer===auth.name);
  const filt=vis.filter(j=>{const q=search.toLowerCase();return(!q||j.name.toLowerCase().includes(q)||j.phone.includes(q))&&(filter==="all"||j.stageId===filter);});
  const selJ=jobs.find(j=>j.fbId===sel);
  const pendA=vis.filter(j=>j.approvals&&(j.approvals.customer_design===null||j.approvals.management_design===null)&&["cust_approval","mgmt_approval"].includes(j.stageId)).length;
  const factC=vis.filter(j=>j.stageId==="factory").length;
  const totR=vis.filter(j=>["contract","factory","installation","aftersales"].includes(j.stageId)).reduce((s,j)=>s+(j.finalQuote||j.budget||0),0);
  const ND=[
    {v:"dashboard",i:"◈",l:"Dashboard",la:"لوحة التحكم"},
    {v:"jobs",i:"⊕",l:"All Jobs",la:"جميع المشاريع",b:vis.filter(j=>j.stageId==="contact").length||null},
    {v:"pipeline",i:"⋮⋮⋮",l:"Pipeline",la:"خط المبيعات"},
    {v:"approvals",i:"✦",l:"Approvals",la:"الموافقات",b:pendA||null,r:true},
    {v:"factory",i:"🏭",l:"Factory",la:"المصنع",b:factC||null},
    {v:"tasks",i:"✓",l:"Tasks",la:"المهام"},
    {v:"reports",i:"▦",l:"Reports",la:"التقارير"},
    {v:"products",i:"◻",l:"Products",la:"المنتجات"},
    {v:"users",i:"👥",l:"Users",la:"المستخدمون"},
  ];
  const nav=ND.filter(n=>role.nav.includes(n.v));
  const gv=v=>{setView(v);setSel(null);};
  const gj=id=>{setSel(id);setView("job");};

  return <>
    <style>{CSS}</style>
    <div className="app">
      <nav className="sb">
        <div className="sb-logo">
          <div className="sb-logo-name">✦ NOVAHome</div>
          <div className="sb-logo-sub">CRM Pro</div>
          <div className="sb-sync"><span className="sync-dot"/> Live sync</div>
        </div>
        <div className="sb-user">
          <div className="av" style={{width:30,height:30,background:RC[auth.role]||"#555",fontSize:10,color:"#fff"}}>{auth.avatar}</div>
          <div><div className="sb-uname">{auth.name}</div><div className="sb-urole">{rtl?ROLES[auth.role].labelAr:ROLES[auth.role].label}</div></div>
        </div>
        <div className="sb-nav">
          {nav.map(n=>(
            <div key={n.v} className={`sb-item${(view===n.v||(view==="job"&&n.v==="jobs"))?" on":""}`} onClick={()=>gv(n.v)}>
              <span className="ico">{n.i}</span>{rtl?n.la:n.l}
              {n.b?<span className={`sb-badge${n.r?" red":""}`}>{n.b}</span>:null}
            </div>
          ))}
        </div>
        <div className="sb-bot">
          <div className="sb-item" onClick={()=>setLang(l=>l==="en"?"ar":"en")}><span className="ico">🌐</span>{rtl?"English":"عربي"}</div>
          <div className="sb-item" onClick={()=>setAuth(null)}><span className="ico">→</span>{rtl?"خروج":"Sign Out"}</div>
        </div>
      </nav>
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{(ND.find(n=>n.v===view)||{l:selJ?.name||"",la:selJ?.name||""})[rtl?"la":"l"]}</div>
          {view==="jobs"&&<>
            <input className="search-in" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
            <select className="fsel" value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="all">All Stages</option>
              {STAGES.filter(s=>s.vTo.includes(auth.role)).map(s=><option key={s.id} value={s.id}>{s.en}</option>)}
            </select>
          </>}
          {(view==="jobs"||view==="dashboard")&&role.canEdit&&<button className="btn btn-gold" onClick={()=>openM("add")}>+ New Job</button>}
          {view==="job"&&selJ&&<>
            {role.canEdit&&<button className="btn btn-ghost btn-sm" onClick={()=>openM("edit",selJ)}>Edit</button>}
            <button className="btn btn-ghost btn-sm" onClick={()=>openM("note",selJ)}>+ Note</button>
            <button className="btn btn-wa btn-sm" onClick={()=>openM("wa",selJ)}>💬 WhatsApp</button>
            {role.canEdit&&<button className="btn btn-blue btn-sm" onClick={()=>openM("quote",selJ)}>📄 Quote</button>}
            {sIdx(selJ.stageId)<STAGE_IDS.length-1&&role.canEdit&&<button className="btn btn-gold btn-sm" onClick={()=>advStage(selJ,auth.name)}>Advance →</button>}
          </>}
          {view==="users"&&role.canManageUsers&&<button className="btn btn-gold" onClick={()=>openM("addUser")}>+ Add User</button>}
        </div>
        <div className="content">
          {auth.role!=="admin"&&view!=="job"&&(<div className="rbanner" style={{background:`${RC[auth.role]}18`,borderColor:`${RC[auth.role]}40`,color:RC[auth.role]}}><span style={{fontSize:16}}>{{sales:"💼",designer:"✏️",mgmt:"🏛️",factory:"🏭"}[auth.role]}</span><div><strong>{ROLES[auth.role].label} View</strong><span style={{fontSize:11.5,marginLeft:8,opacity:.8}}>{ROLES[auth.role].desc}</span></div></div>)}
          {view==="dashboard"&&<Dashboard jobs={vis} totR={totR} pendA={pendA} factC={factC} gj={gj} gv={gv} auth={auth} role={role}/>}
          {view==="jobs"&&<JobsTable jobs={filt} gj={gj} auth={auth} role={role} onStage={(j,s)=>setStage(j,s,auth.name)}/>}
          {view==="job"&&selJ&&<JobDetail job={selJ} auth={auth} role={role} onAdv={()=>advStage(selJ,auth.name)} onTogTask={(s,i)=>togTask(selJ,s,i)} onAppr={(k,v)=>setAppr(selJ,k,v,auth.name)} onField={(f,v)=>updField(selJ,f,v,auth.name)} onNote={()=>openM("note",selJ)} onWA={()=>openM("wa",selJ)} onQ={()=>openM("quote",selJ)} onEdit={()=>openM("edit",selJ)} onDel={()=>{if(window.confirm("Delete?"))delJob(selJ.fbId)}}/>}
          {view==="pipeline"&&<Pipeline jobs={vis} gj={gj} auth={auth}/>}
          {view==="approvals"&&<Approvals jobs={vis} gj={gj} auth={auth} role={role} onAppr={(j,k,v)=>setAppr(j,k,v,auth.name)}/>}
          {view==="factory"&&<Factory jobs={vis} gj={gj}/>}
          {view==="tasks"&&<Tasks jobs={vis} gj={gj} auth={auth}/>}
          {view==="reports"&&<Reports jobs={vis} totR={totR}/>}
          {view==="products"&&<Products/>}
          {view==="users"&&role.canManageUsers&&<UserMgmt users={users} auth={auth} onEdit={u=>openM("editUser",u)} onTog={togUser} onDel={delUser}/>}
        </div>
      </div>
      {modal==="add"&&<JobModal onClose={closeM} onSave={j=>addJob(j,auth.name)}/>}
      {modal==="edit"&&mdata&&<JobModal job={mdata} onClose={closeM} onSave={j=>updJob(mdata.fbId,j)}/>}
      {modal==="note"&&mdata&&<NoteModal onClose={closeM} onSave={t=>addNote(mdata,t,auth.name)}/>}
      {modal==="wa"&&mdata&&<WAModal job={mdata} onClose={closeM}/>}
      {modal==="quote"&&mdata&&<QuoteModal job={mdata} onClose={closeM}/>}
      {modal==="addUser"&&<UserModal onClose={closeM} onSave={addUser}/>}
      {modal==="editUser"&&mdata&&<UserModal user={mdata} onClose={closeM} onSave={d=>updUser(mdata.fbId,d)}/>}
      {toast&&<div className="toast">{toast}</div>}
    </div>
  </>;
}

function LoginScreen({users,jobs,lang,rtl,onLogin,onLang}){
  const [tab,st]=useState("staff");const [u,su]=useState("");const [p,sp]=useState("");const [err,se]=useState("");
  const tryS=()=>{const f=users.find(x=>x.username===u&&x.password===p&&x.active);if(f)onLogin({...f});else se(rtl?"بيانات غير صحيحة":"Invalid credentials");};
  const tryC=()=>{const j=jobs.find(x=>x.customerId===u.trim()&&x.customerPhone===p.trim());if(j)onLogin({id:"c_"+j.fbId,username:u,name:j.name,role:"customer",avatar:j.name.slice(0,2).toUpperCase(),active:true,jobId:j.fbId});else se(rtl?"الرقم الوطني أو الهاتف غير صحيح":"Invalid ID or phone");};
  return(<div className="login-wrap" style={{direction:rtl?"rtl":"ltr"}}>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%,rgba(201,168,76,.06) 0%,transparent 60%)"}}/>
    <div className="login-card">
      <div className="login-logo">✦ NOVAHome</div>
      <div className="login-sub">Kitchen Showroom Management</div>
      <div className="tab-sw">
        <button className={`tab-sw-btn${tab==="staff"?" on":""}`} onClick={()=>{st("staff");se("");su("");sp("");}}>👔 {rtl?"الفريق":"Staff"}</button>
        <button className={`tab-sw-btn${tab==="customer"?" on":""}`} onClick={()=>{st("customer");se("");su("");sp("");}}>🏠 {rtl?"تتبع طلبي":"My Order"}</button>
      </div>
      {err&&<div className="login-err">{err}</div>}
      {tab==="staff"?(<>
        <div className="field" style={{marginBottom:11}}><label>{rtl?"المستخدم":"Username"}</label><input value={u} onChange={e=>{su(e.target.value);se("");}} onKeyDown={e=>e.key==="Enter"&&tryS()} autoFocus/></div>
        <div className="field" style={{marginBottom:16}}><label>{rtl?"كلمة المرور":"Password"}</label><input type="password" value={p} onChange={e=>{sp(e.target.value);se("");}} onKeyDown={e=>e.key==="Enter"&&tryS()}/></div>
        <button className="btn btn-gold" style={{width:"100%",justifyContent:"center",padding:"10px"}} onClick={tryS}>{rtl?"دخول":"Sign In"}</button>
      </>):(<>
        <div style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.2)",borderRadius:8,padding:"10px 13px",marginBottom:14,fontSize:12.5,color:"var(--cr3)",lineHeight:1.7}}>{rtl?"أدخل رقمك الوطني ورقم هاتفك 🏠":"Enter your National ID and phone number 🏠"}</div>
        <div className="field" style={{marginBottom:11}}><label>{rtl?"الرقم الوطني":"National ID"}</label><input value={u} onChange={e=>{su(e.target.value);se("");}} onKeyDown={e=>e.key==="Enter"&&tryC()} autoFocus/></div>
        <div className="field" style={{marginBottom:16}}><label>{rtl?"رقم الهاتف":"Phone"}</label><input value={p} onChange={e=>{sp(e.target.value);se("");}} onKeyDown={e=>e.key==="Enter"&&tryC()} placeholder="+962 79…"/></div>
        <button className="btn btn-gold" style={{width:"100%",justifyContent:"center",padding:"10px"}} onClick={tryC}>{rtl?"عرض مشروعي":"View My Project"}</button>
      </>)}
      <div style={{marginTop:12,display:"flex",justifyContent:"center"}}><button className="btn btn-ghost btn-sm" onClick={onLang}>🌐 {rtl?"English":"عربي"}</button></div>
      {/* APK DOWNLOAD - uncomment to show*/}
      <div style={{marginTop:12,textAlign:"center"}}><a href="/NOVAHome.apk" download style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(77,184,122,.14)",color:"#4db87a",border:"1px solid rgba(77,184,122,.3)",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:500,textDecoration:"none"}}>📱 Download Android App</a></div>
      
    </div>
  </div>);
}

function CustPortal({job,lang,rtl,onLang,onLogout}){
  if(!job) return(<div className="cust-portal" style={{direction:rtl?"rtl":"ltr"}}><div className="cust-card" style={{textAlign:"center",padding:40}}><div style={{fontSize:40,marginBottom:12}}>🏠</div><div style={{fontFamily:"var(--fd)",fontSize:20,color:"var(--cr)",marginBottom:8}}>Project Not Found</div><button className="btn btn-ghost" onClick={onLogout}>← Back</button></div></div>);
  const si=sIdx(job.stageId);const p2=pct(job.completedTasks);
  return(<div className="cust-portal" style={{direction:rtl?"rtl":"ltr"}}>
    <div className="cust-hdr">
      <div style={{fontFamily:"var(--fd)",fontSize:22,color:"var(--gold)"}}>✦ NOVAHome</div>
      <div style={{display:"flex",gap:8}}>
        <button className="btn btn-ghost btn-sm" onClick={onLang}>🌐 {rtl?"English":"عربي"}</button>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>{rtl?"خروج":"Sign Out"}</button>
      </div>
    </div>
    <div className="cust-card">
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
        <div className="av" style={{width:50,height:50,background:"var(--gd)",fontSize:16,color:"#fff"}}>{ini(job.name)}</div>
        <div><div style={{fontFamily:"var(--fd)",fontSize:22,color:"var(--cr)"}}>{rtl?"مرحباً،":"Welcome,"} {job.name.split(" ")[0]}</div><div style={{fontSize:12.5,color:"var(--cr3)",marginTop:2}}>{rtl?"مشروع مطبخك قيد التنفيذ":"Your kitchen project is underway"} ✦</div></div>
      </div>
      <div style={{marginBottom:6,display:"flex",justifyContent:"space-between",fontSize:12.5}}><span style={{color:"var(--cr3)"}}>{rtl?"التقدم الإجمالي":"Overall Progress"}</span><span style={{color:"var(--gold)",fontWeight:700,fontSize:15}}>{p2}%</span></div>
      <div className="big-prog"><div className="big-prog-fill" style={{width:p2+"%"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--cr3)",marginTop:4}}><span>{rtl?"البداية":"Start"}</span><span>🎉 {rtl?"مكتمل":"Complete"}</span></div>
      <div style={{marginTop:16,background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:22}}>{sObj(job.stageId)?.icon}</span>
        <div><div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".08em",color:"var(--gd)",marginBottom:2}}>{rtl?"المرحلة الحالية":"Current Stage"}</div><div style={{fontSize:15,fontWeight:600,color:"var(--gold)"}}>{rtl?sObj(job.stageId)?.cLA:sObj(job.stageId)?.cL}</div></div>
        {job.installDate&&job.stageId==="installation"&&<div style={{marginLeft:"auto",textAlign:"center"}}><div style={{fontSize:10,color:"var(--cr3)"}}>{rtl?"موعد التركيب":"Install Date"}</div><div style={{fontSize:13,fontWeight:600,color:"var(--cr)"}}>{fmtD(job.installDate)}</div></div>}
      </div>
    </div>
    <div className="cust-card">
      <div style={{fontFamily:"var(--fd)",fontSize:17,color:"var(--cr)",marginBottom:16}}>{rtl?"مراحل مشروعك":"Your Project Journey"}</div>
      {STAGES.map((s,i)=>{const done=i<si;const active=i===si;return(
        <div key={s.id} className={`s-row ${done?"done":active?"active":"upcoming"}`}>
          <div className="s-ico">{done?<span style={{fontSize:17,color:"var(--green)"}}>✓</span>:<span style={{fontSize:17}}>{s.icon}</span>}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:done?"var(--green)":active?"var(--gold)":"var(--cr2)"}}>{rtl?s.cLA:s.cL}</div>
            {active&&<div style={{fontSize:11.5,color:"var(--cr3)",marginTop:2}}>{rtl?"هذه هي المرحلة الحالية":"This is where your project currently is"}</div>}
            {done&&<div style={{fontSize:11.5,color:"var(--green)",marginTop:2}}>✓ {rtl?"مكتملة":"Completed"}</div>}
          </div>
          <div>
            {done&&<span className="badge b-green" style={{fontSize:10}}>✓ {rtl?"تم":"Done"}</span>}
            {active&&<span className="badge b-gold" style={{fontSize:10}}>● {rtl?"الآن":"Now"}</span>}
            {!done&&!active&&<span className="badge b-grey" style={{fontSize:10}}>{rtl?"قادم":"Soon"}</span>}
          </div>
        </div>
      );})}
    </div>
    {job.factoryStatus&&<div className="cust-card"><div style={{fontFamily:"var(--fd)",fontSize:17,color:"var(--cr)",marginBottom:12}}>🏭 {rtl?"حالة التصنيع":"Manufacturing Status"}</div><div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(224,92,160,.08)",border:"1px solid rgba(224,92,160,.25)",borderRadius:10,padding:"12px 16px"}}><span style={{fontSize:22}}>🏭</span><div><div style={{fontSize:12,color:"var(--cr3)",marginBottom:3}}>{rtl?"الحالة":"Status"}</div><div style={{fontSize:15,fontWeight:600,color:"var(--pink)"}}>{job.factoryStatus}</div></div></div></div>}
    <div style={{fontSize:12,color:"var(--cr3)",textAlign:"center",padding:"8px 0 24px",lineHeight:1.7}}>{rtl?"للاستفسار تواصل مع فريق NOVAHome 📞":"Questions? Contact the NOVAHome team 📞"}</div>
  </div>);
}

function Dashboard({jobs,totR,pendA,factC,gj,gv,auth,role}){
  const recent=[...jobs].sort((a,b)=>new Date(b.lastActivity)-new Date(a.lastActivity)).slice(0,6);
  const byS=STAGES.filter(s=>s.vTo.includes(auth.role)).map(s=>({...s,cnt:jobs.filter(j=>j.stageId===s.id).length,val:jobs.filter(j=>j.stageId===s.id).reduce((x,j)=>x+(j.budget||0),0)}));
  return(<>
    <div className="stats-row">
      {[{l:"Active Jobs",v:jobs.filter(j=>j.stageId!=="aftersales").length,i:"📋",c:"var(--blue)"},{l:"Revenue",v:fmt(totR),i:"💰",c:"var(--gold)"},...(role.canApprove?[{l:"Approvals",v:pendA,i:"⏳",c:"var(--red)"}]:[]),...(role.canFactory||auth.role==="factory"?[{l:"In Factory",v:factC,i:"🏭",c:"var(--pink)"}]:[]),{l:"Completed",v:jobs.filter(j=>j.stageId==="aftersales").length,i:"⭐",c:"var(--green)"}].map(s=>(
        <div key={s.l} className="stat" style={{"--c":s.c}}><div className="stat-ico">{s.i}</div><div className="stat-lbl">{s.l}</div><div className="stat-val">{s.v}</div></div>
      ))}
    </div>
    <div className="two-col">
      <div style={{display:"flex",flexDirection:"column",gap:13}}>
        <div className="card">
          <div className="card-title">Jobs by Stage</div>
          <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:7,minWidth:Math.max(byS.length*90,400)}}>
            {byS.map(s=>(
              <div key={s.id} style={{flex:1,background:"var(--sf2)",border:"1px solid var(--b)",borderTop:`2px solid ${s.color}`,borderRadius:8,padding:"8px 5px",textAlign:"center",cursor:"pointer",minWidth:0}} onClick={()=>gv("pipeline")}>
                <div style={{fontSize:14}}>{s.icon}</div>
                <div style={{fontSize:9,fontWeight:700,color:s.color,textTransform:"uppercase",margin:"2px 0"}}>{s.en.split(" ")[0]}</div>
                <div style={{fontSize:20,fontFamily:"var(--fd)",color:"var(--cr)"}}>{s.cnt}</div>
                <div style={{fontSize:10,color:"var(--cr3)"}}>{s.cnt>0?fmt(s.val):"—"}</div>
              </div>
            ))}
          </div></div>
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 15px",borderBottom:"1px solid var(--b)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div className="card-title" style={{margin:0}}>Recent Activity</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>gv("jobs")}>View All</button>
          </div>
          <div className="tbl-wrap"><table>
            <thead><tr><th>Customer</th><th>Stage</th><th>Progress</th><th>Budget</th></tr></thead>
            <tbody>{recent.map(j=>{const p2=pct(j.completedTasks);return(<tr key={j.fbId} className="clk" onClick={()=>gj(j.fbId)}>
              <td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="av" style={{width:27,height:27,background:avC(j.fbId),fontSize:9,color:"#fff"}}>{ini(j.name)}</div><div><div className="td-name">{j.name}</div><div className="td-sub">{j.source}</div></div></div></td>
              <td><span className={`badge ${SB[j.stageId]}`}>{sObj(j.stageId)?.icon} {sObj(j.stageId)?.en}</span></td>
              <td><div style={{fontSize:10,color:"var(--cr3)",marginBottom:2}}>{p2}%</div><div className="prog"><div className="prog-fill" style={{width:p2+"%",background:"var(--gold)"}}/></div></td>
              <td style={{color:"var(--gold)",fontWeight:500}}>{fmt(j.budget)}</td>
            </tr>);})}</tbody>
          </table></div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        {pendA>0&&role.canApprove&&(<div className="card" style={{borderColor:"rgba(224,144,58,.3)"}}>
          <div className="card-title" style={{color:"var(--orange)"}}>⏳ Awaiting Approval</div>
          {jobs.filter(j=>j.approvals?.customer_design===null&&j.stageId==="cust_approval").slice(0,3).map(j=>(
            <div key={j.fbId} style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>gj(j.fbId)}>
              <div className="av" style={{width:24,height:24,background:avC(j.fbId),fontSize:8,color:"#fff"}}>{ini(j.name)}</div>
              <div style={{flex:1,fontSize:12.5,color:"var(--cr)"}}>{j.name}</div>
              <span className="badge b-orange" style={{fontSize:10}}>Pending</span>
            </div>
          ))}
        </div>)}
        <div className="card">
          <div className="card-title">Pipeline Health</div>
          {STAGES.filter(s=>s.vTo.includes(auth.role)).slice(0,6).map(s=>{
            const cnt=jobs.filter(j=>j.stageId===s.id).length;
            const mx=Math.max(...STAGES.map(st=>jobs.filter(j=>j.stageId===st.id).length),1);
            return(<div key={s.id} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}><span style={{color:"var(--cr3)"}}>{s.icon} {s.en}</span><span>{cnt}</span></div>
              <div className="prog" style={{height:5}}><div className="prog-fill" style={{width:`${(cnt/mx)*100}%`,background:s.color}}/></div>
            </div>);
          })}
        </div>
      </div>
    </div>
  </>);
}

function JobsTable({jobs,gj,auth,role,onStage}){
  return(<div className="card" style={{padding:0,overflow:"hidden"}}>
    <div className="tbl-wrap"><table>
      <thead><tr><th>Customer</th><th>Stage</th><th>Designer</th><th>Style</th><th>Budget</th><th>Progress</th><th>Last Activity</th>{role.canEdit&&<th></th>}</tr></thead>
      <tbody>
        {jobs.length===0&&<tr><td colSpan={8}><div className="empty"><div className="ei">🔍</div>No jobs found</div></td></tr>}
        {jobs.map(j=>{const p2=pct(j.completedTasks);return(<tr key={j.fbId} className="clk" onClick={()=>gj(j.fbId)}>
          <td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="av" style={{width:27,height:27,background:avC(j.fbId),fontSize:9,color:"#fff"}}>{ini(j.name)}</div><div><div className="td-name">{j.name}</div><div className="td-sub">{j.phone}</div></div></div></td>
          <td><span className={`badge ${SB[j.stageId]}`}>{sObj(j.stageId)?.icon} {sObj(j.stageId)?.en}</span></td>
          <td style={{fontSize:12,color:"var(--cr2)"}}>{j.designer}</td>
          <td style={{fontSize:12}}>{j.style}</td>
          <td style={{color:"var(--gold)",fontWeight:500}}>{fmt(j.budget)}</td>
          <td><div style={{fontSize:10,color:"var(--cr3)",marginBottom:2}}>{p2}%</div><div className="prog"><div className="prog-fill" style={{width:p2+"%",background:"var(--gold)"}}/></div></td>
          <td style={{fontSize:11,color:"var(--cr3)"}}>{fmtD(j.lastActivity)}</td>
          {role.canEdit&&<td onClick={e=>e.stopPropagation()}><select className="btn btn-ghost btn-xs" style={{padding:"3px 6px"}} value={j.stageId} onChange={e=>onStage(j,e.target.value)}>{STAGES.filter(s=>s.vTo.includes(auth.role)).map(s=><option key={s.id} value={s.id}>{s.en}</option>)}</select></td>}
        </tr>);})}</tbody>
    </table></div>
  </div>);
}

function JobDetail({job,auth,role,onAdv,onTogTask,onAppr,onField,onNote,onWA,onQ,onEdit,onDel}){
  const [aS,setAS]=useState(job.stageId);
  useEffect(()=>setAS(job.stageId),[job.stageId,job.fbId]);
  const si=sIdx(job.stageId);const ag=sObj(aS);const canV=ag?.vTo.includes(auth.role);const canE=ag?.eBy.includes(auth.role);
  const vis=STAGES.filter(s=>s.vTo.includes(auth.role));const av=avC(job.fbId);
  return(<div>
    <div className="st-track" style={{marginBottom:13}}>
      {vis.map(s=>{const gi=sIdx(s.id);const done=gi<si;const act=s.id===job.stageId;const view2=s.id===aS;return(
        <div key={s.id} className="st-step" style={{background:done?"rgba(77,184,122,.1)":act?`${s.color}20`:"var(--sf2)",color:done?"var(--green)":act?s.color:"var(--cr3)",borderTop:view2?`2px solid var(--gold)`:done?`1px solid var(--green)`:act?`1px solid ${s.color}`:"none"}} onClick={()=>setAS(s.id)}>
          <span className="st-step-ico">{done?"✓":s.icon}</span>
          <span style={{fontSize:8,display:"block",lineHeight:1.2}}>{s.en.split(" ")[0]}</span>
        </div>);
      })}
    </div>
    <div className="jlayout">
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <div className="spanel">
          <div className="spanel-hd" style={{borderLeft:`3px solid ${ag?.color}`}}>
            <span style={{fontSize:20}}>{ag?.icon}</span>
            <div style={{flex:1}}><div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--cr)"}}>{ag?.en}</div><div style={{fontSize:11.5,color:"var(--cr3)"}}>{canE?"You can edit this stage":"View only"}</div></div>
            {aS===job.stageId&&<span className="badge b-gold" style={{fontSize:10}}>Current</span>}
          </div>
          <div className="spanel-bd">
            {!canV?(<div style={{background:"rgba(42,38,30,.4)",borderRadius:8,padding:14,textAlign:"center",fontSize:12.5,color:"var(--cr3)"}}>🔒 No access to this stage</div>):(<>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".09em",color:"var(--cr3)",marginBottom:7}}>Checklist</div>
              <div className="chklist">
                {ag?.tE.map((t,i)=>{const done=i<(job.completedTasks[aS]||0);return(
                  <div key={i} className={`ch-item${done?" done":""}`} onClick={()=>canE&&onTogTask(aS,i)}>
                    <div className="ch-box">{done?"✓":""}</div>
                    <span className="ch-lbl">{t}</span>
                    {!canE&&<span style={{fontSize:10,color:"var(--cr3)"}}>🔒</span>}
                  </div>);
                })}
              </div>
              {canE&&<SFields type={aS} job={job} onField={onField} onAppr={onAppr} role={role}/>}
              {!canE&&<div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",borderRadius:8,padding:"10px 12px",fontSize:12.5,color:"var(--cr3)"}}>👁 View only — {ROLES[auth.role].label} cannot edit this stage</div>}
              {aS===job.stageId&&si<STAGE_IDS.length-1&&role.canEdit&&(<button className="btn btn-gold" style={{marginTop:12,width:"100%",justifyContent:"center"}} onClick={onAdv}>Advance to {sObj(STAGE_IDS[si+1])?.en} →</button>)}
            </>)}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <a href={`tel:${job.phone}`} className="btn btn-ghost btn-sm">📞 Call</a>
          <button className="btn btn-wa btn-sm" onClick={onWA}>💬 WhatsApp</button>
          {role.canEdit&&<button className="btn btn-blue btn-sm" onClick={onQ}>📄 Quote</button>}
          {role.canDelete&&<button className="btn btn-red btn-sm" style={{marginLeft:"auto"}} onClick={onDel}>Delete</button>}
        </div>
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div className="card-title" style={{margin:0}}>Activity Log</div>
            <button className="btn btn-ghost btn-sm" onClick={onNote}>+ Note</button>
          </div>
          <div className="act-log">
            {(job.activityLog||[]).length===0&&<div className="empty"><div className="ei">📋</div>No activity yet</div>}
            {(job.activityLog||[]).map(a=>(<div key={a.id} className="act-item"><div className="act-dot"/><div><div className="act-txt">{a.text}</div><div className="act-meta">{a.user} · {fmtD(a.date)}</div></div></div>))}
          </div>
        </div>
      </div>
      <div className="cside">
        <div className="iblk">
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:11}}>
            <div className="av" style={{width:40,height:40,background:av,fontSize:12,color:"#fff"}}>{ini(job.name)}</div>
            <div><div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--cr)"}}>{job.name}</div><span className={`badge ${SB[job.stageId]}`}>{sObj(job.stageId)?.icon} {sObj(job.stageId)?.en}</span></div>
          </div>
          <div className="ittl">Contact</div>
          {[{k:"Phone",v:job.phone},{k:"Email",v:job.email||"—"},{k:"Address",v:job.address||"—"}].map(r=>(<div key={r.k} className="irow"><span className="ikey">{r.k}</span><span className="ival">{r.v}</span></div>))}
        </div>
        <div className="iblk">
          <div className="ittl">Project</div>
          {[{k:"Style",v:job.style},{k:"Source",v:job.source},{k:"Designer",v:job.designer},{k:"Budget",v:<span className="gval">{fmt(job.budget)}</span>},...(job.finalQuote?[{k:"Final Quote",v:<span className="gval">{fmt(job.finalQuote)}</span>}]:[]),...(job.deposit?[{k:"Deposit",v:<span style={{color:"var(--green)"}}>{fmt(job.deposit)}</span>}]:[])].map((r,i)=>(<div key={i} className="irow"><span className="ikey">{r.k}</span><span className="ival">{r.v}</span></div>))}
        </div>
        {(job.customerId||job.customerPhone)&&(<div className="iblk" style={{borderColor:"rgba(201,168,76,.25)"}}>
          <div className="ittl">🏠 Customer Portal</div>
          {job.customerId&&<div className="irow"><span className="ikey">National ID</span><span className="ival" style={{color:"var(--gold)",fontFamily:"monospace"}}>{job.customerId}</span></div>}
          {job.customerPhone&&<div className="irow"><span className="ikey">Phone</span><span className="ival" style={{color:"var(--gold)"}}>{job.customerPhone}</span></div>}
        </div>)}
        {(job.quoteNo||job.contractNo||job.factoryOrderNo)&&(<div className="iblk">
          <div className="ittl">References</div>
          {job.quoteNo&&<div className="irow"><span className="ikey">Quote</span><span className="ival" style={{color:"var(--gold)"}}>{job.quoteNo}</span></div>}
          {job.contractNo&&<div className="irow"><span className="ikey">Contract</span><span className="ival" style={{color:"var(--green)"}}>{job.contractNo}</span></div>}
          {job.factoryOrderNo&&<div className="irow"><span className="ikey">Factory Order</span><span className="ival" style={{color:"var(--pink)"}}>{job.factoryOrderNo}</span></div>}
        </div>)}
        <div className="iblk">
          <div className="ittl">Approvals</div>
          {[{k:"customer_design",l:"Customer — Design"},{k:"management_design",l:"Mgmt — Design"},{k:"customer_budget",l:"Customer — Budget"},{k:"management_budget",l:"Mgmt — Budget"}].map(a=>{const v=job.approvals?.[a.k];return(<div key={a.k} className="irow"><span className="ikey" style={{fontSize:11}}>{a.l}</span><span className={`badge ${v==="approved"?"b-green":v==="revision"?"b-red":"b-grey"}`} style={{fontSize:10}}>{v==="approved"?"✓ Approved":v==="revision"?"⟳ Revision":"Pending"}</span></div>);})}
          <div className="irow"><span className="ikey" style={{fontSize:11}}>Contract Signed</span><span className={`badge ${job.approvals?.contract_signed?"b-green":"b-grey"}`} style={{fontSize:10}}>{job.approvals?.contract_signed?"✓ Signed":"Pending"}</span></div>
          <div className="irow"><span className="ikey" style={{fontSize:11}}>Deposit Received</span><span className={`badge ${job.approvals?.deposit_received?"b-green":"b-grey"}`} style={{fontSize:10}}>{job.approvals?.deposit_received?"✓ Received":"Pending"}</span></div>
        </div>
        {job.notes&&<div className="iblk"><div className="ittl">Notes</div><div style={{fontSize:12.5,color:"var(--cr3)",lineHeight:1.6}}>{job.notes}</div></div>}
        {role.canEdit&&<button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={onEdit}>✏ Edit Job</button>}
      </div>
    </div>
  </div>);
}

function IFld({label,value,field,onSave,type="text",placeholder,options}){
  const [v,sv]=useState(value||"");
  useEffect(()=>sv(value||""),[value]);
  return(<div style={{marginBottom:8}}>
    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".08em",color:"var(--cr3)",marginBottom:3}}>{label}</div>
    <div className="inf">
      {options?<select value={v} onChange={e=>sv(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select>:<input type={type} value={v} onChange={e=>sv(e.target.value)} placeholder={placeholder}/>}
      <button className="btn btn-ghost btn-sm" onClick={()=>onSave(field,type==="number"?Number(v):v)}>✓</button>
    </div>
  </div>);
}

function ApFld({aKey,label,job,onAppr,role}){
  const val=job.approvals?.[aKey];const canA=aKey.includes("management")?role.canApprove:(role.canEdit||role.canApprove);
  return(<div style={{marginTop:8}}>
    <div className={`aprc${val==="approved"?" approved":val==="revision"?" revision":""}`}>
      <div className="aprc-lbl">{label}</div>
      <div className="aprc-st" style={{color:val==="approved"?"var(--green)":val==="revision"?"var(--red)":"var(--cr3)"}}>{val==="approved"?"✓ Approved":val==="revision"?"⟳ Revision":"Pending"}</div>
      {canA&&<div className="aprc-btns"><button className="btn btn-green btn-xs" onClick={()=>onAppr(aKey,"approved")}>✓ Approve</button><button className="btn btn-red btn-xs" onClick={()=>onAppr(aKey,"revision")}>⟳ Revision</button></div>}
      {!canA&&<div style={{fontSize:11,color:"var(--cr3)",marginTop:4}}>🔒 Only {aKey.includes("management")?"Management":"authorized"} can approve</div>}
    </div>
  </div>);
}

function SFields({type,job,onField,onAppr,role}){
  return(<div style={{marginTop:11,paddingTop:11,borderTop:"1px solid var(--b)"}}>
    {type==="measurement"&&<><IFld label="Measurement Date" value={job.measureDate} field="measureDate" onSave={onField} type="date"/><IFld label="Room Dimensions" value={job.measureNotes} field="measureNotes" onSave={onField} placeholder="4.2m x 3.8m…"/></>}
    {type==="design"&&<IFld label="Design File" value={job.designFile} field="designFile" onSave={onField} placeholder="KIT-2026-XXX.pdf"/>}
    {type==="cust_approval"&&<ApFld aKey="customer_design" label="Customer Design Approval" job={job} onAppr={onAppr} role={role}/>}
    {type==="mgmt_approval"&&<ApFld aKey="management_design" label="Management Design Approval" job={job} onAppr={onAppr} role={role}/>}
    {type==="budget"&&<><IFld label="Quote Number" value={job.quoteNo} field="quoteNo" onSave={onField} placeholder="Q-2026-XXX"/><IFld label="Final Quote (JD)" value={job.finalQuote} field="finalQuote" onSave={onField} type="number"/><ApFld aKey="customer_budget" label="Customer Budget Approval" job={job} onAppr={onAppr} role={role}/></>}
    {type==="contract"&&<>
      <IFld label="Contract Number" value={job.contractNo} field="contractNo" onSave={onField} placeholder="C-2026-XXX"/>
      <IFld label="Deposit Amount (JD)" value={job.deposit} field="deposit" onSave={onField} type="number"/>
      <div style={{display:"flex",gap:7,marginTop:6,flexWrap:"wrap"}}>
        <button className={`btn btn-sm ${job.approvals?.contract_signed?"btn-green":"btn-ghost"}`} onClick={()=>onAppr("contract_signed",!job.approvals?.contract_signed)}>{job.approvals?.contract_signed?"✓ Signed":"Mark Signed"}</button>
        <button className={`btn btn-sm ${job.approvals?.deposit_received?"btn-green":"btn-ghost"}`} onClick={()=>onAppr("deposit_received",!job.approvals?.deposit_received)}>{job.approvals?.deposit_received?"✓ Deposit":"Mark Deposit"}</button>
      </div>
    </>}
    {type==="factory"&&(role.canFactory||role.canEdit)&&<><IFld label="Factory Order No." value={job.factoryOrderNo} field="factoryOrderNo" onSave={onField} placeholder="FAC-2026-XXX"/><IFld label="Production Status" value={job.factoryStatus||"Order Sent"} field="factoryStatus" onSave={onField} options={FACTORY_STATUSES}/></>}
    {type==="installation"&&<IFld label="Installation Date" value={job.installDate} field="installDate" onSave={onField} type="date"/>}
    {type==="aftersales"&&<IFld label="Warranty (Months)" value={job.warrantyMonths||24} field="warrantyMonths" onSave={onField} options={["12","18","24","36","48","60"]}/>}
  </div>);
}

function Pipeline({jobs,gj,auth}){
  const vs=STAGES.filter(s=>s.vTo.includes(auth.role));
  return(<div className="kn-wrap"><div className="kn" style={{gridTemplateColumns:`repeat(${vs.length},minmax(155px,1fr))`,minWidth:vs.length*165}}>
    {vs.map(s=>{const sj=jobs.filter(j=>j.stageId===s.id);return(
      <div key={s.id} className="kn-col">
        <div className="kn-hd" style={{borderTop:`2px solid ${s.color}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div className="kn-title" style={{color:s.color}}>{s.icon} {s.en}</div><span className="kn-cnt">{sj.length}</span></div>
          <div style={{fontSize:10,color:"var(--cr3)",marginTop:2}}>{sj.length>0?fmt(sj.reduce((x,j)=>x+(j.budget||0),0)):"—"}</div>
        </div>
        <div className="kn-cards">
          {sj.map(j=>(<div key={j.fbId} className="k-card" onClick={()=>gj(j.fbId)}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><div className="av" style={{width:18,height:18,background:avC(j.fbId),fontSize:7,color:"#fff"}}>{ini(j.name)}</div><div style={{fontSize:12.5,fontWeight:500,color:"var(--cr)"}}>{j.name}</div></div>
            <div style={{fontSize:12,color:"var(--gold)"}}>{fmt(j.budget)}</div>
            <div style={{fontSize:10.5,color:"var(--cr3)",marginTop:2}}>{j.style}</div>
            <div className="prog" style={{marginTop:5}}><div className="prog-fill" style={{width:pct(j.completedTasks)+"%",background:s.color}}/></div>
          </div>))}
          {sj.length===0&&<div style={{fontSize:11,color:"var(--cr3)",textAlign:"center",padding:"10px 0"}}>—</div>}
        </div>
      </div>);
    })}
  </div></div>);
}

function Approvals({jobs,gj,auth,role,onAppr}){
  const p=jobs.filter(j=>j.approvals&&(j.approvals.customer_design===null||j.approvals.management_design===null||j.approvals.customer_budget===null));
  if(!p.length) return <div className="empty" style={{marginTop:40}}><div className="ei">✅</div>All approvals up to date</div>;
  return(<div style={{display:"flex",flexDirection:"column",gap:11}}>
    {p.map(j=>(<div key={j.fbId} className="card">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div className="av" style={{width:34,height:34,background:avC(j.fbId),fontSize:11,color:"#fff"}}>{ini(j.name)}</div>
        <div style={{flex:1}}><div style={{fontFamily:"var(--fd)",fontSize:15,color:"var(--cr)"}}>{j.name}</div><span className={`badge ${SB[j.stageId]}`}>{sObj(j.stageId)?.icon} {sObj(j.stageId)?.en}</span></div>
        <button className="btn btn-ghost btn-sm" onClick={()=>gj(j.fbId)}>Open →</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7}}>
        {[{k:"customer_design",l:"Customer Design"},{k:"management_design",l:"Mgmt Design"},{k:"customer_budget",l:"Customer Budget"},{k:"management_budget",l:"Mgmt Budget"}].map(a=>{
          const val=j.approvals?.[a.k];const canA=a.k.includes("management")?role.canApprove:(role.canEdit||role.canApprove);
          return(<div key={a.k} className={`aprc${val==="approved"?" approved":val==="revision"?" revision":""}`}>
            <div className="aprc-lbl">{a.l}</div>
            <div className="aprc-st" style={{fontSize:12,color:val==="approved"?"var(--green)":val==="revision"?"var(--red)":"var(--cr3)"}}>{val==="approved"?"✓":val==="revision"?"⟳":"—"}</div>
            {canA&&<div className="aprc-btns"><button className="btn btn-green btn-xs" onClick={()=>onAppr(j,a.k,"approved")}>✓</button><button className="btn btn-red btn-xs" onClick={()=>onAppr(j,a.k,"revision")}>⟳</button></div>}
          </div>);
        })}
      </div>
    </div>))}
  </div>);
}

function Factory({jobs,gj}){
  const fj=jobs.filter(j=>j.stageId==="factory"||j.factoryOrderNo);
  const SC={"Order Sent":"var(--blue)","Confirmed":"var(--gold)","In Production":"var(--pink)","QC Check":"var(--orange)","Ready for Delivery":"var(--purple)","Delivered":"var(--green)"};
  return(<div className="card" style={{padding:0,overflow:"hidden"}}>
    <div style={{padding:"12px 15px",borderBottom:"1px solid var(--b)"}}><div className="card-title" style={{margin:0}}>Production Tracker</div></div>
    <div className="tbl-wrap"><table>
      <thead><tr><th>Customer</th><th>Factory Order</th><th>Status</th><th>Quote</th><th>Install Date</th><th>Designer</th></tr></thead>
      <tbody>
        {fj.length===0&&<tr><td colSpan={6}><div className="empty"><div className="ei">🏭</div>No factory orders</div></td></tr>}
        {fj.map(j=>(<tr key={j.fbId} className="clk" onClick={()=>gj(j.fbId)}>
          <td><div className="td-name">{j.name}</div><div className="td-sub">{j.style}</div></td>
          <td style={{color:"var(--pink)",fontWeight:500}}>{j.factoryOrderNo||"—"}</td>
          <td>{j.factoryStatus?<span className="badge" style={{background:`${SC[j.factoryStatus]||"#888"}22`,color:SC[j.factoryStatus]||"var(--cr3)"}}>{j.factoryStatus}</span>:<span className="badge b-grey">—</span>}</td>
          <td style={{color:"var(--gold)"}}>{fmt(j.finalQuote||j.budget)}</td>
          <td style={{fontSize:11,color:"var(--cr3)"}}>{fmtD(j.installDate)}</td>
          <td style={{fontSize:12,color:"var(--cr2)"}}>{j.designer}</td>
        </tr>))}
      </tbody>
    </table></div>
  </div>);
}

function Tasks({jobs,gj,auth}){
  const vs=STAGES.filter(s=>s.vTo.includes(auth.role)&&s.id!=="aftersales");
  const act=jobs.filter(j=>j.stageId!=="aftersales");
  return(<div style={{display:"flex",flexDirection:"column",gap:11}}>
    {vs.map(s=>{const sj=act.filter(j=>j.stageId===s.id);if(!sj.length)return null;return(
      <div key={s.id} className="card">
        <div className="card-title" style={{color:s.color}}>{s.icon} {s.en} <span style={{fontSize:12,color:"var(--cr3)",fontFamily:"var(--fb)",fontWeight:400}}>({sj.length})</span></div>
        {sj.map(j=>(<div key={j.fbId} style={{background:"var(--sf2)",border:"1px solid var(--b)",borderRadius:8,padding:"8px 11px",marginBottom:7,cursor:"pointer"}} onClick={()=>gj(j.fbId)}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><div className="av" style={{width:22,height:22,background:avC(j.fbId),fontSize:7,color:"#fff"}}>{ini(j.name)}</div><span style={{fontWeight:500,color:"var(--cr)",fontSize:13}}>{j.name}</span><span style={{fontSize:11,color:"var(--cr3)",marginLeft:4}}>{j.designer}</span><span style={{marginLeft:"auto",color:"var(--gold)",fontSize:12}}>{fmt(j.budget)}</span></div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{s.tE.map((t,i)=>{const done=i<(j.completedTasks[s.id]||0);return<span key={i} className={`badge ${done?"b-green":"b-grey"}`} style={{fontSize:10}}>{done?"✓ ":""}{t}</span>;})}</div>
          <div className="prog" style={{marginTop:6}}><div className="prog-fill" style={{width:`${((j.completedTasks[s.id]||0)/s.tE.length)*100}%`,background:s.color}}/></div>
        </div>))}
      </div>);
    })}
  </div>);
}

function Reports({jobs,totR}){
  const con=jobs.filter(j=>["contract","factory","installation","aftersales"].includes(j.stageId));
  const bySrc=SOURCES.map(s=>({s,c:jobs.filter(j=>j.source===s).length})).filter(x=>x.c>0).sort((a,b)=>b.c-a.c);
  const mx=Math.max(...bySrc.map(x=>x.c),1);
  const byD=DESIGNERS_LIST.map(d=>({d,l:jobs.filter(j=>j.designer===d).length,r:jobs.filter(j=>j.designer===d&&["contract","factory","installation","aftersales"].includes(j.stageId)).reduce((x,j)=>x+(j.finalQuote||j.budget||0),0)}));
  return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
    <div className="card"><div className="card-title">Revenue Summary</div>{[{l:"Total Revenue",v:fmt(totR),c:"var(--gold)"},{l:"Pipeline Value",v:fmt(jobs.reduce((s,j)=>s+(j.budget||0),0)),c:"var(--blue)"},{l:"Avg Deal",v:fmt(Math.round(totR/(con.length||1))),c:"var(--cr)"},{l:"Contracts Signed",v:con.length,c:"var(--green)"},{l:"Total Jobs",v:jobs.length,c:"var(--cr)"},{l:"Completed",v:jobs.filter(j=>j.stageId==="aftersales").length,c:"var(--green)"}].map(r=>(<div key={r.l} className="irow"><span className="ikey">{r.l}</span><span style={{color:r.c,fontWeight:600}}>{r.v}</span></div>))}</div>
    <div className="card"><div className="card-title">Lead Sources</div>{bySrc.map(x=>(<div key={x.s} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"var(--cr3)"}}>{x.s}</span><span>{x.c}</span></div><div className="prog" style={{height:5}}><div className="prog-fill" style={{width:`${(x.c/mx)*100}%`}}/></div></div>))}</div>
    <div className="card"><div className="card-title">Designer Performance</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}><thead><tr>{["Designer","Jobs","Revenue"].map(h=><th key={h} style={{padding:"5px 0",fontSize:10,textAlign:h==="Revenue"?"right":"left",color:"var(--gd)",fontWeight:500}}>{h}</th>)}</tr></thead><tbody>{byD.map(x=>(<tr key={x.d}><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--cr)"}}>{x.d}</td><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--cr3)"}}>{x.l}</td><td style={{padding:"7px 0",borderBottom:"1px solid rgba(42,38,30,.4)",color:"var(--gold)",fontWeight:600,textAlign:"right"}}>{fmt(x.r)}</td></tr>))}</tbody></table></div>
    <div className="card"><div className="card-title">Popular Styles</div>{STYLES.map((s,i)=>{const c=jobs.filter(j=>j.style===s).length;if(!c)return null;return(<div key={s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(42,38,30,.4)"}}><div style={{width:18,height:18,background:`rgba(201,168,76,${.15+i*.03})`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"var(--gold)",fontWeight:700}}>{i+1}</div><div style={{flex:1,fontSize:12.5,color:"var(--cr)"}}>{s}</div><div style={{fontSize:12,color:"var(--cr3)"}}>{c}</div><div className="prog" style={{width:70,height:4}}><div className="prog-fill" style={{width:`${(c/jobs.length)*100}%`}}/></div></div>);})}</div>
  </div>);
}

const PRODS=[{id:1,name:"Modern Island Unit",style:"Modern",price:4200,sku:"MOD-ISL-001",desc:"Large central island"},{id:2,name:"Classic White Lacquer",style:"Classic",price:8500,sku:"CLS-WHT-002",desc:"Full set, high-gloss"},{id:3,name:"Marble Countertop /m²",style:"All",price:380,sku:"CTR-MRB-003",desc:"Carrara marble, custom cut"},{id:4,name:"Smart Appliance Pack",style:"Modern",price:6200,sku:"SMA-APP-004",desc:"Oven, hob, dishwasher, fridge"},{id:5,name:"Rustic Solid Oak",style:"Rustic",price:3100,sku:"RST-OAK-005",desc:"Solid oak, aged finish"},{id:6,name:"Industrial Black Range",style:"Industrial",price:5400,sku:"IND-BLK-006",desc:"Matte black, open shelving"},{id:7,name:"Minimalist Handle-less",style:"Minimalist",price:9800,sku:"MIN-HLS-007",desc:"Push-to-open"},{id:8,name:"Wall Cabinet Set",style:"All",price:2200,sku:"WLL-CAB-008",desc:"Multiple finishes"}];
const EMJ={Modern:"🏙️",Classic:"🏛️",Contemporary:"◼",Rustic:"🌿",Industrial:"⚙️",Minimalist:"□",Traditional:"🪵",Bespoke:"✦",All:"🍳"};
function Products(){
  const [f,sf]=useState("All");const sh=f==="All"?PRODS:PRODS.filter(p=>p.style===f||p.style==="All");
  return(<><div style={{display:"flex",gap:6,marginBottom:13,flexWrap:"wrap"}}>{["All",...STYLES].map(s=><button key={s} className={`btn ${f===s?"btn-gold":"btn-ghost"} btn-sm`} onClick={()=>sf(s)}>{s}</button>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11}}>{sh.map(p=>(<div key={p.id} className="card" style={{padding:13}}><div style={{background:"var(--sf2)",borderRadius:8,height:72,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:9}}>{EMJ[p.style]||"🍳"}</div><div style={{fontSize:9.5,color:"var(--cr3)",marginBottom:3}}>{p.sku}</div><div style={{fontFamily:"var(--fd)",fontSize:13.5,color:"var(--cr)",marginBottom:5}}>{p.name}</div><div style={{fontSize:11.5,color:"var(--cr3)",marginBottom:9}}>{p.desc}</div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{color:"var(--gold)",fontWeight:600}}>{fmt(p.price)}</span><button className="btn btn-ghost btn-xs">+ Add</button></div></div>))}</div>
  </>);
}

function UserMgmt({users,auth,onEdit,onTog,onDel}){
  const byR=Object.keys(ROLES).filter(r=>r!=="customer").map(r=>({role:r,users:users.filter(u=>u.role===r)}));
  return(<div>
    {byR.filter(g=>g.users.length>0).map(g=>(<div key={g.role} style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{width:10,height:10,borderRadius:"50%",background:RC[g.role]}}/><div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--cr)"}}>{ROLES[g.role].label}</div><div style={{fontSize:11.5,color:"var(--cr3)"}}>{ROLES[g.role].desc}</div><div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap"}}>{ROLES[g.role].nav.map(n=><span key={n} className="badge b-grey" style={{fontSize:10}}>{n}</span>)}</div></div>
      <div className="ugrid">{g.users.map(u=>(<div key={u.fbId} className={`ucard${u.active?"":" inactive"}`}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><div className="av" style={{width:38,height:38,background:RC[u.role]||"#555",fontSize:13,color:"#fff"}}>{u.avatar}</div><div><div style={{fontWeight:600,color:"var(--cr)",fontSize:13}}>{u.name}</div><div style={{fontSize:11,color:"var(--cr3)"}}>@{u.username}</div></div>
          {u.fbId!=="u1"&&auth.fbId!==u.fbId&&(<div className="ucard-acts"><button className="btn btn-ghost btn-xs" onClick={()=>onEdit(u)}>✏</button><button className={`btn btn-xs ${u.active?"btn-red":"btn-green"}`} onClick={()=>onTog(u)}>{u.active?"Disable":"Enable"}</button></div>)}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span className={`badge ${u.active?"b-green":"b-grey"}`} style={{fontSize:10}}>{u.active?"● Active":"○ Inactive"}</span>{u.fbId!=="u1"&&auth.fbId!==u.fbId&&<button className="btn btn-red btn-xs" onClick={()=>{if(window.confirm(`Remove ${u.name}?`))onDel(u.fbId)}}>Remove</button>}</div>
      </div>))}</div>
    </div>))}
    <div className="card" style={{borderColor:"rgba(201,168,76,.3)",background:"rgba(201,168,76,.04)"}}><div className="card-title" style={{color:"var(--gold)"}}>🏠 Customer Portal</div><div style={{fontSize:12.5,color:"var(--cr3)",lineHeight:1.8}}>Customers log in with <strong style={{color:"var(--cr)"}}>National ID</strong> + <strong style={{color:"var(--cr)"}}>phone</strong>. Set these in each job's Customer Portal section.</div></div>
  </div>);
}

function UserModal({user,onClose,onSave}){
  const [f,sf]=useState(user||{name:"",username:"",password:"",role:"sales",avatar:""});const s=(k,v)=>sf(x=>({...x,[k]:v}));
  return(<div className="ov" onClick={onClose}><div className="modal" style={{width:440}} onClick={e=>e.stopPropagation()}>
    <div className="modal-title">{user?"Edit User":"Add New User"}</div>
    <div className="fg">
      <div className="field"><label>Full Name *</label><input value={f.name} onChange={e=>s("name",e.target.value)}/></div>
      <div className="field"><label>Username *</label><input value={f.username} onChange={e=>s("username",e.target.value)}/></div>
      <div className="field"><label>Password *</label><input value={f.password} onChange={e=>s("password",e.target.value)}/></div>
      <div className="field"><label>Role</label><select value={f.role} onChange={e=>s("role",e.target.value)}>{Object.entries(ROLES).filter(([k])=>k!=="customer").map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
      <div className="field fg-full"><label>Avatar (2 letters)</label><input value={f.avatar} onChange={e=>s("avatar",e.target.value.slice(0,2).toUpperCase())} maxLength={2}/></div>
    </div>
    {f.role&&<div style={{marginTop:12,background:"var(--sf2)",border:"1px solid var(--b)",borderRadius:8,padding:"11px 13px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".09em",color:"var(--gd)",marginBottom:8}}>Access:</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{ROLES[f.role]?.nav.map(n=><span key={n} className="badge b-gold" style={{fontSize:10}}>{n}</span>)}</div></div>}
    <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-gold" onClick={()=>{if(!f.name||!f.username||!f.password){alert("Required fields missing");return;}if(!f.avatar)f.avatar=f.name.slice(0,2).toUpperCase();onSave(f);}}>{user?"Save":"Add User"}</button></div>
  </div></div>);
}

function JobModal({job,onClose,onSave}){
  const [f,sf]=useState(job||{name:"",phone:"",email:"",address:"",source:"Walk-In",style:"Modern",budget:"",priority:"Medium",designer:DESIGNERS_LIST[0],notes:"",customerId:"",customerPhone:""});
  const s=(k,v)=>sf(x=>({...x,[k]:v}));
  return(<div className="ov" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <div className="modal-title">{job?"Edit Job":"New Kitchen Job"}</div>
    <div className="fg">
      <div className="field"><label>Full Name *</label><input value={f.name} onChange={e=>s("name",e.target.value)}/></div>
      <div className="field"><label>Phone *</label><input value={f.phone} onChange={e=>s("phone",e.target.value)} placeholder="+962 79…"/></div>
      <div className="field"><label>Email</label><input value={f.email||""} onChange={e=>s("email",e.target.value)}/></div>
      <div className="field"><label>Address</label><input value={f.address||""} onChange={e=>s("address",e.target.value)}/></div>
      <div className="field"><label>Source</label><select value={f.source} onChange={e=>s("source",e.target.value)}>{SOURCES.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="field"><label>Kitchen Style</label><select value={f.style} onChange={e=>s("style",e.target.value)}>{STYLES.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="field"><label>Budget (JD)</label><input type="number" value={f.budget} onChange={e=>s("budget",Number(e.target.value))} placeholder="15000"/></div>
      <div className="field"><label>Priority</label><select value={f.priority} onChange={e=>s("priority",e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></div>
      <div className="field fg-full"><label>Designer</label><select value={f.designer} onChange={e=>s("designer",e.target.value)}>{DESIGNERS_LIST.map(x=><option key={x}>{x}</option>)}</select></div>
      <div style={{gridColumn:"1/-1",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",borderRadius:8,padding:"11px 13px"}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".09em",color:"var(--gd)",marginBottom:10}}>🏠 Customer Portal Login</div>
        <div className="fg"><div className="field"><label>National ID</label><input value={f.customerId||""} onChange={e=>s("customerId",e.target.value)} placeholder="e.g. 9876543210"/></div><div className="field"><label>Phone (for login)</label><input value={f.customerPhone||""} onChange={e=>s("customerPhone",e.target.value)} placeholder="+962 79…"/></div></div>
      </div>
      <div className="field fg-full"><label>Notes</label><textarea value={f.notes||""} onChange={e=>s("notes",e.target.value)}/></div>
    </div>
    <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-gold" onClick={()=>{if(!f.name||!f.phone){alert("Name and phone required");return;}onSave(f);}}>{job?"Save":"Create Job"}</button></div>
  </div></div>);
}

function NoteModal({onClose,onSave}){
  const [t,st]=useState("");
  return(<div className="ov" onClick={onClose}><div className="modal" style={{width:420}} onClick={e=>e.stopPropagation()}>
    <div className="modal-title">+ Add Note</div>
    <div className="field"><label>Note</label><textarea value={t} onChange={e=>st(e.target.value)} placeholder="e.g. Called customer…" style={{minHeight:90}}/></div>
    <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-gold" onClick={()=>{if(!t.trim())return;onSave(t.trim());}}>Save Note</button></div>
  </div></div>);
}

const WA={contact:n=>`Hello ${n}, thank you for contacting NOVAHome! We'd love to help design your dream kitchen. 🍳`,measurement:n=>`Hello ${n}, confirming your measurement visit — is the time still convenient?`,design:n=>`Hello ${n}, your kitchen design is ready! We're excited to share it with you. ✏️`,budget:n=>`Hello ${n}, your kitchen quotation has been sent. Please review and let us know your thoughts.`,contract:n=>`Hello ${n}, congratulations! Contract signed and your project is now underway. 🎉`,factory:n=>`Hello ${n}, your kitchen is now in production. We'll keep you updated. 🏭`,installation:n=>`Hello ${n}, your kitchen is ready for installation! Our team will be there at the scheduled time. 🔧`,aftersales:n=>`Hello ${n}, we hope you're enjoying your new NOVAHome kitchen! Any feedback? ⭐`};
function WAModal({job,onClose}){
  const msg=(WA[job.stageId]||WA.contact)(job.name);const ph=job.phone.replace(/\D/g,"");
  return(<div className="ov" onClick={onClose}><div className="modal" style={{width:440}} onClick={e=>e.stopPropagation()}>
    <div className="modal-title">💬 WhatsApp — {job.name}</div>
    <div style={{fontSize:12.5,color:"var(--cr3)",marginBottom:6}}>To: <strong style={{color:"var(--cr)"}}>{job.phone}</strong></div>
    <div className="wa-prev">{msg}</div>
    <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><a href={`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="btn btn-wa" style={{textDecoration:"none"}} onClick={onClose}>💬 Open WhatsApp</a></div>
  </div></div>);
}

function QuoteModal({job,onClose}){
  const td=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
  const base=job.finalQuote||job.budget||0;
  const [items,si]=useState([{id:1,desc:"Base & Wall Cabinets",qty:1,unit:"set",price:Math.round(base*.35)},{id:2,desc:"Worktop & Splashback",qty:1,unit:"set",price:Math.round(base*.20)},{id:3,desc:"Appliances",qty:1,unit:"set",price:Math.round(base*.25)},{id:4,desc:"Hardware & Accessories",qty:1,unit:"set",price:Math.round(base*.10)},{id:5,desc:"Installation & Labour",qty:1,unit:"service",price:Math.round(base*.10)}]);
  const tot=items.reduce((s,it)=>s+(it.qty||0)*(it.price||0),0);
  const upd=(id,field,val)=>si(its=>its.map(it=>it.id===id?{...it,[field]:field==="qty"||field==="price"?Number(val):val}:it));
  const print=()=>{const el=document.getElementById("qp");if(!el)return;const w=window.open("","_blank","width=800,height=900");w.document.write(`<html><head><title>Quote</title><style>@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@400;500;600&display=swap');*{box-sizing:border-box}body{margin:20px;background:#fff;font-family:'Outfit',sans-serif}</style></head><body>`);w.document.write(el.innerHTML);w.document.write("</body></html>");w.document.close();setTimeout(()=>w.print(),800);};
  return(<div className="ov" onClick={onClose}><div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
    <div className="modal-title">📄 Quote — {job.name}</div>
    <div style={{marginBottom:11}}>
      {items.map(it=>(<div key={it.id} className="qi-row"><input className="qi-in" value={it.desc} onChange={e=>upd(it.id,"desc",e.target.value)}/><input className="qi-in" type="number" value={it.qty} onChange={e=>upd(it.id,"qty",e.target.value)}/><input className="qi-in" value={it.unit} onChange={e=>upd(it.id,"unit",e.target.value)}/><input className="qi-in" type="number" value={it.price} onChange={e=>upd(it.id,"price",e.target.value)}/><button className="btn btn-red btn-xs" onClick={()=>si(its=>its.filter(x=>x.id!==it.id))}>✕</button></div>))}
      <button className="btn btn-ghost btn-sm" onClick={()=>si(its=>[...its,{id:Date.now(),desc:"",qty:1,unit:"set",price:0}])}>+ Add Item</button>
      <div style={{textAlign:"right",fontSize:14,color:"var(--gold)",fontWeight:600,marginTop:8}}>Total: {fmt(tot)}</div>
    </div>
    <div style={{height:1,background:"var(--b)",margin:"12px 0"}}/>
    <div id="qp"><div className="qprev">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,paddingBottom:16,borderBottom:"2px solid #c9a84c"}}>
        <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#8a6f2e",fontWeight:700}}>✦ NOVAHome</div><div style={{fontSize:11,color:"#8a6f2e",marginTop:2}}>Amman, Jordan</div></div>
        <div style={{textAlign:"right"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"#2a2016"}}>Kitchen Design Quotation</div><div style={{fontSize:11.5,color:"#6a5a3a",marginTop:3}}>Ref: <strong>{job.quoteNo||"DRAFT"}</strong> · {td}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>{[{l:"To",v:`${job.name} · ${job.phone}`},{l:"Style",v:job.style},{l:"Designer",v:job.designer},{l:"Valid For",v:"30 days"}].map(r=>(<div key={r.l} style={{background:"#faf8f3",borderRadius:6,padding:"9px 12px"}}><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:".1em",color:"#8a6f2e",marginBottom:3}}>{r.l}</div><div style={{fontSize:13,fontWeight:600,color:"#2a2016"}}>{r.v}</div></div>))}</div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}><thead><tr style={{background:"#2a2016"}}>{["Description","Qty","Unit","Price (JD)","Total (JD)"].map(h=><th key={h} style={{padding:"8px 10px",color:"#c9a84c",fontSize:10,textAlign:h.includes("Total")||h.includes("Price")?"right":"left"}}>{h}</th>)}</tr></thead>
        <tbody>{items.map(it=>(<tr key={it.id}><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0"}}>{it.desc}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0"}}>{it.qty}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0"}}>{it.unit}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0",textAlign:"right"}}>{Number(it.price).toLocaleString()}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #e8e0d0",textAlign:"right",fontWeight:600}}>{(it.qty*it.price).toLocaleString()}</td></tr>))}<tr style={{background:"#faf8f3"}}><td colSpan={4} style={{padding:"10px",textAlign:"right",fontWeight:700,fontSize:13}}>TOTAL</td><td style={{padding:"10px",textAlign:"right",fontWeight:700,fontSize:15,color:"#8a6f2e"}}>JD {tot.toLocaleString()}</td></tr></tbody>
      </table>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:20,paddingTop:14,borderTop:"1px solid #e8e0d0"}}><div style={{fontSize:11,color:"#8a6f2e",maxWidth:260,lineHeight:1.6}}>Valid 30 days. Prices include materials and installation.</div><div style={{textAlign:"center"}}><div style={{width:160,borderBottom:"1px solid #2a2016",height:36,marginBottom:4}}/><div style={{fontSize:9,textTransform:"uppercase",color:"#8a6f2e"}}>Authorized Signature</div></div></div>
    </div></div>
    <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-gold" onClick={print}>🖨️ Print / Save PDF</button></div>
  </div></div>);
}
