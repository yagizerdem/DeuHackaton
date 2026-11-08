---
title: Vejetasyon, arazi örtüsü ve iklim algoritması
---

## Dört paralel kaynak

Vejetasyon endpoint'i `lat`, `lon` ve 0,1–5 km yarıçap alır. Varsayılan 1 km'dir. Aynı anda dört sorgu başlar:

1. CORINE Land Cover 2018 poligonları.
2. GBIF Plantae tür gözlem sayıları.
3. Merkez noktası için Open-Meteo yüksekliği.
4. Son tamamlanmış takvim yılı için Open-Meteo günlük iklim arşivi.

`Promise.allSettled` her kaynağın başarısını ayrı ele alır. Hepsi hata verirse 503; bazıları çalışırsa başarısız alanlar `null`, kaynak isimleri `unavailable` listesi olur.

## CORINE grid örneklemesi

Merkezin çevresinde yarıçaptan bir bounding box üretilir. CORINE poligonları bu kutuyla kesişim sorgusundan gelir. Çok karmaşık geometriyi azaltmak için `maxAllowableOffset` kullanılır.

Kutuda 41 × 41 hücre merkezinden oluşan grid denenir. Yaklaşık yerel metre hesabıyla daire dışındaki noktalar çıkarılır. Kalan her nokta için önce poligon bounding box'ı, ardından point-in-polygon denetlenir.

Point-in-polygon, bütün halkalar üzerinden even-odd/ray casting kuralını uygular. Her kenar geçişinde içeride/dışarıda durumu terslenir; iç boşluklar böyle hesaba katılır. Örtüşen poligonlarda kod ilk eşleşeni seçer.

## Oranların paydası

```text
sampled = daire içindeki örnek nokta sayısı
matched = tanınan CORINE sınıfına eşleşen örnek sayısı

coveragePercent = 100 × matched / sampled
classPercent    = 100 × classMatches / matched
vegetationPercent = vegetated sınıfların classPercent toplamı
```

Önemli ayrım: sınıf oranları ve vejetasyon oranı **verisi eşleşen alanın** içindeki paydır. `coveragePercent` düşükken vejetasyon yüzdesini bütün dairenin doğrudan oranı gibi yorumlamayın. Tarım sınıfları da `vegetated` grubuna girebilir.

Bu geometrik alan kesişiminin tam hesabı değildir; örneklemeye dayalı yaklaşık orandır. CORINE 2018 çıktısı güncel uydu NDVI ölçümü değildir. Hiçbir nokta eşleşmezse `landCover=null` olur; bu tek başına servis hatası sayılmaz.

## GBIF tür özeti

Bitki krallığı `kingdomKey=6` ve `PRESENT` filtresi kullanılır. En sık 15 bilimsel ad facet ile alınır. Sorgu daireyi değil çevreleyen **dikdörtgeni** kapsar. Bu nedenle tür özeti ile CORINE oranlarının mekânsal kapsamı birebir aynı değildir.

Kayıt sayıları örnekleme/raporlama yoğunluğuna bağlıdır; biyolojik bolluk veya gerçek tür zenginliği hesabı değildir.

## İklim özeti

İçinde bulunulan yıldan bir önceki tam yıl seçilir. Günlük ortalama sıcaklıkların null olmayanları üzerinden aritmetik ortalama, günlük yağışların null olmayanları üzerinden toplam alınır. Geçerli sıcaklık günü 300'den azsa iklim kaynağı başarısız sayılır.

Yağış için aynı 300 gün eşiği ayrıca uygulanmaz. Eksik yağış verisi yıllık toplamı etkileyebilir; sonuç bir uzun dönem iklim normali değildir.

## Önbellek ve karmaşıklık

Yalnızca bütün kaynakların başarılı olduğu yanıtlar bir saat cache'lenir; kısmi yanıtlar tekrar denenebilsin diye saklanmaz. En fazla 200 kayıt ve üç ondalıklı konum anahtarı kullanılır.

Grid en çok 1681 nokta dener. Her noktada aday poligonları ve kenarları tarama maliyeti vardır; bounding box ön kontrolü gereksiz ray casting işini azaltır.

Kaynak: [vegetation-service.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/services/vegetation-service.ts), [CLC sınıf eşlemesi](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/services/vegetation/clc-classes.ts).
