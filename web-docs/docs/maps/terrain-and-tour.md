---
title: Alan, eğim, bakı ve görev turu algoritmaları
---

## Alan ve çevre

Parsel `[lng,lat]` köşelerinden oluşur. Alan hesabı, ortalama enlemde yerel eşdikdörtgensel projeksiyona geçer:

```text
x = R × longitudeRadians × cos(meanLatitudeRadians)
y = R × latitudeRadians
areaM2 = abs(Σ(x_i × y_next - x_next × y_i)) / 2
areaHa = areaM2 / 10000
```

Bu shoelace hesabı küçük tarla/bahçeler içindir; küresel kadastro hesabı değildir. Çevre her ardışık köşenin Haversine uzaklığını toplar; son köşe ilk köşeye bağlanır.

`centroidOf` köşelerin aritmetik ortalamasıdır; alan ağırlıklı gerçek poligon centroid'i değildir. Girintili poligonda bu merkez poligon dışında kalabilir.

## Yükseklik kaynağı ve örnekleme penceresi

Küre gerçek terrain provider kullanıyorsa Cesium'dan yükseklik örneklenir. Tile availability varsa en ayrıntılı örnekleme, yoksa seviye 11 kullanılır. Elipsoid modunda Open-Meteo yükseklik servisine, istek başına en fazla 100 noktalık gruplarla gidilir.

Çok küçük parselde DEM tek hücreye düşebildiğinden eğim/bakı için en az 300 metre genişliğinde bir pencere kullanılır. Daha büyük alanlarda pencere köşelerin yerel kapsama boyutuna göre büyür. Pencerede 5 × 5 grid ve ayrıca parsel köşeleri örneklenir.

## En küçük karelerle düzlem uydurma

Grid örneklerine şu düzlem oturtulur:

```text
z = a × x + b × y + c

[Σx²  Σxy  Σx] [a]   [Σxz]
[Σxy  Σy²  Σy] [b] = [Σyz]
[Σx   Σy   n ] [c]   [Σz ]
```

3×3 normal denklem Cramer kuralıyla çözülür. Üçten az örnek veya determinantın mutlak değeri 1e-9'dan küçükse düzlem kurulamaz. Akış bu durumda eğimi 0 ve bakıyı null kabul eder; bu ölçülmüş düz arazi ile hesaplanamayan düzlemi aynı çıktıya indirebilir.

```text
slopeDeg = atan(sqrt(a²+b²)) × 180/π
aspectDeg = (atan2(-a,-b) × 180/π + 360) mod 360
```

Bakı kuzeyden saat yönünde ölçülen aşağı eğim yönüdür. Eğim 2 dereceden küçükse bakı null olur.

Eğim/bakı pencereden hesaplanır; min/max/ortalama rakım ise parsel köşeleri ve parselin içindeki grid örnekleriyle hesaplanır. İkisinin örnek kapsamı farklıdır.

## Yorum kuralları

Güney ağırlıklı bakı daha çok güneş/kuruma, kuzey ağırlıklı bakı serinlik/nem şeklinde yorumlanır. 8 derece ve üstünde yüzey akışı, 15 derece ve üstünde erozyon uyarısı eklenir. Bu kurallar kuzey yarımküre yorumu olarak yazılmıştır; evrensel tarımsal risk tahmin modeli değildir.

Çizilen alanın vejetasyon incelemesi poligonun tam kesişimiyle değil, merkez çevresinde 0,1–5 km'ye sınırlandırılmış daireyle yapılır.

## Görev turu

1. Bitmemiş ve bugünün sonuna kadar vadesi gelen görevleri seç; gecikenler dahildir.
2. Konumu olan bitkilerdeki görevleri bitki kimliğine göre grupla.
3. Her bitkiyi tek durak yap.
4. Başlangıçtan en yakın kalan durağı seç, sonra aynı işlemi tekrarla.

Bu nearest-neighbor sezgiseli yaklaşık O(n²) uzaklık karşılaştırması yapar. En kısa tur garantisi, yol ağı, yaya erişimi, engel veya yükseklik maliyeti yoktur. Toplam mesafe ardışık durakların kuş uçuşu uzaklığıdır; başlangıca dönüş içermez.

Görev son tarihi ve tekrar hesabı UTC ile işlenirken “bugün sonu” seçimi tarayıcının yerel saat dilimini kullanır. Saat dilimi farklılıkları sınırdaki görevleri etkileyebilir.

## Zaman çizelgesi

3B zaman modu bitkiye bağlı en eski kayıttan bugüne aralığı kullanır; kayıt yoksa 30 gün geriye gider. Playback çarpanı bu aralığı yaklaşık 20 saniyeye sığdırır. Bu, kayıtlı sağlık durumlarının görselleştirilmesidir; geleceğe yönelik hastalık tahmini değildir.

Kaynak dosyaları: `apps/web/src/lib/geo.ts`, `apps/web/src/lib/map3d/geometry.ts`, `terrain-stats.ts`, `elevation.ts`, `tour.ts` ve `components/map3d/time-controller.tsx`.
