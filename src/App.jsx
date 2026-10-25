import React, { useEffect, useMemo, useState } from "react";
import { createGroupRecord, fetchProducts, joinGroupRecord, firebaseConfigured } from "./lib/dataService";
import {
  Search, MapPin, ChevronDown, Bell, Leaf, Users, Clock3, ArrowRight,
  Home, LayoutGrid, ShoppingBasket, UserRound, Plus, Minus, Star,
  CheckCircle2, Truck, RotateCcw, Heart, X, SlidersHorizontal, Sprout,
  Egg, Milk, Wheat, Package, Headphones, CreditCard, MapPinned, LogOut,
  ChevronRight, CircleHelp, ShieldCheck, Flame, Menu, Download
} from "lucide-react";

const initialDeals = [
  { id: 1, name: "Fresh Tomato", local: "Locally sourced · Grade A", category: "Vegetables", unit: "kg", retail: 38, group: 25, saved: 13, joined: 68, target: 100, hours: 1, mins: 24, image: "🍅", color: "#FFF0E9", dealer: "Raju Fresh Farms", rating: "4.8" },
  { id: 2, name: "Country Chicken", local: "Fresh cut · Cleaned on order", category: "Chicken", unit: "kg", retail: 320, group: 269, saved: 51, joined: 42, target: 60, hours: 2, mins: 10, image: "🍗", color: "#FFF0E5", dealer: "Sri Lakshmi Poultry", rating: "4.7" },
  { id: 3, name: "Farm Fresh Eggs", local: "Tray of 30 · Farm packed", category: "Eggs", unit: "tray", retail: 210, group: 174, saved: 36, joined: 84, target: 100, hours: 0, mins: 46, image: "🥚", color: "#FFF7D6", dealer: "GreenNest Farms", rating: "4.9" },
  { id: 4, name: "Premium Mutton", local: "Fresh cut · Halal certified", category: "Mutton", unit: "kg", retail: 850, group: 749, saved: 101, joined: 27, target: 40, hours: 3, mins: 35, image: "🥩", color: "#FCE7E7", dealer: "Deccan Meat House", rating: "4.8" },
  { id: 5, name: "Green Spinach", local: "Harvested this morning", category: "Vegetables", unit: "bunch", retail: 30, group: 19, saved: 11, joined: 36, target: 50, hours: 4, mins: 5, image: "🥬", color: "#E6F5E9", dealer: "Raju Fresh Farms", rating: "4.8" },
  { id: 6, name: "Sweet Bananas", local: "Naturally ripened", category: "Fruits", unit: "dozen", retail: 72, group: 55, saved: 17, joined: 31, target: 50, hours: 5, mins: 12, image: "🍌", color: "#FFF5C4", dealer: "GreenNest Farms", rating: "4.9" },
  { id: 7, name: "Cooking Oil", local: "5 litre family pack", category: "Rice & Oil", unit: "can", retail: 780, group: 699, saved: 81, joined: 19, target: 30, hours: 6, mins: 20, image: "🫒", color: "#F2F4D8", dealer: "DailyNeeds Wholesale", rating: "4.6" },
  { id: 8, name: "Daily Essentials Kit", local: "Everyday pantry bundle", category: "Daily Essentials", unit: "kit", retail: 499, group: 399, saved: 100, joined: 22, target: 40, hours: 8, mins: 0, image: "🧺", color: "#E9F2F0", dealer: "DailyNeeds Wholesale", rating: "4.6" }
];
const categories = [
  { name: "Vegetables", emoji: "🥦", tint: "#E8F5E9" }, { name: "Fruits", emoji: "🍎", tint: "#FFF0E5" },
  { name: "Chicken", emoji: "🍗", tint: "#FFF0E5" }, { name: "Mutton", emoji: "🥩", tint: "#FCE7E7" },
  { name: "Eggs", emoji: "🥚", tint: "#FFF7D6" }, { name: "Dairy", emoji: "🥛", tint: "#E7F1FF" },
  { name: "Rice & Oil", emoji: "🌾", tint: "#F3F0D9" }, { name: "Daily Essentials", emoji: "🧺", tint: "#E9F2F0" }
];
const money = n => "₹" + Number(n).toLocaleString("en-IN");
const readLocalState = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read Freshmitra local state (${key}):`, error);
    return fallback;
  }
};
const writeLocalState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save Freshmitra local state (${key}):`, error);
  }
};

