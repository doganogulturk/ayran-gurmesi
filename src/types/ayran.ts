export type Kategori = 'yaygin_market' | 'market_markasi' | 'yoresel';

export interface AyranEntry {
  id: string;
  created_at?: string;
  marka: string;
  urun_adi?: string | null;
  kategori: Kategori;
  eksi_mi: boolean;
  market_adi?: string | null;  // Yalnızca market_markasi kategorisi için
  yore?: string | null;         // Yalnızca yoresel kategorisi için
  icme_tarihi?: string | null;
  fotograf_url?: string | null;
  sira?: number;
}

export const kategoriler: Kategori[] = ['yaygin_market', 'market_markasi', 'yoresel'];

export const kategoriEtiketleri: Record<Kategori, string> = {
  yaygin_market: 'Yaygın',
  market_markasi: 'Market Markası',
  yoresel: 'Yöresel',
};

export const kategoriRenkleri: Record<Kategori, string> = {
  yaygin_market: 'hsl(199, 89%, 48%)',   // Mavi
  market_markasi: 'hsl(38, 92%, 50%)',   // Altın/Turuncu
  yoresel: 'hsl(142, 70%, 45%)',         // Yeşil
};
