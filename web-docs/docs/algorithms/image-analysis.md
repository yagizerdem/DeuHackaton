---
title: Görsel tanı ve risk değerlendirme algoritması
---

## Neden iki aşama var?

Görsel tanı, fotoğrafta ne göründüğünü yapılandırır. Risk değerlendirmesi bu tanıyı eylem planına dönüştürür. İki aşamanın ayrı olması RAG kaynaklarının yalnızca ikinci aşamaya eklenebilmesini sağlar.

```text
image bytes → Gemini → PlantAnalysis
PlantAnalysis + optional reference excerpts → Gemini → PlantRiskAssessment
```

RAG ilk görsel tanıyı yeniden doğrulayan bir görüntü modeli değildir. Yanlış tür veya yanlış belirti ilk aşamada üretildiyse arama sorgusu da yanlış yöne gidebilir.

## 1. Giriş doğrulama

Kimlik doğrulama dosya ayrıştırmadan önce yapılır. Multer tek `image` alanını belleğe alır; dosya sınırı 10 × 1024 × 1024 byte'tır. JPEG, PNG, WebP, HEIC ve HEIF MIME türleri kabul edilir.

MIME kontrolü yükleme bilgisini denetler; kodda ayrı bir dosya sihirli byte doğrulaması veya görüntü dönüştürme adımı yoktur. Eksik dosya 400, fazla büyük dosya 413, desteklenmeyen tür 415 olur.

## 2. Yapılandırılmış tanı

Görsel base64 olarak Gemini `inlineData` alanına aktarılır. Prompt Türkçe JSON ister; Latin ikili tür adlarının korunmasını ve görülemeyen alanlarda boş listeler kullanılmasını belirtir.

| Alan | İçerik |
|---|---|
| isPlant | Fotoğraf bitki içeriyor mu? |
| species | commonName, latinName, family, confidence |
| symptoms | Görülen belirti listesi |
| suspectedPestsAndDiseases | Tür adı, tip ve şüphe gerekçesi |
| invasiveThreats | İlgili tehdit adları |
| protectiveMeasures | Koruma önlemleri |
| summary | Kısa değerlendirme |

Şüpheli etken tipi `insect / fungus / bacteria / virus / other` değerlerinden biridir. `confidence` Zod ile 0–1 arasında sınırlandırılır; bu değer modelin kendi çıktısıdır.

## 3. JSON şeması ve çıktı denetimi

Zod şeması JSON Schema'ya çevrilir; sağlayıcı parser'ı için `$schema` işareti çıkarılır. İstek `responseMimeType: application/json`, `temperature: 0.2` ve düşük düşünme seviyesi kullanır. Backend'deki model sabiti `gemini-3.8-flash` değeridir.

Üretimden sonra JSON ayrıştırılır ve yeniden Zod doğrulamasından geçer. Yapılandırılmış çıktı istemek yerel doğrulamanın yerine geçmez.

- Sağlayıcı isteği başarısızsa 503.
- Boş çıktı veya şemaya uymayan JSON için 422.
- Başarılıysa doğrulanmış yapı döner.

Şema alan tiplerini kontrol eder; bilimsel doğruluğu veya bütün alanlar arasındaki anlamsal tutarlılığı kanıtlamaz.

## 4. Risk planı

İkinci çağrı `severity`, `urgency`, `spreadRisk`, `treatmentPlan`, `monitoring`, `reportToAuthorities` ve `rationale` üretir. Bitki olmayan görsel için prompt `severity=none`, `urgency=monitor` ve boş listeler ister.

Bu alanlar deterministik eşik hesabından çıkmaz; model üretimidir. Örneğin belirli sayıda belirtinin otomatik olarak `high` risk oluşturduğu bir formül bulunmaz.

RAG ile değişen kısım [referanslarla yanıt üretiminde](../rag/generation.md) açıklanır. Sonuç saklama ve çıktı örneği [analiz API'sindedir](../api/analysis.md).

Kaynak: [plant-analysis-service.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/services/plant-analysis-service.ts).
