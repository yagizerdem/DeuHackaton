# Plant Protection Assistant

Bitki fotoğrafından tür tanıma, zararlı/hastalık değerlendirmesi ve bilgi tabanı (RAG) destekli koruma önerisi üreten web uygulaması. Yanında orman yangını tehlikesini gösteren 2B risk haritası bulunur.

> Depark Hackaton projesi. Monorepo: React arayüzü, Express API'si ve Docker'da çalışan Flask tabanlı RAG servisi.

## İçindekiler

- [Proje kapsamı](#proje-kapsamı)
- [Mimari](#mimari)
- [Teknolojiler](#teknolojiler)
- [Repo yapısı](#repo-yapısı)
- [Kurulum](#kurulum)
- [Ortam değişkenleri](#ortam-değişkenleri)
- [API uç noktaları](#api-uç-noktaları)
- [RAG servisi](#rag-servisi)
- [Maliyet](#maliyet)
- [Geliştirme notları](#geliştirme-notları)
- [Bilinen sınırlamalar](#bilinen-sınırlamalar)
- [Lisans](#lisans)

## Proje kapsamı

**Problem:** Bitki sağlığı kararları (bir zararlıdan şüphelenmek, karantina listesindeki bir türü bildirmek, ne zaman müdahale etmek) dağınık kaynaklara dayanır: EPPO listeleri, bakanlık talimatları, akademik rehberler. Saha kullanıcısı için bunları hızlı ve izlenebilir şekilde bir araya getirmek zordur.

**Çözüm:** Kullanıcı bir bitki fotoğrafı yükler. Sistem iki ayrı sonuç üretir ve yan yana gösterir:

1. **Standart analiz:** Görsel Gemini ile yorumlanır (tür, belirtiler, şüpheli zararlı/hastalık, istilacı tehditler) ve bir risk değerlendirmesi üretilir (şiddet, aciliyet, yayılma riski, uygulama planı, izleme, yetkililere bildirim gerekliliği).
2. **Bilgi tabanı analizi:** Aynı tanıdan bir arama sorgusu kurulur, PDF bilgi tabanından (EPPO veri sayfaları, T.C. Tarım ve Orman Bakanlığı talimatları, FAO rehberleri vb.) ilgili sayfalar getirilir ve risk değerlendirmesi bu sayfalara dayandırılır.

### Özellikler

- **Görsel analizi:** tek görsel yükleme (JPEG, PNG, WebP, HEIC/HEIF, en fazla 10 MB), yapılandırılmış JSON çıktı.
- **RAG destekli değerlendirme:** özet temelli arama (multi-vector yaklaşımı): sayfanın özeti aranır, ham sayfa metni getirilir.
- **Kimlik doğrulama:** kayıt, giriş, çıkış, token yenileme; access + refresh JWT, refresh token rotasyonu ve yeniden kullanım tespitinde aile iptali.
- **2B risk haritası** (`/2dmap`): Leaflet üzerinde [GWIS](https://gwis.jrc.ec.europa.eu/) WMS katmanları (yangın hava indeksi vb.).
- **API dokümantasyonu:** Swagger UI (`/api-docs`).
- **Koyu/açık tema** ve Stitch tasarımından uyarlanmış arayüz.

## Mimari

```mermaid
flowchart LR
    U[Kullanıcı] --> W[Web<br/>React + Vite :5000]
    W -->|/api| B[Backend<br/>Express :3000]
    B --> M[(MongoDB)]
    B -->|görsel analizi, risk değerlendirmesi| G[Gemini API]
    B -->|/query| R[RAG<br/>Flask :5001]
    R --> C[(Chroma<br/>kalıcı volume)]
    R -->|özet + embedding| G
```

**Bir `/api/plan-analysis/rag` isteğinin akışı:**

1. Backend görseli Gemini'ye gönderir, yapılandırılmış tanıyı alır.
2. Tanıdan arama sorgusu kurulur (tür adı + şüpheli zararlılar + belirtiler).
3. RAG servisi sorguyu embed eder, Chroma'dan en yakın sayfaları döner.
4. Backend bu sayfaları bağlam olarak vererek Gemini'ye risk değerlendirmesi yaptırır.

Getirilen sayfalar yalnızca değerlendirmeyi besler, API yanıtında **döndürülmez**.

## Teknolojiler

| Katman | Teknolojiler |
|---|---|
| Web | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Base UI), React Router, TanStack Query, Axios, Leaflet |
| Backend | Node.js, Express 5, TypeScript (NodeNext ESM), Mongoose 9, JWT, bcrypt, Zod 4, Multer, swagger-jsdoc, `@google/genai` |
| RAG | Python 3.12, Flask + Gunicorn, ChromaDB, pypdf, `google-genai` |
| Modeller | Gemini 3.8 Flash (analiz/özetleme), `gemini-embedding-2` (768 boyut, embedding) |
| Altyapı | Docker Compose (MongoDB, Mongo Express, RAG), npm workspaces |

## Repo yapısı

```
.
├── apps/
│   ├── backend/        Express API (auth, görsel analizi, RAG istemcisi, Swagger)
│   └── web/            React arayüzü
├── packages/
│   ├── shared/         ApiResponse, HttpStatusCode, ortak tipler
│   ├── validators/     Zod şemaları (kayıt, giriş)
│   └── dto/            API yanıt tipleri
├── rag/                Flask RAG servisi (Dockerfile, ingest.py, app.py)
│   ├── data/           Bilgi tabanı PDF'leri (git'e girmez)
│   └── model.ipynb     İlk RAG denemesi (Colab not defteri)
├── docs/               GWIS WMS capabilities
├── plant_id/           Plant.id API deneme betikleri
├── compose.yaml        MongoDB, Mongo Express, RAG
└── tsconfig.base.json
```

## Kurulum

### Gereksinimler

- Node.js 22 (geliştirme ortamı v22.23) ve npm
- Docker Desktop (MongoDB ve RAG için)
- Bir **Gemini API anahtarı** ([Google AI Studio](https://aistudio.google.com/)), faturalandırma etkin

### 1. Depoyu klonla ve bağımlılıkları kur

```bash
git clone https://github.com/yagizerdem/DeuHackaton.git
cd DeuHackaton
npm install
```

### 2. Ortak paketleri derle

Paketler `dist` klasöründen çalışır. Klonladıktan sonra ve paket kodunu her değiştirdiğinde:

```bash
npx tsc -b packages/shared packages/validators packages/dto
```

### 3. Ortam dosyalarını oluştur

Bu dosyalar `.gitignore`'dadır, kendin oluşturman gerekir. Değişkenlerin anlamı [aşağıdaki tabloda](#ortam-değişkenleri).

**`apps/backend/.env.dev`**

```env
PORT=3000
MONGODB_URI=mongodb://user:1234@localhost:27017/depark-hackaton?authSource=admin
JWT_SECRET=<uzun rastgele bir değer>
JWT_Issuer=depark-hackaton
JWT_Audience=depark-hackaton-users
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=60d
CORS_ORIGIN=http://localhost:5000
GEMINI_API_KEY=<anahtarın>
```

**`apps/web/.env`**

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**`rag/.env`**

```env
GOOGLE_API_KEY=<anahtarın>
```

### 4. Docker servislerini başlat

```bash
docker compose up -d --build
```

| Servis | Adres |
|---|---|
| MongoDB | `localhost:27017` |
| Mongo Express | http://localhost:8081 |
| RAG (Flask) | http://localhost:5001 |

> `compose.yaml` içindeki MongoDB parolaları (`user` / `1234`) yalnızca yerel geliştirme içindir. Sunucuya çıkmadan önce değiştir.

### 5. Bilgi tabanını oluştur (isteğe bağlı ama RAG için gerekli)

PDF'leri `rag/data/` içine koy, sonra indeksle:

```bash
docker compose run --rm rag python ingest.py
docker compose restart rag
```

Ayrıntılar ve maliyet için [RAG servisi](#rag-servisi) ve [Maliyet](#maliyet) bölümlerine bak. İndeks boşsa `/query` 503 döner ve `/api/plan-analysis/rag` çalışmaz.

### 6. Geliştirme sunucularını çalıştır

İki ayrı terminalde:

```bash
npm run dev -w @DeparkHackaton/backend   # http://localhost:3000
npm run dev -w @DeparkHackaton/web       # http://localhost:5000
```

Sonra:

- Uygulama: http://localhost:5000
- Swagger UI: http://localhost:3000/api-docs
- Sağlık kontrolü: http://localhost:3000/health

VS Code kullanıyorsan `.vscode/launch.json` içinde backend için bir hata ayıklama yapılandırması var.

### Üretim derlemesi

```bash
npm run build -w @DeparkHackaton/backend   # tsc + tsc-alias
npm run start -w @DeparkHackaton/backend   # NODE_ENV=production, .env.prod okur
```

`.env.prod`, `.env.dev` ile aynı değişkenleri içermelidir. Özellikle `CORS_ORIGIN` (üretimdeki web adresi), `GEMINI_API_KEY` ve gerekiyorsa `RAG_URL` eklenmelidir; bunlar olmadan CORS varsayılana düşer ve görsel analizi çalışmaz.

## Ortam değişkenleri

### Backend (`apps/backend/.env.dev` / `.env.prod`)

| Değişken | Açıklama |
|---|---|
| `PORT` | API portu |
| `MONGODB_URI` | MongoDB bağlantı adresi |
| `JWT_SECRET` | JWT imzalama anahtarı |
| `JWT_Issuer`, `JWT_Audience` | JWT `iss` ve `aud` değerleri |
| `ACCESS_TOKEN_EXPIRATION`, `REFRESH_TOKEN_EXPIRATION` | Token ömürleri (`15m`, `60d` gibi) |
| `CORS_ORIGIN` | İzinli origin'ler, virgülle ayrılmış (varsayılan `http://localhost:5000`) |
| `GEMINI_API_KEY` | Görsel analizi ve risk değerlendirmesi için |
| `RAG_URL` | RAG servisi adresi (varsayılan `http://localhost:5001`) |

### Web (`apps/web/.env`)

| Değişken | Açıklama |
|---|---|
| `VITE_API_BASE_URL` | API tabanı, `/api` ile biter |

### RAG (`rag/.env`)

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `GOOGLE_API_KEY` (veya `GEMINI_API_KEY`) | | Özetleme ve embedding için |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Sayfa özetleme modeli |
| `EMBEDDING_MODEL` | `gemini-embedding-2` | Embedding modeli |
| `EMBEDDING_DIMS` | `768` | Vektör boyutu |
| `INGEST_WORKERS` | `16` | Paralel özetleme çağrıları |
| `EMBED_WORKERS` | `8` | Paralel embedding çağrıları |
| `AUTO_INGEST` | kapalı | `1` olursa konteyner her açılışta indeksler |

`rag/.env` içindeki `PROJECT_ID`, `REGION` gibi değerleri yalnızca `rag/model.ipynb` kullanır.

## API uç noktaları

Tüm yanıtlar `{ httpStatusCode, message, data?, formErrors? }` biçimindedir. Ayrıntılı şemalar Swagger UI'da.

| Metot | Yol | Auth | Açıklama |
|---|---|---|---|
| GET | `/health` | | Servis ve veritabanı durumu |
| GET | `/api-docs` | | Swagger UI |
| POST | `/api/auth/register` | | Kayıt |
| POST | `/api/auth/login` | | Giriş (token çifti + cookie) |
| POST | `/api/auth/logout` | | Çıkış (cookie'leri siler) |
| POST | `/api/auth/refresh` | | Token yenileme (rotasyon) |
| GET | `/api/auth/me` | ✔ | Oturum açmış kullanıcı |
| POST | `/api/plan-analysis` | ✔ | Görsel analizi + risk değerlendirmesi |
| POST | `/api/plan-analysis/rag` | ✔ | Aynısı, bilgi tabanına dayalı değerlendirme |

Görsel uç noktaları `multipart/form-data` ile tek bir `image` alanı bekler:

```bash
curl -X POST http://localhost:3000/api/plan-analysis/rag \
  -H "Authorization: Bearer <accessToken>" \
  -F "image=@yaprak.jpg"
```

Hata kodları: `401` yetkisiz, `413` görsel 10 MB'dan büyük, `415` desteklenmeyen tür, `503` Gemini veya RAG servisine ulaşılamıyor.

## RAG servisi

`rag/` klasörü bağımsız bir Flask uygulamasıdır. Buradaki "eğitim" model eğitimi değil, **indekslemedir**: hiçbir model ağırlığı değişmez.

### İndeksleme (`ingest.py`)

`rag/data/` altındaki her PDF'in her sayfası için:

1. `pypdf` ile metin çıkarılır (OCR yoktur, metni çıkarılamayan sayfalar atlanır).
2. Gemini sayfayı yapılandırılmış bir İngilizce özete çevirir (`rag/prompts.py`).
3. Özet `gemini-embedding-2` ile vektöre çevrilir.
4. Vektör, ham sayfa metni ve özet Chroma'ya yazılır.

Arama **özet üzerinden** yapılır, geri dönen şey **ham sayfa metnidir**. Sayfa kimliği `dosya adı + sayfa no` olduğundan, indekslenmiş sayfalar atlanır ve komut güvenle yeniden çalıştırılabilir. Özetler 16 paralel çağrıyla üretilir; hata alan sayfa atlanır, sonraki çalıştırmada tekrar denenir.

> Bir PDF'in içeriğini değiştirirsen sayfa kimliği aynı kaldığından eski özet kalır. Dosyayı yeniden adlandır veya `rag_chroma` volume'unu silip baştan indeksle.

### Sorgu

```bash
curl -X POST http://localhost:5001/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Ceratocystis platani nasıl yayılır", "k": 5}'
```

Yanıt: `results[]` içinde `source`, `page`, `score` (benzerlik), `summary` ve `text`. `k` 1 ile 20 arasındadır.

### Kalıcılık

İndeks `rag_chroma` adlı Docker volume'unda tutulur. Konteyneri silmek, yeniden başlatmak veya image'ı yeniden derlemek indeksi silmez. **`docker compose down -v` silmeye yol açar** (MongoDB verisi de aynı şekilde gider).

### Bilgi tabanı kaynakları

PDF'ler `.gitignore`'dadır ve repoda yoktur. Hazırlanan bilgi tabanı şu kaynaklardan oluşur:

- **EPPO:** A1/A2 karantina listeleri ve çeşitli zararlı veri sayfaları (*Anoplophora*, *Ceratocystis platani*, *Rhynchophorus ferrugineus*, *Xylella fastidiosa*, *Popillia japonica* vb.)
- **T.C. Tarım ve Orman Bakanlığı:** bildirimi zorunlu zararlı listesi, zeytin entegre mücadele talimatı, palmiye kırmızı böceği talimatları
- **Orman Genel Müdürlüğü:** 305 sayılı tebliğ (orman zararlıları ile mücadele)
- **FAO:** ormancılıkta fitosaniter standartlar rehberi ve IPM kılavuzları
- Üniversite ders notları ve açık erişimli makaleler

Kendi belgelerini `rag/data/` içine koyup yukarıdaki indeksleme komutunu çalıştırarak bilgi tabanını genişletebilirsin. Kullandığın belgelerin yeniden dağıtım şartlarını kontrol et.

## Maliyet

Gemini kullanımı ücretlidir. Aşağıdakiler, fiyat derleme sitelerindeki rakamlara göre **tahmindir** (resmî Google fiyat sayfasıyla doğrulanmadı):

- Sayfa indeksleme: yaklaşık **$0,008 / sayfa**. Bunun ~%95'i özetleme, embedding payı çok küçüktür. Düşünme (thinking) token'ları bu hesaba dahil değildir, maliyeti artırabilir.
- Her `/api/plan-analysis/rag` isteği Gemini'yi **3 kez** çağırır (görsel analizi, soru embedding'i, risk değerlendirmesi). Arayüzde "Analyze plant" iki kutuyu birden çalıştırdığı için toplam 5 çağrı yapar.
- Bakiye bittiğinde Gemini `402 RESOURCE_EXHAUSTED` döner. Bu durumda indeksleme yarıda durur ve API uç noktaları `503` verir. İndeksleme otomatik değildir, bu yüzden bakiye bitse bile konteyner kredi harcamaz.

## Geliştirme notları

- **Paket derlemesi:** `packages/*` içeriği `dist` üzerinden tüketilir. Bir paketteki dosyayı değiştirince `npx tsc -b packages/shared packages/validators packages/dto` yeniden çalıştırılmalıdır. Kök dizindeki `npm run dev` (`tsc -b --watch`) paketleri izlemez.
- **Yol takma adları:** backend `@/*`, `@utils/*`, `@services/*` gibi alias'lar kullanır. Geliştirmede `tsx`, derlemede `tsc-alias` çözer. `tsx` tip denetimi yapmaz, `npm run type-check -w @DeparkHackaton/backend` çalıştır.
- **Ortam dosyaları geç yüklenir:** backend `.env` dosyasını `server.ts` içinde, import'lar değerlendirildikten sonra okur. Bu yüzden env değişkenleri modül yüklenirken değil, çağrı anında okunmalıdır.
- **Arayüz tasarımı:** Google Stitch projesinden türetilen tasarım jetonları `apps/web/src/index.css` içinde `stitch-*` değişkenleri olarak tanımlıdır. Bileşenler `apps/web/src/components/` altındadır, yeniden kullanılabilir shadcn/ui bileşenleri `components/ui/` içindedir. Ayrıntılar için `AGENTS.md` ve `DESIGN-*.md` dosyalarına bak.
- **Commit mesajları:** Conventional Commits (`feat(web): ...`, `fix(backend): ...`).

## Bilinen sınırlamalar

- **RAG alaka eşiği yok:** sistem her zaman en yakın sayfaları getirir, ne kadar uzak olursa olsun. Korpusta olmayan bir bitki (ör. palmiye) için alakasız sayfalar (skor ~0,52) değerlendirmeye karışabilir. Gerçek eşleşmelerde skor ~0,70 ve üzeridir.
- **Korpus kapsamı sınırlı:** çınar, *Anoplophora*, orman zararlıları ve zeytin ağırlıklıdır. Kapsam dışı bitkilerde bilgi tabanı katkı sağlamaz.
- **OCR yok:** taranmış (görsel) PDF sayfaları indekslenmez.
- **Değerlendirme ölçülmedi:** RAG için Recall@k, MRR ve faithfulness gibi metrikler henüz ölçülmedi.
- **Çift Gemini çağrısı:** iki sonuç kutusu aynı görseli ayrı ayrı analiz eder, bu maliyeti ve süreyi artırır.
- **Web derlemesi:** `npm run build -w @DeparkHackaton/web`, `components/ui/scroll-area.tsx` içindeki kullanılmayan `React` import'u yüzünden `TS6133` hatası verir.
- **Test yok:** otomatik test takımı bulunmuyor.
- **Yanıtın doğruluğu:** çıktılar bir karar destek aracıdır, uzman görüşünün veya resmî bildirimin yerine geçmez.

## Lisans

MIT, bkz. [License.txt](License.txt).
