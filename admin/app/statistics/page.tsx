'use client';

import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { CalendarDays, CalendarRange, Eye, UserPlus } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ErrorState, fmt, Loading, PageHeader } from '@/components/ui';

export default function Statistics() {
  const [data, setData] = useState<any>(); const [error, setError] = useState('');
  const load = () => api('/admin/statistics').then(setData).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);
  if (error) return <ErrorState message={error} retry={load}/>;
  if (!data) return <Loading/>;
  const movieChart = data.topMovies.map((x:any) => ({ name: x.title.length > 14 ? `${x.title.slice(0,14)}…` : x.title, views: Number(x.viewCount) }));
  const daily = data.dailyViews.map((x:any) => ({ date: new Date(x.date).toLocaleDateString('uz-UZ',{day:'2-digit',month:'2-digit'}), views: x.views }));
  const growth = data.userGrowth.map((x:any) => ({ date: new Date(x.date).toLocaleDateString('uz-UZ',{day:'2-digit',month:'2-digit'}), users: x.users }));
  const cards = [['Kunlik ko‘rishlar',data.views.daily,Eye],['Haftalik ko‘rishlar',data.views.weekly,CalendarDays],['Oylik ko‘rishlar',data.views.monthly,CalendarRange],['Yangi foydalanuvchilar',data.newUsers,UserPlus]] as const;
  return <>
    <PageHeader title="Statistika" description={`Platforma analitikasi — so‘nggi ${data.period}`}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon]) => <div className="card p-5" key={label}><Icon className="mb-4 text-brand-400"/><p className="text-sm text-zinc-500">{label}</p><p className="mt-1 text-3xl font-bold">{fmt(value)}</p></div>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><Chart title="Kunlar bo‘yicha ko‘rishlar"><LineChart data={daily}><CartesianGrid stroke="#242936" vertical={false}/><XAxis dataKey="date" stroke="#71717a" fontSize={10}/><YAxis stroke="#71717a" fontSize={10}/><Tooltip contentStyle={tip}/><Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3}/></LineChart></Chart><Chart title="Foydalanuvchilar o‘sishi"><LineChart data={growth}><CartesianGrid stroke="#242936" vertical={false}/><XAxis dataKey="date" stroke="#71717a" fontSize={10}/><YAxis stroke="#71717a" fontSize={10}/><Tooltip contentStyle={tip}/><Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={3}/></LineChart></Chart></div>
    <div className="card mt-6 p-5"><h2 className="section-title mb-6">Eng mashhur kinolar</h2><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={movieChart}><CartesianGrid stroke="#242936" vertical={false}/><XAxis dataKey="name" stroke="#71717a" fontSize={10}/><YAxis stroke="#71717a" fontSize={10}/><Tooltip contentStyle={tip}/><Bar dataKey="views" fill="#8b5cf6" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-3"><Ranking title="Top kinolar" rows={data.topMovies} keyName="title" value="viewCount"/><Ranking title="Top telekanallar" rows={data.topChannels} keyName="name" value="viewCount"/><Ranking title="Mashhur kategoriyalar" rows={data.topCategories} keyName="name" value="count"/></div>
  </>;
}
const tip={background:'#12151c',border:'1px solid #242936',borderRadius:12};
function Chart({title,children}:{title:string;children:React.ReactElement}) { return <div className="card p-5"><h2 className="section-title mb-6">{title}</h2><div className="h-72"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></div>; }
function Ranking({title,rows,keyName,value}:{title:string;rows:any[];keyName:string;value:string}) { return <div className="card p-5"><h2 className="section-title mb-4">{title}</h2><div className="space-y-2">{rows.map((x,i) => <div className="flex items-center justify-between rounded-xl bg-white/[.025] p-3" key={x.id}><span className="min-w-0 truncate"><b className="mr-3 text-brand-400">{i+1}</b>{x[keyName]}</span><span className="text-sm text-zinc-500">{fmt(x[value])}</span></div>)}</div></div>; }
