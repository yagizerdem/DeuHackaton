---
title: Harita ve coğrafi analiz mimarisi
---

## İki harita, farklı sorumluluklar

**2B harita** Leaflet ile dış WMS katmanlarını gösterir. Tarih, tahmin kaynağı ve hasar katmanları harita provider'ında tutulur. Yangın hava indeksi ve yanmış alan bilgileri ağırlıklı olarak GWIS'ten doğrudan tarayıcıya gelir.

**3B harita** Cesium ile kullanıcıya ait parsel, bitki, görev ve analizleri; GBIF gözlemlerini ve dış görüntü katmanlarını birleştirir. Çizilen alanın geometrisi ve arazi analizi istemcide yapılır; vejetasyon sorgusu backend'e gider.

## Veri kaynağı ve hesaplama yeri

| İşlev | Kaynak / algoritma | Çalıştığı yer |
|---|---|---|
| İstilacı tür gözlemleri | GBIF + yarıçap filtresi | Express |
| Arazi örtüsü oranları | CORINE 2018 + grid örnekleme | Express |
| Bitki gözlem özeti | GBIF tür facet'leri | Express |
| Rakım / yıllık iklim | Open-Meteo | Express |
| FWI ve aktif/yanmış alan görüntüsü | GWIS WMS | Tarayıcı |
| Alan / çevre / nokta-poligon | Yerel geometri yardımcıları | Tarayıcı |
| Eğim ve bakı | DEM örnekleri + en küçük kareler | Tarayıcı |
| Görev tur sırası | En yakın komşu sezgiseli | Tarayıcı |

Bu ayrım hata ayıklamada önemlidir: GWIS isteği başarısızken Express logunda hiçbir istek görünmeyebilir.

## Koordinat dönüşümleri

```text
Bitki ve merkez:       { lat, lng }
Vejetasyon parametresi: lat, lon
Parsel köşesi:         [lng, lat]
Harita bounds:         [south, west, north, east]
WMS BBOX (1.1.1):      west,south,east,north
```

Aynı dört sayıyı dönüştürmeden kitaplıklar arasında taşımak haritayı yanlış bölgeye götürebilir.

## 3B varsayılanlar ve kaynak sınırları

Konumlu bitki/parsel varsa kamera çiftliğin ortalama merkezine odaklanır; yoksa İstanbul merkezini kullanır. Başlangıç tehdit yarıçapı 10 km'dir. Analiz küresi ve yükseklik gösterimleri görselleştirme öğeleridir; biyolojik bir yayılma modeli değildir.

Cesium ion token'ı yokken OSM tabanlı elipsoid görünümü kullanılır. İon arazisi, binalar ve diğer varlıkların erişimi hesap/token izinlerine bağlıdır.

Ayrıntılar: [GBIF algoritması](invasive-species.md), [vejetasyon](vegetation.md), [yangın verileri](fire-risk.md), [arazi ve tur](terrain-and-tour.md).
