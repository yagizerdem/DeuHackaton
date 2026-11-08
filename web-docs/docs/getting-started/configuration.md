---
title: Ortam değişkenleri ve yapılandırma
---

## Backend

Geliştirme için `apps/backend/.env.dev` örneği:

```dotenv
PORT=3000
MONGODB_URI=mongodb://user:1234@localhost:27017/depark-hackaton?authSource=admin
JWT_SECRET=replace-with-a-long-random-secret
JWT_Issuer=depark-hackaton
JWT_Audience=depark-hackaton-users
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=60d
CORS_ORIGIN=http://localhost:5000
GEMINI_API_KEY=replace-with-your-key
RAG_URL=http://localhost:5001
```

MongoDB kimlik bilgileri mevcut Compose dosyasının yerel geliştirme değerleridir. Üretim yapılandırması olarak değerlendirilmemelidir.

| Değişken | Davranış |
|---|---|
| `PORT`, `MONGODB_URI` | Yoksa backend başlangıçta hata verir. |
| `JWT_SECRET` | Access ve refresh JWT imzalama/doğrulamada kullanılır. |
| `JWT_Issuer`, `JWT_Audience` | Büyük/küçük harfleriyle tam bu isimler kullanılır. |
| `ACCESS_TOKEN_EXPIRATION`, `REFRESH_TOKEN_EXPIRATION` | Örnek süreler `15m` ve `60d`; zorunludur. |
| `CORS_ORIGIN` | Virgülle ayrılmış origin listesi; varsayılan `http://localhost:5000`. |
| `GEMINI_API_KEY` | Görsel tanı ve risk değerlendirmesi; yoksa ilgili çağrılar 503 olur. |
| `RAG_URL` | Varsayılan `http://localhost:5001`. Backend konteynerdeyse servis adresi farklı olmalıdır. |

`NODE_ENV=development` geliştirme dosyasını, `production` üretim dosyasını seçer. Env dosyası modüller import edildikten sonra yüklenir; Gemini ve JWT ayarlarının çağrı anında okunması bu yüzden önemlidir.

Üretimde derlenmiş `read-env.js` yolu nedeniyle env dosyası çözümlemesini ayrıca kontrol edin. Mevcut `start:local` komutu `node --env-file=.env.prod` ile paket kökündeki dosyayı yükler. Diğer ortamlar için değerleri süreç ortamına vermek mümkündür. Bkz. [dağıtım](../operations/deployment.md).

## React web uygulaması

`apps/web/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
# İsteğe bağlı:
VITE_CESIUM_ION_TOKEN=replace-with-your-public-scoped-token
```

`VITE_API_BASE_URL` sonunda `/api` bulunmalıdır. Vite değişkenleri istemci paketine gömülür. Gemini ve JWT anahtarlarını burada tanımlamayın. Env değişince Vite sunucusunu yeniden başlatın; üretimde yeniden derleyin.

Cesium ion token'ı olmadığında küre OSM görüntüsü ve elipsoid ile çalışır. Gerçek Cesium arazisi ve ion varlıkları token gerektirir; arazi sayısal analizi Open-Meteo yüksekliğine geri dönebilir.

## Python RAG servisi

`rag/.env`:

```dotenv
GOOGLE_API_KEY=replace-with-your-key
GEMINI_MODEL=gemini-3.8-flash
EMBEDDING_MODEL=gemini-embedding-2
EMBEDDING_DIMS=768
INGEST_WORKERS=16
EMBED_WORKERS=8
AUTO_INGEST=0
```

| Değişken | Varsayılan | Etkisi |
|---|---|---|
| `GOOGLE_API_KEY` | Yok | Python istemcisinin ilk tercihi; yoksa `GEMINI_API_KEY` aranır. |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Yalnızca sayfa özeti; backend'deki model sabitini değiştirmez. |
| `EMBEDDING_MODEL`, `EMBEDDING_DIMS` | `gemini-embedding-2`, `768` | Koleksiyon adını ve vektör uzayını belirler. |
| `INGEST_WORKERS` | `16` | Aynı anda çalışan özetleme işleri. |
| `EMBED_WORKERS` | `8` | Tek metinlik paralel embedding istekleri. |
| `DATA_DIR` | `/app/data` | PDF kökü. |
| `CHROMA_DIR` | `/app/chroma` | Kalıcı Chroma dizini. |
| `AUTO_INGEST` | Kapalı | `1`, `true`, `yes` değerleri açılışta indeksleme başlatır. |

Python servisi kendi başına dotenv yüklemez; Compose `env_file` değerleri süreç ortamına taşır. Host üzerinde çalıştırırken bu aktarımı kendiniz yapmalısınız. İşçi sayıları pozitif tamsayı olmalıdır; merkezi env doğrulaması yoktur.

## Dokümantasyon yayını

| Değişken | Yerel varsayılan | Açıklama |
|---|---|---|
| `DOCS_URL` | `http://localhost:3001` | Yayında gerçek origin, örneğin `https://docs.example.org`. |
| `DOCS_BASE_URL` | `/` | Alt dizin dağıtımı için başı/sonu slash içeren yol. |

Bu iki değer Docusaurus derleme zamanında okunur. Geliştirme ve önizleme komutları varsayılan olarak 3001 portunu kullanır.
