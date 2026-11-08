---
title: Yerel kurulum
description: Monorepo, MongoDB, RAG, web uygulaması ve dokümantasyon sitesinin kurulumu.
---

## Gereksinimler

- Monorepo için Node.js 22 veya proje bağımlılıklarıyla uyumlu daha yeni bir sürüm ve npm.
- MongoDB ile Python RAG servisini çalıştırmak için Docker Desktop ve Docker Compose.
- Görsel analiz, özetleme ve embedding çağrılarını yapabilen Google Gemini API anahtarı.
- RAG kullanmak için metni seçilebilir PDF belgeleri. Taranmış belgeler için bu projede OCR adımı yoktur.

Dokümantasyon sitesi kendi `package.json` ve `package-lock.json` dosyalarına sahiptir. Kök npm workspaces listesi yalnızca `apps/*` ve `packages/*` yollarını kapsar; kökte `npm install` çalıştırmak `web-docs` bağımlılıklarını kurmaz.

## Uygulama bağımlılıkları

Aşağıdaki komutlar depo kökünde çalıştırılır:

```bash
npm install
npx tsc -b packages/shared packages/validators packages/dto
```

Ortak paketler `dist` üzerinden tüketildiği için kaynak dosyalarını değiştirdikten sonra da yeniden derlenmeleri gerekir.

## Ortam dosyaları ve Docker

[Yapılandırma rehberindeki](configuration.md) örneklerle `apps/backend/.env.dev`, `apps/web/.env` ve `rag/.env` dosyalarını oluşturun. Gerçek anahtarları dokümantasyona veya Git'e eklemeyin.

```bash
docker compose up -d --build
docker compose ps
```

| Servis | Yerel adres | İşlev |
|---|---|---|
| MongoDB | `localhost:27017` | Kullanıcı ve çiftlik verileri |
| Mongo Express | `http://localhost:8081` | Geliştirme veritabanı arayüzü |
| RAG | `http://localhost:5001` | PDF indeksine sorgu |

Compose dosyası Express backend'i veya React web uygulamasını başlatmaz. Bunlar ayrıca çalıştırılır.

## Bilgi tabanını hazırlama

PDF'leri `rag/data/` içine, isterseniz alt klasörlerle yerleştirin:

```bash
docker compose run --rm rag python ingest.py
docker compose restart rag
curl http://localhost:5001/health
```

Bu işlem Gemini çağrıları yapar ve kullanım maliyeti oluşturabilir. Varsayılan açılış davranışı indeksleme yapmaz. `indexedPages` sıfırsa servis ayakta olsa bile RAG sorguları çalışmaz. Ayrıntılar [indeks işletiminde](../rag/operations.md).

## Geliştirme sunucuları

Depo kökünden, iki ayrı terminalde:

```bash
npm run dev -w @DeparkHackaton/backend
```

```bash
npm run dev -w @DeparkHackaton/web
```

Backend `http://localhost:3000`, web `http://localhost:5000`, Swagger `http://localhost:3000/api-docs` adresindedir. `GET /health` yanıtında backend için `db: true` beklenir.

## Dokümantasyon sitesini başlatma

```bash
cd web-docs
npm ci --workspaces=false
npm start
```

Tarayıcıda `http://localhost:3001` adresini açın. Dokümanlar kök yolda sunulur; blog etkin değildir.

Doğrulama ve üretim önizlemesi:

```bash
npm run typecheck
npm run build
npm run serve
```

Doküman sitesinin derlenmesi backend'e, Gemini anahtarına veya Docker'a ihtiyaç duymaz.
