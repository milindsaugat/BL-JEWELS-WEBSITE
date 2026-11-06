import React, { useState } from 'react';
import { api } from '../../services/api';
export const SubscribeForm = () => {
  const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try{await api.post('/auth/subscribe',{email});setMessage('Thank you. You are subscribed.');setEmail('');}catch(e){setMessage(e.response?.data?.message||'Please try again.');}finally{setBusy(false);}}} className="space-y-3"><div className="flex flex-col sm:flex-row gap-2"><input aria-label="Email for jewellery updates" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" className="min-w-0 flex-1 bg-white border border-stone-300 text-stone-900 rounded-xl p-3 text-sm"/><button disabled={busy} className="bg-[#930303] text-white rounded-xl px-5 py-3 text-sm disabled:opacity-50">{busy?'Joining…':'Subscribe'}</button></div><p className="text-xs text-stone-500">By subscribing, you agree to receive BL Jewels collection and offer emails.</p>{message&&<p role="status" className="text-sm text-[#930303]">{message}</p>}</form>;
};
