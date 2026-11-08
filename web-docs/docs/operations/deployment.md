---
title: Derleme, dağıtım ve servis işletimi
---

## Üç ayrı dağıtım çıktısı

| Parça | Çıktı | Çalışma biçimi |
|---|---|---|
| React web | `apps/web/dist` | Statik dosya sunucusu, SPA fallback |
| Express | `apps/backend/dist/src/server.js` | Node.js süreci ve MongoDB bağlantısı |
| Docusaurus | `web-docs/build` | Statik dosya sunucusu |
| RAG | Docker image + `rag_chroma` volume | Gunicorn / Flask |

Mevcut Compose yalnızca MongoDB, Mongo Express ve RAG servisini tanımlar. Web, backend ve dokümantasyon dağıtımını ayrıca kurmak gerekir.

## Uygulama derlemeleri

Depo kökünden:

```bash
npx tsc -b packages/shared packages/validators packages/dto
npm run build -w @DeparkHackaton/backend
npm run build -w @DeparkHackaton/web
```

Backend `tsc` ardından `tsc-alias` çalıştırır. Geliştirme `tsx` sunucusu tam typecheck yerine geçmez; `npm run type-check -w @DeparkHackaton/backend` ayrıca vardır.

## Backend üretim env yolu

Mevcut `readProdEnv`, çalıştırılan modülün bir üst dizininde `.env.prod` arar. Kaynakta bu paket kökü olur; derlemeden sonra modül `dist/src` altında olduğundan çözümleme `dist/.env.prod` yoluna kayar.

Paket kökündeki üretim env dosyasını kullanmak için mevcut komut:

```bash
npm run start:local -w @DeparkHackaton/backend
```

Bu komut `node --env-file=.env.prod` kullanır. Sunucu ortamlarında değişkenleri süreç yöneticisi veya platform üzerinden vermek de mümkündür. `npm run start` komutunun paket kökündeki env dosyasını kendiliğinden bulduğunu varsaymayın.

Üretim cookie'leri Secure olduğu için istemci bağlantısı HTTPS olmalıdır. Gerçek web origin'ini `CORS_ORIGIN` listesine yazın; farklı site cookie kısıtlarını [auth sayfasında](../api/authentication.md) değerlendirin.

## RAG süreleri ve kalıcılık

Gunicorn tek worker ve 300 saniye timeout ile çalışır. Backend Gemini çağrısı 60, RAG fetch çağrısı 120 saniye sınırı kullanır. Proxy sınırları bütün zincirin süresine göre belirlenmelidir; tek bir süreyi sistemin tamamına ait garanti olarak kullanmayın.

MongoDB ve Chroma birbirinden ayrı yedeklenmelidir. Konteyner image'ı kalıcı veri yedeği değildir. PDF kaynaklarını ve kullanılan model/boyut/prompt sürümünü de indeksle birlikte kaydedin.

## Dokümantasyon üretimi

```bash
cd web-docs
npm ci --workspaces=false
npm run typecheck
npm run build
npm run serve
```

PowerShell'de üretim adresi örneği:

```powershell
$env:DOCS_URL = 'https://docs.example.org'
$env:DOCS_BASE_URL = '/'
npm run build
```

Alt dizin dağıtımı için örneğin `DOCS_BASE_URL=/DeuHackaton/` kullanılabilir. Sonunda slash bulunmalıdır. Bu değerleri ayarlamak siteyi yayımlamaz; yalnızca derlemedeki URL'leri oluşturur.

Docusaurus blog eklentisi kapalıdır; dokümanlar kök yola bağlıdır. Üretimde statik sunucunun iç route'ları ve trailing-slash davranışı üretilen dosyalarla uyumlu olmalıdır.

## Sağlık ve hazırlık ayrımı

```bash
curl http://localhost:3000/health
curl http://localhost:5001/health
```

Backend `status=ok` ile birlikte `db` boolean döndürür. Flask `indexedPages` sayar. Bunlar tam hazır olma deneyi değildir: bir bilinen retrieval sorgusu ve kontrollü analiz isteğiyle dış model erişimi ayrıca doğrulanabilir. Böyle bir canlı analiz maliyetli olabilir; statik doküman derlemesi bunu çalıştırmaz.
