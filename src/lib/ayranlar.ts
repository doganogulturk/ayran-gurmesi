import { supabase } from './supabase';
import { AyranEntry } from '../types/ayran';

const TABLE = 'ay_ayranlar';

export async function getAyranlar(): Promise<AyranEntry[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('sira', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as AyranEntry[];
}

export async function createAyran(
  entry: Omit<AyranEntry, 'id' | 'created_at'>
): Promise<AyranEntry> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data as AyranEntry;
}

export async function updateAyran(
  id: string,
  entry: Partial<Omit<AyranEntry, 'id' | 'created_at'>>
): Promise<AyranEntry> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(entry)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AyranEntry;
}

export async function deleteAyran(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function updateAyranlarSira(
  updates: { id: string; sira: number }[]
): Promise<void> {
  const promises = updates.map(u =>
    supabase.from(TABLE).update({ sira: u.sira }).eq('id', u.id)
  );
  const results = await Promise.all(promises);
  for (const r of results) {
    if (r.error) throw r.error;
  }
}

export async function uploadFotograf(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('ayran')
    .upload(fileName, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from('ayran')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
