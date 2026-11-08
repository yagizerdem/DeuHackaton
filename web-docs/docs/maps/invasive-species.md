---
title: İstilacı tür sorgusu ve uzaklık algoritması
---

## 1. Sorgu kapsamı

`GET /api/invasive-species` kullanıcının verdiği merkez ve 1–100 km yarıçapı alır; varsayılan yarıçap 25 km'dir. 3B arayüzün başlangıç değeri ayrıca 10 km'dir.

Backend, Akdeniz tarım/bahçe bağlamında seçilmiş 21 bilimsel adı GBIF'e tekrar eden `scientificName` parametreleriyle gönderir. Bu, GBIF'in bütün istilacı türlerini dinamik keşfeden bir sınıflandırıcı değildir.

Filtreler: koordinatı olan, coğrafi sorunu işaretlenmemiş, `PRESENT` durumundaki gözlemler ve 1990'dan içinde bulunulan yıla kadar kayıtlar.

## 2. Daireyi WKT poligona çevirme

GBIF'e gerçek daire yerine 36 köşeli saat yönünün tersine bir poligon gönderilir. Yaklaşık derece farkları:

```text
dLat = radiusKm / 111.32
dLng = radiusKm / (111.32 × cos(latitude))
```

Köşeler kosinüs/sinüsle üretilir; ilk köşe sona eklenerek WKT halkası kapatılır. Bu yaklaşım küçük bölgesel alanlar içindir. Kutup yakınları, tarih değiştirme çizgisi ve koordinat taşması için özel geometri düzeltmesi yoktur.

## 3. Sayfalama ve son filtre

Sayfa başına 300, en fazla 3 sayfa çekilir; en çok 900 ham gözlem işlenir. Kayıtlar bitmeden sınır dolarsa `truncated=true` döner.

Koordinatı, yılı veya türü olmayan gözlemler elenir. `coordinateUncertaintyInMeters > 5000` ise kayıt çıkarılır. Belirsizlik alanı yoksa kod bunu eleme nedeni saymaz.

Poligon yaklaşımını düzeltmek için her gözlemde Haversine uzaklığı hesaplanır:

```text
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
distanceKm = 2 × 6371 × asin(sqrt(a))
```

Gerçek yarıçapı aşan gözlemler son listeden çıkarılır.

## 4. Sıralama ve özet

Gözlemler merkeze uzaklığa göre sıralanır. Tür bazında kayıt sayısı ve en yakın uzaklık toplanır. İlk gözlem `nearest`, yılların min/max değeri `yearRange` olur.

`species[].count`, dönen filtrelenmiş örneklerin sayısıdır; bölgede yaşayan birey sayısı veya tamamlanmış bir envanter değildir. Kayıt eksikliği tehdidin bulunmadığını kanıtlamaz.

## 5. Cache

Anahtar `lat.toFixed(3), lng.toFixed(3), radiusKm` şeklindedir. Sonuç bir saat saklanır, en fazla 200 anahtar tutulur. Kapasite dolunca Map'in ilk anahtarı atılır; bu tam bir LRU uygulaması değildir.

Yuvarlama yakın tıklamaları aynı cevaba yönlendirebilir. Cache tek backend sürecinin belleğindedir; yeniden başlatmada kaybolur ve çok instance arasında paylaşılmaz.

## 3B gösterim

Gözlem yılı en eski/yeni yıl arasında 0–1'e ölçeklenir. Aynı yılın bütün gözlemlerinde oran 1 alınır. Bu oran renk rampasını ve noktanın yerden yüksekliğini belirler; yükseklik gerçek gözlem rakımı değildir. Yer yüksekliğinin üzerine zaman bilgisini görselleştiren ek bir mesafe konur.

Kaynak: [invasive-species-service.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/services/invasive-species-service.ts), `apps/web/src/lib/year-color.ts`.