function Brand({ small = false }) {
  return <div className={`brand ${small ? "brand-small" : ""}`}><span className="brand-mark"><Sprout size={small ? 19 : 24} strokeWidth={2.5}/><Users size={small ? 13 : 15} className="brand-people"/></span><span>fresh<span className="brand-mitra">mitra</span></span></div>;
}
function IconButton({ children, onClick, label }) {
  return <button className="icon-button" onClick={onClick} aria-label={label}>{children}</button>;
}
function DealCard({ deal, onJoin, onOpen, wished, onWish }) {
  const percent = Math.min(100, Math.round(deal.joined / deal.target * 100));
  return <article className="deal-card">
    <div className="deal-image-wrap" style={{ background: deal.color }} onClick={() => onOpen(deal)}>
      <span className="deal-emoji">{deal.image}</span>
      <span className="save-pill"><span>↓</span> Save {Math.round((deal.saved/deal.retail)*100)}%</span>
      <button className={`wish-button ${wished ? "wished" : ""}`} onClick={e => { e.stopPropagation(); onWish(deal.id); }} aria-label="Save deal"><Heart size={16} fill={wished ? "currentColor" : "none"}/></button>
    </div>
    <div className="deal-content">
      <div className="deal-kicker">{deal.category}</div>
      <h3 onClick={() => onOpen(deal)}>{deal.name}</h3>
      <p className="deal-subtitle">{deal.local}</p>
      <div className="price-row"><span className="group-price">{money(deal.group)}<small>/{deal.unit}</small></span><span className="retail-price">{money(deal.retail)}</span><span className="save-amount">Save {money(deal.saved)}</span></div>
      <div className="progress-meta"><span><Users size={13}/> {deal.joined} {deal.unit === "tray" ? "trays" : "units"} joined</span><b>{percent}%</b></div>
      <div className="progress-track"><span style={{ width: `${percent}%` }}/></div>
      <div className="deal-footer"><span className="time-left"><Clock3 size={13}/>{deal.hours ? `${deal.hours}h ` : ""}{deal.mins}m left</span><button className="join-button" onClick={() => onJoin(deal)}>Join group <ArrowRight size={14}/></button></div>
    </div>
  </article>;
}
function BottomNav({ page, setPage }) {
  const items = [{ id: "Home", icon: Home }, { id: "Categories", icon: LayoutGrid }, { id: "My Groups", icon: ShoppingBasket }, { id: "Profile", icon: UserRound }];
  return <nav className="bottom-nav">{items.map(({id, icon: Icon}) => <button key={id} className={page === id ? "nav-item active" : "nav-item"} onClick={() => setPage(id)}><Icon size={21} strokeWidth={page === id ? 2.4 : 1.8}/><span>{id}</span>{page === id && <i/>}</button>)}</nav>;
}
function GroupModal({ deal, onClose, onConfirm }) {
  const [qty, setQty] = useState(2);
  const [slot, setSlot] = useState("Tomorrow, 7–9 AM");
  if (!deal) return null;
  return <div className="modal-backdrop" onClick={onClose}><section className="group-modal" onClick={e => e.stopPropagation()}>
    <div className="modal-handle"/><button className="modal-close" onClick={onClose}><X size={19}/></button>
    <div className="modal-product" style={{background:deal.color}}><span>{deal.image}</span><div><div className="eyebrow">{deal.category} · Group deal</div><h2>{deal.name}</h2><p>{deal.local}</p></div></div>
    <div className="modal-price"><div><span className="muted">Group price</span><strong>{money(deal.group)}<small> / {deal.unit}</small></strong></div><div className="modal-savings">You save {money(deal.saved * qty)}<small>vs. regular price</small></div></div>
    <div className="modal-progress"><div className="section-line"><strong><Users size={16}/> {deal.joined} people joined</strong><span>{Math.round(deal.joined/deal.target*100)}% full</span></div><div className="progress-track big"><span style={{width:`${Math.min(100,deal.joined/deal.target*100)}%`}}/></div><p><Flame size={14}/> {deal.target-deal.joined} more {deal.unit === "kg" ? "kg" : "units"} to unlock this deal</p></div>
    <div className="modal-section"><div className="section-line"><h3>Choose quantity</h3><span className="muted">Minimum 1 {deal.unit}</span></div><div className="quantity-control"><button onClick={() => setQty(Math.max(1,qty-1))} aria-label="Decrease quantity"><Minus size={17}/></button><strong>{qty} <small>{deal.unit}{qty>1 && deal.unit==="kg"?"s":""}</small></strong><button onClick={() => setQty(Math.min(20,qty+1))} aria-label="Increase quantity"><Plus size={17}/></button></div></div>
    <div className="modal-section"><h3>Delivery slot</h3><div className="slot-options">{["Today, 6–8 PM","Tomorrow, 7–9 AM"].map(s=><button key={s} className={slot===s?"slot selected":"slot"} onClick={()=>setSlot(s)}>{s}{slot===s&&<CheckCircle2 size={16}/>}</button>)}</div></div>
    <div className="dealer-strip"><div className="dealer-avatar">🌱</div><div><strong>{deal.dealer}</strong><span><Star size={13} fill="#F59E0B" color="#F59E0B"/> {deal.rating} <i>·</i> Verified vendor</span></div><ShieldCheck size={19} className="verified"/></div>
    <div className="modal-bottom"><div><span className="muted">Total · {qty} {deal.unit}</span><strong>{money(deal.group*qty)}</strong></div><button className="primary-button" onClick={()=>onConfirm(deal,qty,slot)}>Join group <ArrowRight size={17}/></button></div>
  </section></div>;
}
function CreateGroup({ onBack, onCreate }) {
  const [product,setProduct] = useState("Tomato");
  const [qty,setQty] = useState("25");
  const [closing,setClosing] = useState("8 hours");
  const [area,setArea] = useState("Kukatpally");
  return <div className="page-shell subpage"><div className="subpage-top"><button className="back-button" onClick={onBack}>←</button><div><h1>Create a group</h1><p>Bring your neighbours together and save.</p></div></div>
    <div className="create-banner"><div className="create-banner-icon">🤝</div><div><strong>More people. Better prices.</strong><p>Set a target and invite your community to buy together.</p></div></div>
    <div className="form-card"><label>What are you buying?</label><div className="product-select-grid">{[["Tomato","🍅"],["Onion","🧅"],["Chicken","🍗"],["Mutton","🥩"],["Eggs","🥚"]].map(([n,e])=><button key={n} onClick={()=>setProduct(n)} className={product===n?"product-choice chosen":"product-choice"}><span>{e}</span>{n}{product===n&&<CheckCircle2 size={15}/>}</button>)}</div>
    <label>Target quantity</label><div className="quantity-field"><button onClick={()=>setQty(String(Math.max(5,Number(qty)-5)))}><Minus size={17}/></button><div><strong>{qty} kg</strong><small>Suggested for a neighbourhood group</small></div><button onClick={()=>setQty(String(Math.min(500,Number(qty)+5)))}><Plus size={17}/></button></div>
    <label>When should the group close?</label><div className="closing-options">{["4 hours","8 hours","Tomorrow morning"].map(t=><button key={t} className={closing===t?"closing-choice selected":"closing-choice"} onClick={()=>setClosing(t)}>{t}</button>)}</div>
    <label>Delivery area</label><div className="select-wrap"><MapPin size={17}/><select value={area} onChange={e=>setArea(e.target.value)}>{["Kukatpally","Miyapur","Kondapur","Gachibowli","Madhapur"].map(a=><option key={a}>{a}</option>)}</select><ChevronDown size={16}/></div>
    <div className="note-box"><ShieldCheck size={18}/><p>Your group will be visible to people in {area}. You can share the invite after creating it.</p></div>
    <button className="primary-button full" onClick={()=>onCreate({product,qty,closing,area})}>Create group <ArrowRight size={17}/></button>
    </div>
  </div>;
}
function App() {
  const [showSplash,setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem("freshmitra-splash-seen");
    } catch (error) {
      console.error("Could not read splash state:", error);
      return false;
    }
  });
  const [page,setPage] = useState("Home");
  const [filter,setFilter] = useState("All");
  const [search,setSearch] = useState("");
  const [selected,setSelected] = useState(null);
  const [deals,setDeals] = useState(initialDeals);
  const [wishes,setWishes] = useState(() => readLocalState("freshmitra-wishes", []));
  const [activeTab,setActiveTab] = useState("Active Groups");
  const [orders,setOrders] = useState(() => readLocalState("freshmitra-orders", []));
  const [toast,setToast] = useState("");
  const [showCreate,setShowCreate] = useState(false);
  const [showNotifications,setShowNotifications] = useState(false);
  const [profileMenu,setProfileMenu] = useState("");
  const [showSearch,setShowSearch] = useState(false);
  const [location,setLocation] = useState(() => readLocalState("freshmitra-location", "Kukatpally, Hyderabad"));
  const [showLocation,setShowLocation] = useState(false);
  const [categoryView,setCategoryView] = useState("");
  const [showAll,setShowAll] = useState(false);
  const [installPrompt,setInstallPrompt] = useState(null);

  const notify = message => { setToast(message); window.setTimeout(()=>setToast(""),2800); };
  const toggleWish = id => setWishes(old => old.includes(id) ? old.filter(x=>x!==id) : [...old,id]);
  useEffect(() => {
    if (!showSplash) return undefined;
    const timeout = window.setTimeout(() => {
      try {
        sessionStorage.setItem("freshmitra-splash-seen", "true");
      } catch (error) {
        console.error("Could not save splash state:", error);
      }
      setShowSplash(false);
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [showSplash]);
  useEffect(() => {
    writeLocalState("freshmitra-orders", orders);
  }, [orders]);
  useEffect(() => {
    writeLocalState("freshmitra-wishes", wishes);
  }, [wishes]);
  useEffect(() => {
    writeLocalState("freshmitra-location", location);
  }, [location]);
  useEffect(() => {
    const handleInstallPrompt = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);
  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") notify("Freshmitra is being added to your home screen.");
    setInstallPrompt(null);
  };
  useEffect(() => {
    let cancelled = false;
    if (!firebaseConfigured) return () => { cancelled = true; };
    fetchProducts().then(remote => {
      if (cancelled || !remote.length) return;
      const normalized = remote.filter(p => p.active !== false).map((p, index) => ({
        id: p.id,
        name: p.name || "Fresh product",
        local: p.description || "Fresh from a local vendor",
        category: p.category || "Daily Essentials",
        unit: p.unit || "kg",
        retail: Number(p.retailPrice || 0),
        group: Number(p.groupPrice || 0),
        saved: Math.max(0, Number(p.retailPrice || 0) - Number(p.groupPrice || 0)),
        joined: Number(p.joinedQuantity || 0),
        target: Math.max(1, Number(p.targetQuantity || 50)),
        hours: Number(p.hoursLeft || 4),
        mins: Number(p.minutesLeft || 0),
        image: p.imageEmoji || "🧺",
        color: p.color || ["#E8F5E9", "#FFF0E5", "#FFF7D6", "#FCE7E7"][index % 4],
        dealer: p.dealerName || "Freshmitra Verified Vendor",
        rating: String(p.dealerRating || "New")
      }));
      setDeals(normalized);
    }).catch(err => console.error("Freshmitra product load failed:", err));
    return () => { cancelled = true; };
  }, []);

  const visibleDeals = useMemo(()=>deals.filter(d=>(filter==="All"||filter==="Today's Deals"||d.category===filter)&&d.name.toLowerCase().includes(search.toLowerCase())),[deals,filter,search]);
  const joinDeal = d => setSelected(d);
  const confirmJoin = async (deal,qty,slot) => {
    try {
      const result = await joinGroupRecord({ groupId: deal.id, deal, quantity: qty, slot });
      setOrders(old=>[{id:result.id || Date.now(),deal,qty,slot,status:"Collecting",type:"group"},...old]);
      setDeals(old=>old.map(d=>d.id===deal.id?{...d,joined:Math.min(d.target,d.joined+qty)}:d));
      setSelected(null); setPage("My Groups"); setActiveTab("Active Groups");
      notify(result.mode === "firebase" ? `Joined ${deal.name} group and saved to Firebase.` : `You're in! Joined ${deal.name} group.`);
    } catch (error) {
      console.error(error);
      notify("Could not save to Firebase. Check setup and Firestore rules.");
    }
  };
  const createGroup = async data => {
    const match = deals.find(d=>d.name.toLowerCase().includes(data.product.toLowerCase()));
    const deal = match || {id:Date.now(),name:data.product,category:"Vegetables",unit:"kg",group:25,retail:38,saved:13,image:"🧺",color:"#E8F5E9",dealer:"Freshmitra Community",rating:"New",joined:1,target:Number(data.qty),hours:8,mins:0};
    try {
      const result = await createGroupRecord({ ...data, deal });
      const savedDeal = { ...deal, id: result.id || deal.id, target: Number(data.qty) };
      setOrders(old=>[{id:result.id || Date.now(),deal:savedDeal,qty:Number(data.qty),slot:`Closes in ${data.closing}`,status:"Collecting",type:"created",area:data.area},...old]);
      setShowCreate(false);setPage("My Groups");setActiveTab("Active Groups");
      notify(result.mode === "firebase" ? "Your group is live and saved to Firebase!" : "Your group is live! Invite your neighbours.");
    } catch (error) {
      console.error(error);
      notify("Could not create group in Firebase. Check setup and Firestore rules.");
    }
  };
  const selectCategory = name => { setFilter(name); setCategoryView(name); setPage("Home"); setShowAll(true); };
  const navTo = name => {setPage(name);setShowCreate(false);setProfileMenu("");setCategoryView("");};
  const navTitle = page === "Home" ? "Good things, for less." : page;

  return <div className="app-bg">
    {showSplash&&<div className="splash-screen" role="status" aria-label="Freshmitra is loading"><Brand/><p>Buy Together. Save More.</p><span className="splash-loader"/></div>}
    <div className="app-frame">
      <header className="topbar">
        <div className="topbar-brand"><Brand small/><button className="location-button" onClick={()=>setShowLocation(!showLocation)}><MapPin size={14}/><span>{location}</span><ChevronDown size={13}/></button></div>
        <div className="topbar-actions">{installPrompt&&<IconButton label="Install Freshmitra" onClick={installApp}><Download size={18}/></IconButton>}<IconButton label="Search" onClick={()=>setShowSearch(!showSearch)}><Search size={19}/></IconButton><IconButton label="Notifications" onClick={()=>setShowNotifications(!showNotifications)}><Bell size={19}/><i className="notification-dot"/></IconButton></div>
        {showLocation&&<div className="floating-panel location-panel"><strong>Delivering to</strong>{["Kukatpally, Hyderabad","Miyapur, Hyderabad","Kondapur, Hyderabad","Gachibowli, Hyderabad","Madhapur, Hyderabad"].map(l=><button key={l} onClick={()=>{setLocation(l);setShowLocation(false);notify(`Area set to ${l}`)}}><MapPin size={15}/>{l}{location===l&&<CheckCircle2 size={15}/>}</button>)}</div>}
        {showNotifications&&<div className="floating-panel notification-panel"><strong>You're all caught up!</strong><p>New group deals near you will show up here.</p></div>}
      </header>
      {showSearch&&<div className="search-bar"><Search size={18}/><input autoFocus placeholder="Search vegetables, meat, eggs..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch("")}><X size={16}/></button>}</div>}
      <main className="main-content">
        {page==="Home"&&!showCreate&&<>
          <section className="welcome-row"><div><div className="eyebrow welcome-eyebrow"><span className="live-dot"/> COMMUNITY SAVINGS, FRESH DAILY</div><h1>{navTitle}</h1><p>Fresh picks. Wholesale prices. <b>Better together.</b></p></div><div className="welcome-art"><span>🥬</span><span>🍅</span><span>🥚</span></div></section>
          <section className="hero-card"><div className="hero-copy"><span className="hero-label"><Flame size={13}/> NEIGHBOURHOOD DEALS</span><h2>More in your basket.<br/><em>Less on your bill.</em></h2><p>Join a group order with your neighbours and unlock wholesale prices.</p><button onClick={()=>document.getElementById("live-deals")?.scrollIntoView({behavior:"smooth"})}>Explore live deals <ArrowRight size={16}/></button><div className="hero-trust"><span><Users size={14}/> Community powered</span><span><ShieldCheck size={14}/> Trusted vendors</span></div></div><div className="hero-visual"><div className="hero-circle circle-one"/><div className="hero-circle circle-two"/><span className="hero-food food-one">🥦</span><span className="hero-food food-two">🍅</span><span className="hero-food food-three">🥕</span><span className="hero-sticker">UP TO<br/><b>30% OFF</b></span></div></section>
          <section className="trust-strip"><div><span className="trust-icon"><Truck size={17}/></span><span><b>Neighbourhood delivery</b><small>Convenient time slots</small></span></div><div><span className="trust-icon"><ShieldCheck size={17}/></span><span><b>Verified vendors</b><small>Freshness you can trust</small></span></div><div><span className="trust-icon"><Users size={17}/></span><span><b>Better together</b><small>Unlock group pricing</small></span></div></section>
          <section className="category-section"><div className="section-heading"><div><span className="eyebrow">SHOP BY CATEGORY</span><h2>What do you need?</h2></div><button className="text-link" onClick={()=>navTo("Categories")}>See all <ArrowRight size={15}/></button></div><div className="category-scroller">{categories.slice(0,6).map(c=><button key={c.name} className="category-tile" onClick={()=>selectCategory(c.name)}><span className="category-emoji" style={{background:c.tint}}>{c.emoji}</span><span>{c.name}</span></button>)}</div></section>
          <section className="deals-section" id="live-deals"><div className="section-heading deals-heading"><div><span className="eyebrow"><span className="live-dot"/> LIVE GROUP BUYS</span><h2>Deals near you <span className="live-count">{visibleDeals.length}</span></h2><p>Prices drop when the community joins in. {firebaseConfigured ? "Connected to Firebase" : "Demo mode"}</p></div><button className="filter-button" onClick={()=>setShowAll(!showAll)}><SlidersHorizontal size={16}/>{showAll?"Less":"View all"}</button></div>
            <div className="filter-chips">{["All","Vegetables","Chicken","Mutton","Eggs","Today's Deals"].map(c=><button key={c} onClick={()=>{setFilter(c);setCategoryView("");}} className={filter===c?"chip selected":"chip"}>{c==="Today's Deals"&&<Flame size={13}/ >}{c}</button>)}</div>
            {categoryView&&<div className="filter-notice">Showing {categoryView.toLowerCase()} deals <button onClick={()=>{setFilter("All");setCategoryView("");}}>Clear filter <X size={13}/></button></div>}
            <div className="deal-grid">{(showAll?visibleDeals:visibleDeals.slice(0,4)).map(d=><DealCard key={d.id} deal={d} onJoin={joinDeal} onOpen={joinDeal} wished={wishes.includes(d.id)} onWish={toggleWish}/>)}</div>
            {visibleDeals.length===0&&<div className="empty-state"><span>🔎</span><h3>No deals found</h3><p>Try a different search or category.</p><button className="primary-button" onClick={()=>{setSearch("");setFilter("All")}}>Show all deals</button></div>}
            <div className="create-prompt"><div className="prompt-icon">🤝</div><div><strong>Can't find your group deal?</strong><p>Start a group order for your community.</p></div><button onClick={()=>setShowCreate(true)}>Create group <Plus size={15}/></button></div>
          </section>
        </>}
        {page==="Home"&&showCreate&&<CreateGroup onBack={()=>setShowCreate(false)} onCreate={createGroup}/>}
        {page==="Categories"&&<section className="page-shell"><div className="page-heading"><span className="eyebrow">FRESH FINDS, FAIR PRICES</span><h1>Shop by category</h1><p>Everyday essentials, better when bought together.</p></div><div className="all-category-grid">{categories.map((c,i)=><button key={c.name} className="big-category" onClick={()=>selectCategory(c.name)}><span className="big-category-art" style={{background:c.tint}}>{c.emoji}</span><span><b>{c.name}</b><small>{[12,8,6,4,5,7,9,11][i]} live group deals</small></span><ChevronRight size={19}/></button>)}</div><div className="category-bottom-note"><Sprout size={20}/><div><strong>Freshness from trusted local vendors</strong><p>Know your seller. See the savings. Buy together.</p></div></div></section>}
        {page==="My Groups"&&<section className="page-shell"><div className="page-heading orders-heading"><div><span className="eyebrow">YOUR COMMUNITY BASKET</span><h1>My groups & orders</h1><p>Follow your group buys from deal to doorstep.</p></div><button className="primary-button compact" onClick={()=>{setShowCreate(true);setPage("Home")}}><Plus size={16}/> Create group</button></div><div className="tabs"><button className={activeTab==="Active Groups"?"tab active":"tab"} onClick={()=>setActiveTab("Active Groups")}>Active groups <span>{orders.filter(o=>o.status!=="Delivered").length}</span></button><button className={activeTab==="Past Orders"?"tab active":"tab"} onClick={()=>setActiveTab("Past Orders")}>Past orders</button></div>
          <div className="orders-list">{orders.filter(o=>activeTab==="Active Groups"?o.status!=="Delivered":o.status==="Delivered").map(o=><article className="order-card" key={o.id}><div className="order-product-art" style={{background:o.deal.color}}>{o.deal.image}</div><div className="order-main"><div className="order-topline"><span className={`status-tag ${o.status.toLowerCase().replaceAll(" ","-")}`}>{o.status==="Collecting"&&<span className="tiny-live"/>}{o.status}</span><span className="order-id">FM-{String(o.id).slice(-5)}</span></div><h3>{o.deal.name}</h3><p>{o.qty} {o.deal.unit} · {o.slot}</p><div className="order-price">{money(o.deal.group*o.qty)} <span>· Saved {money(o.deal.saved*o.qty)}</span></div><div className="order-actions">{o.status==="Collecting"?<button className="outline-button" onClick={()=>notify("Invite link copied! Share it with your neighbours.")}>Invite neighbours <Users size={14}/></button>:o.status==="Delivered"?<button className="outline-button" onClick={()=>{setSelected(o.deal);setPage("Home")}}>Reorder <RotateCcw size={14}/></button>:<button className="outline-button" onClick={()=>notify("Tracking updates will appear here.")}>Track order <Truck size={14}/></button>}<button className="plain-button" onClick={()=>{setSelected(o.deal);setPage("Home")}}>View deal <ArrowRight size={14}/></button></div></div></article>)}
          {activeTab==="Past Orders"&&<div className="empty-state"><span>🧺</span><h3>Your past orders will appear here</h3><p>Complete a group buy and it will show up here.</p><button className="primary-button" onClick={()=>navTo("Home")}>Explore deals</button></div>}
          {activeTab==="Active Groups"&&orders.filter(o=>o.status!=="Delivered").length===0&&<div className="empty-state"><span>🤝</span><h3>Your group journey starts here</h3><p>Join a live deal or create a group with your neighbours.</p><button className="primary-button" onClick={()=>navTo("Home")}>Explore live deals <ArrowRight size={16}/></button></div>}</div>
        </section>}
        {page==="Profile"&&<section className="page-shell profile-page"><div className="page-heading"><span className="eyebrow">YOUR FRESHMITRA ACCOUNT</span><h1>My profile</h1><p>Manage your account and preferences.</p></div><div className="profile-card"><div className="profile-avatar">CR</div><div className="profile-details"><h2>Chaitanya Reddy</h2><p>chaitanya@example.com</p><span className="member-pill"><Sprout size={13}/> Freshmitra member</span></div><button className="edit-profile" onClick={()=>notify("Profile editing will be available soon.")}>Edit</button></div><div className="profile-menu">{[{name:"My Addresses",desc:"Manage delivery locations",icon:MapPinned},{name:"My Orders",desc:"Your group buys and orders",icon:ShoppingBasket},{name:"Saved Groups",desc:"Deals you bookmarked",icon:Heart},{name:"Payments",desc:"Payment methods and refunds",icon:CreditCard},{name:"Help & Support",desc:"We're here to help",icon:Headphones}].map(({name,desc,icon:Icon})=><button className="profile-menu-row" key={name} onClick={()=>name==="My Orders"?navTo("My Groups"):name==="Saved Groups"?notify(wishes.length?`${wishes.length} saved deal(s) — visit Home to open them.`:"You haven't saved any deals yet."):setProfileMenu(name)}><span className="menu-icon"><Icon size={19}/></span><span className="menu-copy"><b>{name}</b><small>{desc}</small></span><ChevronRight size={18}/></button>)}</div><button className="logout-button" onClick={()=>notify("You're safely signed in on this demo.")}><LogOut size={18}/> Log out</button><div className="profile-footer"><Brand small/><span>Version 0.1.0 · Made for neighbourhoods in India</span></div></section>}
      </main>
      {!showCreate&&<BottomNav page={page} setPage={navTo}/>}
      {showCreate&&page!=="Home"&&null}
      <GroupModal deal={selected} onClose={()=>setSelected(null)} onConfirm={confirmJoin}/>
      {profileMenu&&<div className="modal-backdrop" onClick={()=>setProfileMenu("")}><section className="simple-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setProfileMenu("")}><X size={19}/></button><div className="simple-modal-icon"><CircleHelp size={26}/></div><h2>{profileMenu}</h2><p>This section will be connected when we add your account and backend services.</p><button className="primary-button full" onClick={()=>setProfileMenu("")}>Got it</button></section></div>}
      {installPrompt&&<button className="install-banner" onClick={installApp}><Download size={17}/><span><b>Install Freshmitra</b><small>Add the app to your home screen</small></span><ArrowRight size={16}/></button>}
      {toast&&<div className="toast" role="status"><CheckCircle2 size={18}/>{toast}</div>}
      <footer className="desktop-footer"><Brand small/><span>Freshmitra · Buy Together. Save More.</span><span>Demo experience · Sample prices</span></footer>
    </div>
  </div>;
}
export default App;