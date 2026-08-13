import type{Metadata}from'next';import'./globals.css';import{AuthProvider}from'@/components/auth-provider';import{AdminShell}from'@/components/admin-shell';import{Toaster}from'sonner';
export const metadata:Metadata={title:'KinoTV — Admin panel',description:'KinoTV kontent boshqaruvi'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body><AuthProvider><AdminShell>{children}</AdminShell><Toaster richColors position="top-right"/></AuthProvider></body></html>}
