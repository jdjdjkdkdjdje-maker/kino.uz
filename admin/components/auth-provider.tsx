'use client';

import { api } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

type User={id:string;name:string;email?:string;role:'ADMIN'|'USER';adminRole?:'SUPER_ADMIN'|'ADMIN'|'MODERATOR'|null;avatarUrl?:string};
type AuthValue={user:User|null;ready:boolean;login:(identifier:string,password:string)=>Promise<void>;logout:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);

export function AuthProvider({children}:{children:React.ReactNode}){
  const[user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false);const router=useRouter(),pathname=usePathname();
  useEffect(()=>{(async()=>{try{const current=await api<User>('/users/me');if(current.role==='ADMIN')setUser(current);}catch{}finally{setReady(true)}})()},[]);
  useEffect(()=>{if(ready&&!user&&pathname!=='/login')router.replace('/login');if(ready&&user&&pathname==='/login')router.replace('/')},[ready,user,pathname,router]);
  async function login(identifier:string,password:string){await api('/auth/admin/login',{method:'POST',body:JSON.stringify({identifier,password})});const current=await api<User>('/users/me');if(current.role!=='ADMIN')throw new Error("Admin huquqi talab qilinadi.");setUser(current);router.replace('/')}
  async function logout(){try{await api('/auth/logout',{method:'POST',body:'{}'})}catch{}setUser(null);router.replace('/login')}
  return <AuthContext.Provider value={{user,ready,login,logout}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider topilmadi');return value}
