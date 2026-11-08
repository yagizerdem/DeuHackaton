---
title: Backend katmanları ve istek yaşam döngüsü
---

## Başlangıç

`server.ts`, `NODE_ENV` değerine göre ortam dosyasını okur; MongoDB bağlantısını bekler ve ardından HTTP portunu açar. `app.ts` Express yapılandırmasını, route mount noktalarını ve en sondaki hata yakalayıcıyı tanımlar.

İstek sırası genel olarak şöyledir:

```text
CORS → JSON parser → cookie parser → route
     → authenticate → giriş/dosya doğrulama
     → controller → service/model → ApiResponse
                                      ↓ hata
                                  errorHandler
```

Her route bütün adımları kullanmaz. Örneğin auth girişinde kimlik doğrulama yoktur; görsel analizde Multer vardır. Görsel route'larında `authenticate` dosya ayrıştırmadan önce çalışır.

## Katmanların görevleri

**Route:** HTTP metodu, yol ve middleware sırası. Swagger açıklamaları çoğunlukla burada yer alır.

**Controller:** `req.user`, parametreler ve doğrulanmış gövde üzerinden işlemi koordine eder. Görsel analiz controller'ı tanıyı, RAG sorgusunu ve değerlendirmeyi sırayla çağırır.

**Service:** Tekrar kullanılan algoritmalar ve dış servis erişimi. Örneğin token rotasyonu, `nextDueDate`, RAG istemcisi ve GBIF uzaklık hesabı.

**Model:** Mongoose belge şeması, index ve varsayılanlar. İş kurallarının tamamı şemada değildir; ilişkili kaydın aynı kullanıcıya ait olması controller/service seviyesinde denetlenir.

## Doğrulama ve hata dönüşümü

Ortak `validator` middleware'i Zod `safeParse` çalıştırır. Başarıda `req.body` normalize edilmiş çıktıyla değiştirilir. Başarısızlıkta hata yolları `formErrors` alanına toplanır.

Beklenen hatalar `AppError` ile HTTP durumuna çevrilir. MongoDB yinelenen anahtar hataları 409'a, bazı belge doğrulama hataları 422'ye, büyük BSON belgeleri 413'e çevrilir. Diğer hatalar 500 olabilir. Backend'in her bilinmeyen yolu JSON zarfa çevirdiği varsayılmamalıdır; genel bir JSON 404 handler'ı tanımlı değildir.

## Dış bağımlılıklar

| Bağımlılık | Kullanım | Kodda süre sınırı |
|---|---|---|
| Gemini üretim | Tanı ve risk değerlendirmesi | İstemci HTTP timeout: 60 saniye |
| Flask RAG | Sayfa getirme | Fetch timeout: 120 saniye |
| GBIF / CORINE / Open-Meteo | Coğrafi veriler | Kaynak isteği başına 20 saniye |
| MongoDB | Kalıcı iş verisi | Mongoose bağlantı davranışı |

Bu süreler uçtan uca SLA değildir. Bir istek birden çok dış çağrı içerir; proxy timeout'u ayrıca uyumlu olmalıdır.

## Kullanıcı kapsamı

Çiftlik kaynakları `{_id, owner: req.user.id}` ile sorgulanır. Başka kullanıcıya ait bitki veya parsel ilişkisi reddedilir. Uygulama bir role dayalı yetki matrisi uygulamaz; mevcut temel sınır kaydın sahibidir.

Kaynaklar: [app.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/app.ts), [middleware dizini](https://github.com/yagizerdem/DeuHackaton/tree/dev/apps/backend/src/middlewares).
