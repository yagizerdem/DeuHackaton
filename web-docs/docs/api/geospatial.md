---
title: Coğrafi sorgu API'leri
---

Her iki Express endpoint'i de access token gerektirir. Sayısal query parametreleri Zod ile sayıya çevrilir.

## İstilacı tür gözlemleri

```bash
curl 'http://localhost:3000/api/invasive-species?lat=38.42&lng=27.14&radiusKm=25' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

| Parametre | Aralık | Varsayılan |
|---|---|---|
| lat | -90…90 | Zorunlu |
| lng | -180…180 | Zorunlu |
| radiusKm | 1…100 | 25 |

`data` alanları:

| Alan | İçerik |
|---|---|
| center | `{lat,lng}` |
| radiusKm | İstenen yarıçap |
| observations | `{id,species,year,lat,lng,distanceKm}[]` |
| species | `{species,count,nearestKm}[]` |
| nearest | En yakın gözlem veya null |
| yearRange | `{min,max}` veya null |
| truncated | GBIF sayfa sınırına ulaşıldı mı? |
| source | GBIF |

Boş gözlem listesi geçerli sonuçtur. Bu yanıt, seçilmiş türler için yayımlanmış gözlemleri gösterir; bütün yerel tehditlerin yokluğunu/varlığını kanıtlamaz. [Algoritma ayrıntıları](../maps/invasive-species.md).

## Vejetasyon analizi

```bash
curl 'http://localhost:3000/api/vegetation?lat=38.42&lon=27.14&radiusKm=1' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

| Parametre | Aralık | Varsayılan |
|---|---|---|
| lat | -90…90 | Zorunlu |
| lon | -180…180 | Zorunlu |
| radiusKm | 0.1…5 | 1 |

Boylam ismi burada **lon**, istilacı tür endpoint'inde **lng** değeridir.

`data` yapısı:

```typescript
type VegetationAnalysis = {
  location: {lat: number; lon: number; radiusKm: number};
  landCover: {
    source: string;
    year: number;
    coveragePercent: number;
    vegetationPercent: number;
    classes: {code: string; label: string; group: string; vegetated: boolean; percent: number}[];
    groups: {group: string; label: string; percent: number}[];
  } | null;
  species: {
    source: string;
    totalOccurrences: number;
    items: {name: string; count: number}[];
  } | null;
  terrain: {elevationM: number} | null;
  climate: {year: number; meanTempC: number; annualPrecipMm: number} | null;
  summary: string[];
  unavailable: string[];
};
```

## Kısmi başarıyı doğru ele alma

HTTP 200, dört dış kaynağın tamamının başarılı olduğu anlamına gelmez. Alan null ise `unavailable` listesine de bakın. Örneğin CORINE kapsamı dışında `landCover=null` geçerli sonuç olabilir; bu durumda CORINE hata listesinde bulunmayabilir.

Tüm kaynaklar başarısızsa 503. Geçersiz parametrelerde 400. GBIF istilacı tür isteği tek temel kaynağa dayandığı için onun hatasında aynı kısmi yanıt mantığı uygulanmaz.

## Uygulanmamış API'ler

Arazi eğimi, tur sıralaması ve poligon alanı için Express endpoint'i yoktur; istemcide hesaplanır. GWIS WMS de bu iki JSON endpoint'inin parçası değildir. Ayrıca istemcide tanımı olan `/api/risk` mevcut backend'e bağlanmamıştır.

Hesaplama sınırları [vejetasyon](../maps/vegetation.md), [arazi/tur](../maps/terrain-and-tour.md) ve [yangın](../maps/fire-risk.md) sayfalarında açıklanır.
