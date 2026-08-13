# Ayran Gurmesi

Ayran Gurmesi, içtiğiniz ayranları kaydedebileceğiniz, kategori ve tat profiline göre filtreleyebileceğiniz, sıralayabileceğiniz ve Supabase Storage üzerinden fotoğraf ekleyebileceğiniz bir Next.js uygulamasıdır.

## Özellikler

- Ayran kaydı oluşturma, düzenleme ve silme
- Kategori bazlı filtreleme: Yaygın, Market Markası, Yöresel
- Ekşi / ekşi olmayan ayranlara göre filtreleme
- Sürükle-bırak ile liste sıralama (otomatik kaydedilir)
- Supabase veritabanı ile veri saklama
- Supabase Storage ile fotoğraf yükleme (kayıt silinince fotoğraf da temizlenir)
- Masaüstünde kenar çubuğu + yan panel, mobilde tam ekran akış

## Teknolojiler

- Next.js 16.2.7
- React 19.2.4
- TypeScript
- Supabase
- ESLint

## Kurulum

1. Depoyu klonlayın veya mevcut klasöre geçin:

```bash
git clone <repo-url>
cd ayran-gurmesi
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

## Ortam Değişkenleri

Uygulamayı çalıştırmadan önce Supabase bağlantı bilgilerini ayarlayın. Proje kökünde `.env.local` oluşturun ve aşağıdaki değerleri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> Supabase URL ve anon key bilgilerini Supabase projenizden alın.

## Çalıştırma

Geliştirme sunucusunu başlatmak için:

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Proje Yapısı

- `src/app/page.tsx`: Uygulama kabuğu, listeleme, filtreleme ve sürükle-bırak sıralama
- `src/components/Sidebar.tsx`: Masaüstü kenar çubuğu (navigasyon, kategori filtreleri, istatistik)
- `src/components/AyranRow.tsx`: Liste satırı ve sürüklenebilir varyantı
- `src/components/AyranForm.tsx`: Ayran ekleme / düzenleme paneli
- `src/lib/ayranlar.ts`: Supabase CRUD, sıralama ve fotoğraf işlemleri
- `src/lib/sort.ts`: Ortak sıralama mantığı
- `src/lib/supabase.ts`: Supabase istemcisi yapılandırması
- `src/types/ayran.ts`: Ayran veri tipleri ve kategori tanımları
- `src/app/globals.css`: Uygulama stil dosyası

## Supabase Yapılandırması

Bu projede Supabase veritabanı ve Storage kullanılır.

- Veritabanında `ay_ayranlar` adlı tablo olmalıdır.
- Storage içinde `ayran` adlı bir bucket oluşturulmalı ve kamuya açık erişime izin verilmelidir.

### Önerilen tablo alanları

- `id` (uuid veya text)
- `created_at` (timestamp)
- `marka` (text)
- `urun_adi` (text)
- `kategori` (text)
- `eksi_mi` (boolean)
- `market_adi` (text)
- `yore` (text)
- `fotograf_url` (text)
- `sira` (integer)

## Üretim

Üretim build'i almak ve uygulamayı çalıştırmak için:

```bash
npm run build
npm run start
```

## Notlar

- `.env.local` dosyasını `.gitignore` içinde tutun.
- `src/lib/supabase.ts` doğrudan ortam değişkenlerine güveniyor; eksik ise uygulama çalışmaz.
- `updateAyranlarSira` fonksiyonu sıralama değişikliklerini Supabase’e kaydeder.

Eğer istersen, Supabase tablo şemasını ve deploy adımlarını README içinde daha ayrıntılı hale getirebilirim.