'use client';

import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Clapperboard, Eye, Heart, Radio, Users, RadioTower, CircleOff, CalendarPlus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { ErrorState, fmt, Loading, PageHeader, Status } from '@/components/ui';

export default function Dashboard() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState('');
  const load = () => { setError(''); api('/admin/dashboard').then(setData).catch((e) => setError(e.message)); };
  useEffect(() => { void load(); }, []);
  if (error) return <ErrorState message={error} retry={load}/>;
  if (!data) return <Loading/>;
  const cards = [
    ['Jami kinolar', data.totals.movies, Clapperboard, 'text-violet-400'],
    ['Jami telekanallar', data.totals.channels, Radio, 'text-cyan-400'],
    ['Jami foydalanuvchilar', data.totals.users, Users, 'text-emerald-400'],
    ['Jami ko‘rishlar', data.totals.views, Eye, 'text-amber-400'],
    ['Sevimlilar soni', data.totals.favorites, Heart, 'text-pink-400'],
    ['Faol telekanallar', data.totals.activeChannels, RadioTower, 'text-green-400'],
    ['Faol bo‘lmagan kanallar', data.totals.inactiveChannels, CircleOff, 'text-red-400'],
    ['Bugun qo‘shilgan kinolar', data.totals.todayMovies, CalendarPlus, 'text-blue-400'],
  ] as const;
  return <>
    <PageHeader title="Boshqaruv paneli" description="KinoTV platformasining real vaqt statistikasi va tezkor amallari"/>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon,color]) => <div className="card p-5" key={label}><div className="flex items-start justify-between"><div><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{fmt(value)}</p></div><span className={`rounded-xl bg-white/[.04] p-3 ${color}`}><Icon size={21}/></span></div><p className="mt-4 text-xs text-zinc-600">PostgreSQL bazasining joriy holati</p></div>)}</section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr_0.8fr]">
      <Ranking title="Eng ko‘p ko‘rilgan kinolar" rows={data.topMovies} keyName="title" href="/movies"/>
      <Ranking title="Eng ko‘p ko‘rilgan telekanallar" rows={data.topChannels} keyName="name" href="/channels"/>
      <div className="card p-5"><h2 className="section-title mb-5">Tezkor amallar</h2><div className="space-y-3"><Quick href="/movies?new=1" label="Kino qo‘shish"/><Quick href="/channels?new=1" label="Telekanal qo‘shish"/><Quick href="/programs?new=1" label="TV dasturi qo‘shish"/><Quick href="/settings" label="CSV / JSON import"/></div></div>
    </section>
    <section className="mt-6 grid gap-6 xl:grid-cols-2"><Recent title="Oxirgi qo‘shilgan kinolar" rows={data.newMovies} nameKey="title" href="/movies"/><Recent title="Oxirgi qo‘shilgan telekanallar" rows={data.newChannels} nameKey="name" href="/channels"/></section>
  </>;
}
function Quick({href,label}:{href:string;label:string}) { return <Link href={href} className="btn-secondary w-full justify-between">{label}<ArrowUpRight size={16}/></Link>; }
function Ranking({title,rows,keyName,href}:{title:string;rows:any[];keyName:string;href:string}) { return <div className="card p-5"><div className="mb-4 flex justify-between"><h2 className="section-title">{title}</h2><Link href={href} className="text-xs text-brand-400">Barchasi</Link></div><div className="space-y-2">{rows.map((x,i) => <div className="flex items-center justify-between rounded-xl bg-white/[.025] p-3" key={x.id}><span className="min-w-0 truncate"><b className="mr-3 text-brand-400">{i+1}</b>{x[keyName]}</span><span className="ml-3 whitespace-nowrap text-xs text-zinc-500">{fmt(x.viewCount)} ko‘rish</span></div>)}</div></div>; }
function Recent({title,rows,nameKey,href}:{title:string;rows:any[];nameKey:string;href:string}) { return <div className="card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="section-title">{title}</h2><Link href={href} className="text-xs text-brand-400">Barchasi</Link></div><div className="space-y-2">{rows.map((x) => <div key={x.id} className="flex items-center justify-between rounded-xl border border-line/70 p-3"><div><p className="text-sm font-medium">{x[nameKey]}</p><p className="text-xs text-zinc-600">{new Date(x.createdAt).toLocaleDateString('uz-UZ')}</p></div><Status value={x.status}/></div>)}</div></div>; }
