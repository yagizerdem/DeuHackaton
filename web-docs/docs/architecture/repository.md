---
title: Depo ve paket yapısı
---

```text
Depark-Hackaton/
├── apps/
│   ├── backend/src/
│   │   ├── routes/        HTTP yolları ve middleware sırası
│   │   ├── controllers/   İstek koordinasyonu ve yanıtlar
│   │   ├── services/      Model, RAG, coğrafi ve iş algoritmaları
│   │   ├── models/        Mongoose şemaları
│   │   ├── middlewares/   Auth, Zod, dosya yükleme, hata dönüşümü
│   │   └── docs/          Swagger üretimi
│   └── web/src/
│       ├── pages/         Route sayfaları
│       ├── components/    Alan bileşenleri ve ui/ kütüphanesi
│       ├── lib/           API istemcileri ve harita algoritmaları
│       ├── providers/     Auth, tema ve harita bağlamları
│       ├── hooks/         Ortak davranışlar
│       └── layouts/       Sayfa kabukları
├── packages/
│   ├── shared/src/        ApiResponse, HTTP durumları, form hataları
│   ├── validators/src/    Ortak Zod giriş şemaları
│   └── dto/src/           İstemciye dönen veri sözleşmeleri
├── rag/                   Flask, Chroma ve PDF indeksleme
├── docs/                  Önceden bulunan veri/referans dosyaları
├── web-docs/              Bu Docusaurus sitesi
└── compose.yaml           MongoDB, Mongo Express ve RAG
```

## Paket bağımlılık yönü

`apps/backend` ve `apps/web`, ortak paketlerden sözleşme alır. `validators` çalışma zamanında giriş doğrular; `dto` TypeScript yanıt tiplerini taşır; `shared` yanıt zarfını standartlaştırır. DTO'lar tek başlarına ağdan gelen bir JSON'u doğrulamaz.

Ortak paket kaynakları derlendiğinde `dist` üretilir. Bu nedenle doğrudan uygulamayı başlatıp ortak paketi derlememek modül çözümleme hatasına yol açabilir.

## Hangi davranış nerede bulunur?

| Konu | Giriş dosyası |
|---|---|
| API mount noktaları | `apps/backend/src/app.ts` |
| Görsel analiz ve değerlendirme | `apps/backend/src/services/plant-analysis-service.ts` |
| RAG indeksleme | `rag/ingest.py` |
| Embedding, retry ve Chroma | `rag/store.py` |
| RAG HTTP sözleşmesi | `rag/app.py` |
| Token rotasyonu | `apps/backend/src/services/token-service.ts` |
| Tekrarlayan görev hesabı | `apps/backend/src/services/farm-service.ts` |
| Son analizden bitki durumu | `apps/backend/src/services/farm-overview-service.ts` |
| Coğrafi sorgular | `apps/backend/src/services/vegetation-service.ts`, `invasive-species-service.ts` |
| Route tablosu | `apps/web/src/router.tsx` |
| 3B geometri ve tur | `apps/web/src/lib/map3d/` |
| Doküman sıralaması | `web-docs/sidebars.ts` |

## web-docs bağımsızlığı

`web-docs`, kök workspace listesinde yer almaz. Paket ekleme ve derleme burada ayrı yapılır. Tailwind kurulumu Docusaurus PostCSS aşamasına bağlanır; uygulamadaki `@tailwindcss/vite` eklentisi bu site tarafından kullanılmaz.

İçerik güncellemelerinde ilgili modülün kaynak kodu okunmalı; API sözleşmesi, algoritma anlatımı ve işletim adımları birlikte güncel tutulmalıdır.
