---
title: Sorgu kurma ve top-k retrieval
---

## 1. Görsel tanıdan sorgu

Backend'in `buildRetrievalQuery` fonksiyonu şu alanları bu sırayla birleştirir:

```typescript
[
  analysis.species.latinName,
  ...analysis.suspectedPestsAndDiseases.map(p => p.latinName),
  ...analysis.symptoms,
].filter(Boolean).join('. ')
```

Türkçe yaygın ad, familya, `summary`, `protectiveMeasures` ve `invasiveThreats` bu sorguya eklenmez. Örneğin:

```text
Platanus orientalis. Corythucha ciliata. Yapraklarda sarı benekler
```

Bu deterministik bir metin birleştirmesidir. Ayrı bir query rewrite modeli, çoklu sorgu üretimi veya anahtar sözcük genişletme yoktur.

`isPlant=false` olduğunda arama atlanır. `isPlant=true` olup sorgu alanları boşsa boş metin oluşabilir; Flask 400 döndürür ve backend bunu genel RAG hatası olarak 503'e çevirir.

## 2. Flask giriş doğrulama

`POST /query` JSON gövdesi:

```json
{"query":"Platanus orientalis yaprak zararlıları","k":5}
```

- `query` boş olmayan string olmalıdır.
- `k` verilmezse 5'tir.
- `k` 1–20 arasında tamsayı olmalıdır; boolean kabul edilmez.
- Koleksiyon boşsa embedding çağrısı yapılmadan 503 döner.

Doğrulama sorgunun boşluklardan ibaret olmadığını kontrol eder; embedding'e esas stringin kendisi gönderilir. JSON'un nesne olması istemci sözleşmesidir; kod tüm farklı JSON üst türlerini ayrıntılı bir şemayla doğrulamaz.

## 3. Embedding ve vektör sorgusu

Soru `RETRIEVAL_QUERY` task türüyle embed ve normalize edilir. Ardından:

```python
found = col.query(query_embeddings=vector, n_results=k)
```

Özel metadata filtresi, kaynak türü önceliği, tarih filtresi veya kullanıcı filtresi verilmez. Sayfa sayısı k'dan küçükse istemci tam k sonuç garantisine dayanmamalıdır.

Embedding hatası Flask'ta yakalanır ve 503 olur. Chroma sorgusu için aynı try bloğu bulunmaz; indeks katmanı hatası 500'e çıkabilir. Backend tüm non-2xx RAG yanıtlarını 503 olarak eşler.

## 4. Sonuç ve skor

Her sonuç şu alanlarla dönüştürülür:

```json
{
  "source": "eppo/example.pdf",
  "page": 7,
  "score": 0.7342,
  "summary": "Scientific page summary...",
  "text": "Original extracted page text..."
}
```

Örnek değerler temsilidir. Skor `round(1 - distance, 4)` olarak hesaplanır. `summary` arama temsilini açıklamaya, `text` üretim bağlamına yarar.

## 5. Mevcut seçim politikasının sonuçları

Retrieval yalnızca en yakın k kaydı seçer:

- Minimum benzerlik eşiği yoktur.
- BM25 veya dense+sparse hybrid arama yoktur.
- Cross-encoder / LLM reranker yoktur.
- MMR çeşitlilik seçimi veya kaynak tekilleştirme yoktur.
- Aynı PDF'nin komşu sayfalarını otomatik genişletme yoktur.

Korpusta uygun belge bulunmadığında da en yakın kayıtlar gelir. Bu nedenle yüksek sıralama tek başına yeterli kanıt değildir. Eşik eklemek bir geliştirme önerisidir; sabit bir skoru bütün sorgulara doğru eşik olarak sunmak için etiketli veri gerekir.

Kaynaklar: [Flask query](https://github.com/yagizerdem/DeuHackaton/blob/dev/rag/app.py), [backend sorgu oluşturma](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/services/plant-analysis-service.ts).
