---
title: Embedding, normalizasyon ve vektör indeksi
---

## Aynı vektör uzayı

Kodun varsayılanları:

```text
EMBEDDING_MODEL = gemini-embedding-2
EMBEDDING_DIMS  = 768
COLLECTION     = pages_gemini-embedding-2_768
DISTANCE       = cosine
```

Koleksiyon adı model ve boyutu içerir. Farklı boyut veya model vektörleri aynı koleksiyona karıştırılmamalıdır. Bu isimlendirme model değişimini fiziksel olarak ayırır; yeni koleksiyonun otomatik dolmasını sağlamaz.

Belge özetleri `RETRIEVAL_DOCUMENT`, sorgular `RETRIEVAL_QUERY` task türüyle aynı embedding yordamından geçer. Bunlar koddaki sağlayıcı istek ayarlarıdır; model hesabınızda bu yapılandırmayı kabul etmelidir.

## Neden her metin ayrı istek?

`_embed_one`, tek metni `contents=text` olarak gönderir. Kod bu modelde liste girdisinin tek vektöre birleşmesini önlemek için metinleri ayrı işler. `ThreadPoolExecutor.map` sonuçları giriş sırasıyla döndürür; bu sayede vektör ile sayfa metadata'sı hizalı kalır.

N metin için normal durumda N embedding isteği vardır. İsteklerin 8 işçiye dağıtılması çağrı sayısını azaltmaz; aynı anda bekleyen ağ işlemi sayısını artırır.

## L2 normalizasyonu

Üretilen vektör `v` için:

```text
norm = sqrt(v1² + v2² + ... + vd²)
v_normalized[i] = v[i] / norm
```

Kod norm sıfırsa bölücü olarak 1 kullanır. Bu durumda sıfır vektör yine sıfır kalır; ayrıca bir anlamsal geçerlilik kontrolü yapılmaz.

Normalizasyon hem belge hem sorgu vektörüne uygulanır. Varsayılan 768 boyutlu çıktı için kod, kesilmiş vektörün otomatik birim uzunlukta olduğunu varsaymaz.

## Kozinüs benzerliği

```text
similarity(q, d) = dot(q, d) / (||q|| × ||d||)
distance(q, d)   = 1 - similarity(q, d)
```

Sıfır olmayan normalize vektörlerde benzerlik doğrudan dot product'a karşılık gelir. Küçük uzaklık, vektör uzayında daha yakın temsil demektir.

Bu sayı “önerinin doğru olma olasılığı” değildir. Teorik kozinüs benzerliği -1 ile 1 arasındadır; skorun zorunlu olarak 0–1 olacağına güvenilmemelidir.

## Chroma ve HNSW

`PersistentClient` disk yoluna bağlanır; koleksiyon `metadata={"hnsw:space": "cosine"}` ile oluşturulur. Bu ayar Chroma'ya kozinüs uzaklığını seçtirir. Uygulamada özel bir HNSW traversal, graph kurma veya arama parametresi optimizasyonu yazılmamıştır; bunlar Chroma katmanına bırakılır.

HNSW yaklaşık en yakın komşu indeksidir. Graf üzerinde yakın bölgelerden adaylara ilerleyerek tam doğrusal taramaya göre daha verimli arama hedefler. Chroma'nın tek düğümlü indeksinde HNSW kullanımı [resmî performans dokümanında](https://docs.trychroma.com/guides/deploy/performance) açıklanır. Tam en yakın komşuların her sorguda bulunmasını garanti eden bir uygulama ölçümü yoktur. Projede `ef_search`, `ef_construction` gibi parametreler özelleştirilmez.

## Retry algoritması

Gemini SDK `APIError` kodu `429, 500, 502, 503, 504` ise en fazla 6 deneme yapılır. Bekleme:

```text
delay = 2^attempt + random(0, 1) saniye
attempt = 0, 1, 2, 3, 4
```

Son deneme başarısızsa hata yukarı taşınır. Başarısız altı çağrı için aralara eklenen toplam bekleme yaklaşık 31–36 saniyedir; ağ çağrılarının süresi bunun dışındadır.

Başka HTTP kodları veya SDK'nın APIError türünde olmayan hatalar bu yordam tarafından otomatik tekrar edilmez. Python istemcisinde ayrıca açık bir HTTP timeout ayarı tanımlı değildir.

Kaynak: [store.py](https://github.com/yagizerdem/DeuHackaton/blob/dev/rag/store.py).
