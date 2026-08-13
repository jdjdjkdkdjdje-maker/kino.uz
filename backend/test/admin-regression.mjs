const API=process.env.API_URL||'http://localhost:4000/api/v1';
const email=process.env.ADMIN_EMAIL||'admin@kinotv.uz';
const password=process.env.ADMIN_PASSWORD||'KinoTV_Admin_2026!';
let token,passed=0;
const check=(ok,name)=>{if(!ok)throw new Error(name);passed++;console.log(`✓ ${name}`)};
const request=async(path,options={})=>{const headers=new Headers(options.headers);if(token)headers.set('authorization',`Bearer ${token}`);if(options.body&&!(options.body instanceof FormData)&&!headers.has('content-type'))headers.set('content-type','application/json');const response=await fetch(API+path,{...options,headers});const text=await response.text();if(!response.ok)throw new Error(`${path}: ${response.status} ${text}`);return text?JSON.parse(text):null};
try{
 const auth=await request('/auth/admin/login',{method:'POST',body:JSON.stringify({identifier:email,password})});token=auth.accessToken;check(Boolean(token),'Admin JWT login');
 const me=await request('/users/me');check(me.role==='ADMIN'&&me.adminRole==='SUPER_ADMIN','SUPER ADMIN permission profili');
 const dashboard=await request('/admin/dashboard');check(['favorites','activeChannels','inactiveChannels','todayMovies'].every(k=>k in dashboard.totals),'Kengaytirilgan dashboard');
 const stats=await request('/admin/statistics');check(stats.views&&Array.isArray(stats.dailyViews)&&Array.isArray(stats.userGrowth),'Kunlik/haftalik/oylik statistika');
 const settings=await request('/admin/settings');check(settings.appName==='KinoTV','Database app sozlamalari');
 await request('/admin/settings',{method:'PUT',body:JSON.stringify({appName:'KinoTV',homeBanners:settings.homeBanners||[],about:settings.about,maintenanceMode:false,notificationsEnabled:true})});check(true,'Sozlamalarni saqlash');
 const home=await request('/home');check(home.appSettings?.appName==='KinoTV','Android home API sozlamalar aloqasi');
 const movies=await request('/admin/movies?status=ACTIVE&language=Ingliz%20tili&limit=5');check(Array.isArray(movies.data),'Kino professional filtrlari');
 const channels=await request('/admin/channels?status=ACTIVE&limit=5');check(Array.isArray(channels.data),'Kanal professional filtrlari');
 const users=await request('/admin/users?limit=5');check(users.data.every(u=>!('passwordHash'in u)),'Parol ma’lumoti API javobida yo‘q');
 const form=new FormData();form.append('folder','logos');form.append('file',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'regression.png');const uploaded=await request('/uploads/image',{method:'POST',body:form});const image=await fetch(uploaded.publicUrl);check(image.ok&&image.headers.get('content-type')==='image/png','Rasm upload va public preview');
 const history=await request('/admin/notifications');check(Array.isArray(history),'Bildirishnoma audit jurnali');
 console.log(`\nADMIN_REGRESSION_OK ${passed}/12`);
}catch(error){console.error(error);process.exit(1)}
