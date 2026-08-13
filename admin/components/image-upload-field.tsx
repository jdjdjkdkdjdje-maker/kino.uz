'use client';

import { api } from '@/lib/api';
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export function ImageUploadField({ label, folder, value, onChange, required = false }: { label: string; folder: 'posters'|'banners'|'logos'|'avatars'; value: string; onChange: (url: string) => void; required?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return toast.error("Faqat JPG, PNG yoki WebP rasm yuklang.");
    if (file.size > 8 * 1024 * 1024) return toast.error("Rasm hajmi 8 MB dan oshmasin.");
    setBusy(true);
    try {
      const form = new FormData(); form.append('file', file); form.append('folder', folder);
      const uploaded = await api<{ publicUrl: string }>('/uploads/image', { method: 'POST', body: form });
      onChange(uploaded.publicUrl);
      toast.success("Rasm muvaffaqiyatli yuklandi.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Rasm yuklashda xatolik yuz berdi."); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  return <div>
    <span className="label">{label}{required ? ' *' : ''}</span>
    <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void upload(e.target.files?.[0])}/>
    <div className="overflow-hidden rounded-xl border border-line bg-ink">
      {value ? <img src={value} alt={label} className="h-36 w-full object-cover"/> : <div className="grid h-28 place-items-center text-zinc-700"><ImageIcon size={34}/></div>}
      <div className="flex gap-2 border-t border-line p-2">
        <button type="button" className="btn-secondary flex-1" disabled={busy} onClick={() => input.current?.click()}>{busy ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} {value ? 'Almashtirish' : 'Yuklash'}</button>
        {value && <button type="button" title="Rasmni olib tashlash" className="btn-danger px-3" onClick={() => onChange('')}><Trash2 size={16}/></button>}
      </div>
    </div>
    <input required={required} type="url" className="input mt-2" placeholder="yoki https:// rasm manzili" value={value} onChange={(e) => onChange(e.target.value)}/>
  </div>;
}
