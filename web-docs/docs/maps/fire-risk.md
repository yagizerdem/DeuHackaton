---
title: Yangın katmanları ve zaman serisi
---

## Veriyi kim hesaplıyor?

GWIS/EFFIS katmanları dış sağlayıcıdan gelir. Bu repo ham meteorolojiden FWI hesaplayan veya yangın yayılımını fiziksel olarak simüle eden bir model içermez. Arayüz hazır indeksleri, aktif yangın noktalarını ve yanmış alanları gösterir.

Ana WMS adresi `https://maps.effis.emergency.copernicus.eu/gwis` değeridir. Burada anlatılan katman adları mevcut istemci kodundandır; uzak sağlayıcının gelecekteki yayın kapsamını garanti etmez.

## Görüntü katmanları

- Yangın tehlike tahmini: seçili sağlayıcı ve indeks katmanları.
- Yakın gerçek zamanlı yanmış alan: `nrt.ba.poly`.
- MODIS, VIIRS ve Sentinel-3 sıcak noktaları.
- MODIS aylık/yıllık yanmış alan kompozitleri.
- Hazır `.today`, `.week`, `.month`, `.season` dönem katmanları.

Özel tarih aralığı seçilirse temel katmana `time=from/to` eklenir. “Season” mevcut takvim yılının başından bugüne aralıktır. Aylık/yıllık kompozit katmanlarının tarihleri ay/yıl başına normalize edilir.

## GetFeatureInfo ve koordinatlar

İstemci WMS 1.1.1, `srs=EPSG:4326`, `bbox=west,south,east,north` ve ekran merkezi x/y parametrelerini kullanır. Bu sıralama uygulamadaki `MapBounds=[south,west,north,east]` yapısından dönüştürülür.

## Yangın tehlike grafiği

`fetchFireDangerSeries` seçili günün 2 gün öncesi ile 9 gün sonrasını ister. Konumun çevresinde ±0,01 derecelik küçük kutu kullanılır.

İki istek paraleldir: bütün tarih aralığı ve yalnızca ilk gün. İlk gün dönen `table#main` sayısı günlük grid hücresi sayısı kabul edilir. Aralık tabloları bu sayıya göre günlere bölünür; aynı etiketin hücre değerleri günlük aritmetik ortalamaya çevrilir.

Bu algoritma uzak HTML yanıtının kronolojik ve her gün aynı hücre sayısında olmasına dayanır. Tablo yapısı değişirse parser bozulabilir. Eksik veri veya yanlış hücre sayısı zaman eksenini de etkileyebilir.

## Yanmış alan bulucu

`nrt.ba.query` GML yanıtı DOMParser ile okunur. Her feature için kimlik, başlangıç tarihi, son güncelleme, hektar alanı ve bounding box çıkarılır. Kod `feature_count=50` ister; çıktı bütün olayların eksiksiz envanteri olarak değerlendirilmemelidir.

## Mevcut /risk boşluğu

`apps/web/src/lib/risk-api.ts`, `/api/risk` için bir istemci ve yapısal risk tipleri tanımlar. Ancak incelenen Express `app.ts` dosyasında bu yolu bağlayan bir router bulunmaz. Bu nedenle bu endpoint'i çalışan API listesine eklemek veya “yapısal risk algoritması hazır” demek doğru değildir.

Bu eksiklik, doğrudan GWIS WMS kullanan katmanların varlığından ayrıdır. Döküman içinde belirtilmesi uygulamaya endpoint eklendiği anlamına gelmez.

Kaynaklar: [gwis.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/web/src/lib/gwis.ts), [risk-api.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/web/src/lib/risk-api.ts), [backend app.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/app.ts).
