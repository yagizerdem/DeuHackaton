---
title: Görsel analiz ve RAG API'si
---

## Express analiz uç noktaları

| Metot | Yol | İşlev |
|---|---|---|
| POST | `/api/plan-analysis` | Görsel tanı + standart risk değerlendirmesi |
| POST | `/api/plan-analysis/rag` | Görsel tanı + PDF referanslı risk değerlendirmesi |

İkisi de auth gerektirir ve `multipart/form-data` içinde tek `image` dosyası alır. Kabul edilen MIME türleri: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`. Üst sınır 10 MiB'dir.

```bash
curl -X POST http://localhost:3000/api/plan-analysis/rag \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -F 'image=@leaf.jpg'
```

FormData kullanan tarayıcı istemcisinde multipart Content-Type başlığını elle sabitlemeyin; boundary tarayıcı tarafından oluşturulur.

## Başarılı yanıt

Aşağıdaki içerik veri biçimini göstermek için temsilidir:

```json
{
  "httpStatusCode": 200,
  "message": "Image analyzed",
  "data": {
    "analysis": {
      "isPlant": true,
      "species": {
        "commonName": "Çınar",
        "latinName": "Platanus orientalis",
        "family": "Platanaceae",
        "confidence": 0.86
      },
      "symptoms": ["Yapraklarda beneklenme"],
      "suspectedPestsAndDiseases": [],
      "invasiveThreats": [],
      "protectiveMeasures": [],
      "summary": "Örnek tanı özeti."
    },
    "assessment": {
      "severity": "low",
      "urgency": "monitor",
      "spreadRisk": "Örnek yayılım değerlendirmesi.",
      "treatmentPlan": [],
      "monitoring": [],
      "reportToAuthorities": false,
      "rationale": "Örnek değerlendirme gerekçesi."
    }
  }
}
```

`suspectedPestsAndDiseases` elemanları `latinName`, `commonName`, `type`, `reason` taşır. `type` seçenekleri `insect, fungus, bacteria, virus, other` değerleridir.

`severity` seçenekleri `none, low, medium, high, critical`; `urgency` seçenekleri `monitor, within_weeks, within_days, immediate` değerleridir. Tedavi planı elemanı `{step, timing}` biçimindedir.

## Yan etkiler ve sınırlar

- Bu çağrılar bitki veya analiz kaydı oluşturmaz.
- `reportToAuthorities` hiçbir mesaj veya resmî bildirim göndermez.
- RAG kaynak sayfaları yanıtta bulunmaz.
- Bitki değilse RAG sorgusu atlanır; değerlendirme çağrısı devam eder.
- RAG hatasında standart değerlendirmeye otomatik dönüş yoktur.
- İki endpoint ayrı görsel tanı çağrıları yapar.

Kaydetme için [çiftlik API'sindeki](farm.md) `POST /analysis-records` kullanılır.

## Flask retrieval API'si

Flask doğrudan son tanı veya tedavi planı üretmez:

```bash
curl -X POST http://localhost:5001/query \
  -H 'Content-Type: application/json' \
  -d '{"query":"Platanus orientalis plant protection","k":5}'
```

Yanıt zarfı Express'ten farklıdır:

```json
{
  "results": [
    {
      "source": "example.pdf",
      "page": 7,
      "score": 0.7342,
      "summary": "Scientific summary...",
      "text": "Original extracted page text..."
    }
  ]
}
```

`query` boş olmayan string, `k` varsayılan 5 ve izinli aralık 1–20 tamsayıdır. Sayfa numarası 1 tabanlıdır. Skor kozinüs benzerliğinden türetilir; güven olasılığı değildir.

## Hata eşlemesi

| Durum | Express analiz | Flask query |
|---|---|---|
| Token yok | 401 | Auth uygulanmamış |
| Dosya yok / bozuk parametre | 400 | 400 |
| Fazla büyük görsel | 413 | Uygulanmaz |
| MIME desteklenmiyor | 415 | Uygulanmaz |
| Model JSON çıktısı geçersiz | 422 | Üretim yapmaz |
| Boş indeks | Backend'de 503 | 503 |
| Embedding veya RAG erişim hatası | 503 | Embedding için 503 |
| Chroma sorgu hatası | Backend'de 503'e eşlenebilir | 500 olabilir |

Backend, RAG'den gelen non-2xx yanıtın ayrıntılı HTTP durumunu istemciye koruyarak taşımaz. Algoritma için [retrieval](../rag/retrieval.md) ve [generation](../rag/generation.md) sayfalarına bakın.
