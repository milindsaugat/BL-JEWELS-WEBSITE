import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Shapes, Sparkles, Package, ShoppingBag, Image, Coins, Megaphone, Tag, MessageSquare, PanelLeftClose, PanelLeftOpen, Menu, X, LogOut, LogIn, ExternalLink, Users, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
const items=[['Dashboard','/',LayoutDashboard],['Products','/products',Package],['Orders','/orders',ShoppingBag],['Customers','/users',Users],['Categories','/categories',Shapes],['Occasions','/occasions',Sparkles],['Banners','/banners',Image],['Gold API & Rates','/gold-rates',Coins],['Announcements','/announcements',Megaphone],['Coupons','/coupons',Tag],['Testimonials','/testimonials',MessageSquare]];
export const AdminLayout=()=>{
 const [collapsed,setCollapsed]=useState(()=>localStorage.getItem('bl_sidebar_collapsed')==='true');
 const [mobile,setMobile]=useState(false),[profile,setProfile]=useState(false);
 const {user,logout,isAuthenticated}=useAuthStore(),location=useLocation(),profileRef=useRef(null);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});setProfile(false);setMobile(false);},[location.pathname]);
 useEffect(()=>{const close=e=>{if(!profileRef.current?.contains(e.target))setProfile(false);};const escape=e=>{if(e.key==='Escape'){setProfile(false);setMobile(false);}};document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};},[]);
 useEffect(()=>{if(!mobile)return;const old=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';return()=>{document.documentElement.style.overflow=old;};},[mobile]);
 const toggle=()=>setCollapsed(v=>{localStorage.setItem('bl_sidebar_collapsed',String(!v));return !v;});
 const storefront=import.meta.env.VITE_STOREFRONT_URL||'http://localhost:5173';
 const initials=(user?.name||'Admin').split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase();
 return <div className="admin-shell min-h-screen bg-[#F5F6F8] text-stone-900 font-body">
 {mobile&&<button aria-label="Close navigation" className="fixed inset-0 bg-stone-950/30 backdrop-blur-sm z-40 lg:hidden" onClick={()=>setMobile(false)}/>}
 <aside aria-label="Admin navigation" className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-stone-200/80 flex flex-col transition-[width,transform] duration-200 ${collapsed?'lg:w-[76px]':'lg:w-[232px]'} w-[248px] ${mobile?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
   <Link to="/" className="h-16 shrink-0 flex items-center gap-2.5 px-5 border-b border-stone-100"><img src="/images/bl-jewels-icon.png" alt="BL Jewels" className="h-9 w-9 object-contain shrink-0"/><div className={collapsed?'lg:hidden':''}><p className="font-bold text-sm tracking-wide text-[#930303]">BL JEWELS</p><p className="text-[10px] text-stone-400 mt-0.5">Store workspace</p></div></Link>
   <div className={`px-6 pt-5 pb-2 text-[9px] uppercase tracking-[.18em] text-stone-400 ${collapsed?'lg:invisible':''}`}>Manage your store</div>
   <nav className="admin-sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 space-y-1">{items.map(([label,path,Icon])=><NavLink key={path} to={path} end={path==='/'} title={label} onClick={()=>setMobile(false)} className={({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-colors ${isActive?'bg-[#930303] text-white shadow-sm shadow-red-900/10 font-semibold':'text-stone-500 hover:bg-[#FBF3F0] hover:text-[#930303]'}`}><Icon size={18} strokeWidth={1.7} className="shrink-0"/><span className={collapsed?'lg:hidden':''}>{label}</span></NavLink>)}</nav>
   <div className="shrink-0 p-3 border-t border-stone-100"><a href={storefront} target="_blank" rel="noreferrer" title="Open storefront" className="flex items-center gap-3 rounded-xl bg-stone-50 border border-stone-100 px-3 py-3 text-xs text-stone-600"><ExternalLink size={17} className="shrink-0"/><span className={collapsed?'lg:hidden':''}>Open storefront</span></a></div>
 </aside>
 <div className={`min-w-0 transition-[padding] duration-200 ${collapsed?'lg:pl-[76px]':'lg:pl-[232px]'}`}>
   <header className={`fixed top-0 right-0 left-0 ${collapsed?'lg:left-[76px]':'lg:left-[232px]'} h-16 z-30 bg-white border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 transition-[left] duration-200`}>
     <div className="flex items-center gap-3 min-w-0"><button aria-label="Toggle sidebar" aria-expanded={!collapsed} onClick={toggle} className="hidden lg:flex p-2 rounded-lg text-stone-500 hover:bg-stone-100">{collapsed?<PanelLeftOpen size={19}/>:<PanelLeftClose size={19}/>}</button><button aria-label="Open navigation" aria-expanded={mobile} onClick={()=>setMobile(true)} className="lg:hidden p-2"><Menu size={20}/></button><div className="min-w-0"><p className="text-[9px] uppercase tracking-[.15em] text-stone-400">Workspace</p><h1 className="font-semibold text-sm truncate">{items.find(i=>i[1]===location.pathname)?.[0]||'Store management'}</h1></div></div>
     <div className="flex items-center gap-3"><a href={storefront} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 px-3 py-2 border rounded-lg text-xs text-stone-600 hover:bg-stone-50">View store<ExternalLink size={13}/></a><span className="hidden sm:block h-7 w-px bg-stone-200"/>
       <div ref={profileRef} className="relative"><button aria-label="Account menu" aria-expanded={profile} aria-controls="admin-account-menu" onClick={()=>setProfile(v=>!v)} className="flex items-center gap-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#930303]"><span className="h-9 w-9 rounded-full bg-[#930303] text-white flex items-center justify-center text-xs font-semibold ring-4 ring-[#FAF0ED]">{initials}</span><ChevronDown size={13} className="text-stone-400"/></button>
       {profile&&<div id="admin-account-menu" className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2"><div className="px-3 py-3 border-b border-stone-100"><p className="text-sm font-semibold truncate">{user?.name||'Your account'}</p><p className="text-xs text-stone-500 truncate mt-1">{user?.email}</p><p className="mt-2 text-[10px] text-[#930303] flex items-center gap-1"><ShieldCheck size={12}/>Administrator</p></div>{isAuthenticated?<button onClick={()=>{setProfile(false);logout();}} className="flex items-center gap-2 text-sm text-red-800 hover:bg-red-50 rounded-xl p-3 w-full"><LogOut size={16}/>Sign out</button>:<Link to="/login" className="flex gap-2 p-3 text-sm"><LogIn size={16}/>Sign in</Link>}</div>}
       </div>
     </div>
   </header>
   <main className="min-w-0 w-full px-4 sm:px-6 pt-[84px] pb-6"><Outlet/></main>
 </div></div>;
};
export default AdminLayout;
