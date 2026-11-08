---
title: İndeks işletimi, kalıcılık ve yeniden indeksleme
---

## İndeks oluşturma

Depo kökünde:

```bash
docker compose run --rm rag python ingest.py
docker compose restart rag
curl http://localhost:5001/health
```

PDF'ler host'taki `rag/data` dizininden konteynere salt okunur bağlanır. İndeks `rag_chroma` adlı volume'da tutulur. Manuel indekslemeden sonra API sürecini yeniden başlatmak mevcut koleksiyon durumunun yenilenmesini sağlar.

`GET /health` örneği:

```json
{"status":"ok","indexedPages":120}
```

Sayfa sayısı temsilidir. Sağlık yanıtı sorgu kalitesini, API kotasını veya indeksin güncelliğini kanıtlamaz.

## Açılışta indeksleme

Varsayılan olarak `AUTO_INGEST` kapalıdır. `start.py`, değer `1 / true / yes` ise indekslemeyi dener ve sonra Gunicorn komutunu `exec` eder. Başlangıç indekslemesi hata verse bile var olan indeksle API'nin başlaması amaçlanır.

Gunicorn varsayılanları: tek worker, `0.0.0.0:5001`, 300 saniye timeout. Çok worker veya yatay ölçekleme yapmadan önce aynı kalıcı Chroma dosyalarının eşzamanlı erişim davranışı ayrıca değerlendirilmelidir.

## Yeniden çalıştırma ve veri güncelleme

| Durum | Mevcut davranış |
|---|---|
| Aynı PDF'ler tekrar indekslenir | Mevcut sayfa kimlikleri atlanır. |
| Özetlemede sayfa hata verir | Sonraki çalışmada yeniden denenir. |
| PDF içeriği aynı yolda değişir | Eski kimlik korunur; güncel içerik otomatik fark edilmez. |
| PDF silinir | Chroma'daki eski kayıt otomatik silinmez. |
| PDF yeniden adlandırılır | Yeni kimlikler oluşur; eski kayıtlar ayrıca temizlenmediyse birlikte kalır. |
| Özet prompt'u değişir | Mevcut kimlikler atlandığı için eski özetler yenilenmez. |
| Model/boyut değişir | Farklı adlı koleksiyon seçilir; indeks yeniden doldurulmalıdır. |

Dosyayı yeniden adlandırmak güncel veriyi ekleyebilir ama eski kaydı temizlemez; bu nedenle tam güncelleme politikası olarak yeterli değildir.

Kontrollü yeniden indeksleme için önce volume yedeği ve dosya listesi alınmalı; hedef koleksiyon açıkça belirlenmeli ve yalnız o koleksiyonun temizlenmesi değerlendirilmelidir. Projede kaynak bazında silme veya force-reindex CLI seçeneği uygulanmış değildir.

> **Kalıcılık**
>
> `docker compose restart` ve normal `docker compose down` named volume'ları korur. `docker compose down -v` hem RAG hem MongoDB volume'larını silebilir. Bu komut indeks yenilemek için varsayılan çözüm değildir.

## Çalıştırma maliyetini tahmin etme

Yeni N metin sayfası için normal akış N özet üretimi ve N embedding isteği yapar. Özet retry'ları, embedding retry'ları ve legacy taşıması çağrı sayısını artırabilir.

İstek anında:

| Akış | Üretim | Embedding |
|---|---:|---:|
| Standart analiz | 2 | 0 |
| Bitki içeren RAG analizi | 2 | 1 |
| Bitki içermeyen RAG analizi | 2 | 0 |

Sayfa başına sabit bir para değeri verilmez. Gerçek bedel modelin güncel tarifesine, giriş/çıkış token'larına, thinking davranışına ve tekrar sayısına bağlıdır.

## Operasyonel kontroller

- `indexedPages` beklenen kapsamı karşılıyor mu?
- Loglarda `skipped` sayfalar ve başarısız batch var mı?
- Kullandığınız model/boyut ile seçili koleksiyon uyumlu mu?
- Bilinen birkaç sorgu doğru kaynak ve sayfa numarasını getiriyor mu?
- Silinen/değişen PDF'lerden kalan kayıtlar var mı?
- API konteyneri indeksleme sonrasında yeniden başlatıldı mı?

Kaynaklar: [start.py](https://github.com/yagizerdem/DeuHackaton/blob/dev/rag/start.py), [compose.yaml](https://github.com/yagizerdem/DeuHackaton/blob/dev/compose.yaml).
