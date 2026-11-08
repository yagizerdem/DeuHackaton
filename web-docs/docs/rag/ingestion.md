---
title: PDF indeksleme algoritması
description: Sayfa çıkarma, kararlı kimlik, paralel özetleme, batch embedding ve Chroma upsert.
---

## 1. PDF ve sayfa seçimi

`DATA_DIR` varsayılan olarak `/app/data` dizinidir. `rglob("*.pdf")` alt klasörleri de tarar; dosyalar sıralanır. Uzantı eşlemesi çalışılan dosya sistemine bağlıdır; belgeleri `.pdf` uzantısıyla tutmak uygundur.

Her PDF `PdfReader` ile açılır. Sayfa numarası 1'den başlar. `extract_text()` çıktısı boşsa sayfa atlanır. Burada:

- OCR yapılmaz.
- Tablo veya görsel için ayrı bir algılama modeli çalışmaz.
- Sayfa içi token chunk'ları veya overlap oluşturulmaz.
- Komşu sayfalar otomatik birleştirilmez.

Dolayısıyla retrieval birimi PDF sayfasıdır. Bir tablonun veya yöntemin iki sayfaya bölünmesi bağlamı parçalayabilir.

## 2. Kararlı sayfa kimliği

```text
source = PDF'nin DATA_DIR'e göre göreli POSIX yolu
id = SHA1(source + ":" + one_based_page_number)
```

Örneğin `eppo/guide.pdf` dosyasının 7. sayfasının kimliği yol ve `7` değerinden türetilir. Aynı isimdeki farklı alt klasör dosyaları farklı kimlik alır.

Mevcut koleksiyon kimlikleri bir Set'e alınır. Kimliği zaten bulunan sayfalar özetlenmez ve yeniden embed edilmez. Bu, yarıda kalan çalışmaya devam etmeyi sağlar; **içerik değişikliği tespiti yapmaz**. PDF'nin içeriği değişip yolu ve sayfa numarası aynı kaldığında eski kayıt kalır.

## 3. Bilimsel özetleme

Her bekleyen sayfa `SUMMARY_PROMPT` içine yerleştirilir. Prompt İngilizce ve ayrıntılı bir çıktı ister:

| Bölüm | Korunması hedeflenen bilgi |
|---|---|
| General Overview | Konu ve kapsam |
| Invasive Species / Host Plants | Tür ve konukçu ilişkileri |
| Geographic Distribution | Doğrulanmış ve olası dağılım ayrımı |
| Symptoms and Damage | Belirti, zarar ve erken tespit |
| Prevention and Control | Kaynakta desteklenen yöntem ve koşullar |
| Scientific Findings | Sayılar, deneyler ve bulgular |
| Limitations / Keywords / Final Summary | Belirsizlik, arama terimleri ve sentez |

Özetleme isteği `temperature=0` ve `max_output_tokens=8192` kullanır. Bu sınır giriş sayfasını otomatik chunk'lamaz. Boş özet hata sayılır.

## 4. Paralellik ve batch akışı

Varsayılan 16 özet işçisi vardır. Başta bekleyen sayfalar listeye alınır ve thread pool'a gönderilir. `as_completed`, tamamlanma sırasındaki özetleri toplar; PDF sırası korunmak zorunda değildir.

Her 32 başarılı özet bir batch oluşturur:

```python
# Akışın sadeleştirilmiş sözde kodu
for finished_summary in as_completed(summary_jobs):
    if summary_failed:
        log_and_skip()
        continue
    batch.append(page_and_summary)
    if len(batch) >= 32:
        embed_summaries_and_upsert(batch)
        batch = []
flush_remaining_batch()
```

`embed()` batch içindeki metinleri ayrıca varsayılan 8 işçiyle tek tek embed eder. `BATCH=32` tek bir sağlayıcı isteğinde 32 metin olduğu anlamına gelmez.

Özet hatası alınan sayfa loglanıp atlanır; sonraki çalışmada yeniden seçilir. Buna karşılık batch embedding veya upsert hatası `flush` içinde yakalanmaz ve çalışmayı durdurabilir. Daha önce başarılı yazılan batch'ler kalır.

## 5. Chroma kaydı

```text
ids        → SHA1 kaynak-sayfa kimliği
embeddings → normalize edilmiş özet vektörü
documents  → ham sayfa metni
metadatas  → {source, page, summary}
```

`upsert`, aynı kimlik için tekrar kayıt çoğaltmak yerine mevcut kaydı güncelleyebilir. Normal tarama daha önce indeksli sayfayı atladığından bu tek başına dosya güncelleme politikası oluşturmaz.

## 6. Legacy koleksiyon taşıma

Eski `plant_protection_pages` koleksiyonu varsa ham metin ve metadata okunur. Yeni koleksiyonda bulunmayan kimliklerin **mevcut özetleri** yeniden embed edilir; tekrar özetleme yapılmaz. Taşıma 200 kayıtlık parçalarda yürür.

Eski kimliklerin tamamı yeni koleksiyonda görüldükten sonra eski koleksiyon silinir. Kontrol kimliklerin varlığına dayanır; içerik karşılaştırması veya retrieval kalite ölçümü değildir.

## Kaynak ve sonraki adım

Uygulama: [ingest.py](https://github.com/yagizerdem/DeuHackaton/blob/dev/rag/ingest.py), [prompts.py](https://github.com/yagizerdem/DeuHackaton/blob/dev/rag/prompts.py).

Vektörün matematiği [embedding sayfasında](embeddings.md), değişen PDF ve kalıcılık politikası [işletim sayfasında](operations.md) açıklanır.
