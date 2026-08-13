export type ApiError={statusCode:number;message:string|string[];path?:string};
const BASE='/backend-api';
export async function api<T=any>(path:string,options:RequestInit={}):Promise<T>{
  const headers=new Headers(options.headers);
  if(!(options.body instanceof FormData)&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');
  let response:Response;
  try{response=await fetch(`${BASE}${path}`,{...options,headers,cache:'no-store',credentials:'same-origin'});}catch{throw new Error('Server bilan bog‘lanib bo‘lmadi.');}
  if(!response.ok){let body:ApiError={statusCode:response.status,message:response.status===401?'Sessiya tugadi. Qayta kiring.':'Server bilan bog‘lanib bo‘lmadi.'};try{body=await response.json()}catch{}throw new Error(Array.isArray(body.message)?body.message.join(', '):body.message)}
  if(response.status===204)return undefined as T;
  return response.json();
}
export const qs=(values:Record<string,string|number|boolean|undefined>)=>{const p=new URLSearchParams();Object.entries(values).forEach(([k,v])=>{if(v!==undefined&&v!=='')p.set(k,String(v))});return p.toString()};
