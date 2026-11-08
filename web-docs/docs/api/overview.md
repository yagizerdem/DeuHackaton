---
title: API kuralları ve uç nokta haritası
---

## Servis tabanları

| Servis | Yerel taban | Sözleşme |
|---|---|---|
| Express | `http://localhost:3000` | Kullanıcı ve uygulama API'si |
| Express API | `http://localhost:3000/api` | JSON ve multipart işlemler |
| Swagger UI | `http://localhost:3000/api-docs` | Route açıklamalarından üretilir |
| OpenAPI JSON | `http://localhost:3000/api-docs.json` | Makine tarafından okunabilir şema |
| Flask RAG | `http://localhost:5001` | Dahili retrieval servisi |

Kodda analiz yolu **`plan-analysis`** olarak yazılmıştır; `plant-analysis` adresi tanımlı değildir.

## Yanıt zarfı

Express controller'larının genel yanıtı:

```json
{
  "httpStatusCode": 200,
  "message": "OK",
  "data": {}
}
```

Doğrulama hatası:

```json
{
  "httpStatusCode": 400,
  "message": "Validation failed",
  "formErrors": {
    "name": ["Too small: expected string to have >=1 characters"]
  }
}
```

Hata mesajı örneği temsilidir. `data` ve `formErrors` bulunmayabilir. HTTP durumunu gerçek response status üzerinden kontrol edin; yalnızca gövdeye güvenmeyin.

İstisnalar: Express `/health`, OpenAPI JSON ve fotoğraf byte yanıtı bu zarfı kullanmaz. Flask yanıtı da `results` veya `message` alanlarıyla doğrudan döner. Tanımsız Express yolları için JSON zarf garantisi yoktur.

## Kimlik doğrulama

Korumalı uygulama yolları access token'ı `Authorization: Bearer TOKEN` başlığından veya `accessToken` cookie'sinden alır. Bearer başlığı varsa cookie'ye göre önceliklidir. Ayrıntılar [auth referansında](authentication.md).

| Grup | Korumalı mı? |
|---|---|
| Auth register/login/refresh/logout | Hayır; refresh kendi token'ını doğrular. |
| Auth me | Evet |
| Plan analysis | Evet |
| Plants / parcels / records / tasks / farm | Evet |
| Vegetation / invasive-species | Evet |
| Health / Swagger | Hayır |
| Flask query / health | Kodda auth uygulanmamış |

## Hata durumları

| HTTP | Tipik neden |
|---|---|
| 400 | Geçersiz giriş, eksik dosya, hatalı k |
| 401 | Token eksik, geçersiz veya süresi dolmuş |
| 404 | Kayıt yok veya o kullanıcıya ait değil |
| 409 | Benzersiz email/userName çakışması, yazma çakışması |
| 413 | Görsel veya belge boyutu sınırı |
| 415 | Desteklenmeyen görsel MIME türü |
| 422 | Model çıktısı şemaya uymuyor veya iş kuralı ihlali |
| 503 | Model, RAG veya dış veri servisi kullanılamıyor |
| 500 | Beklenmeyen uygulama / indeks hatası |

## PATCH sözleşmesi

Ortak çiftlik PATCH şemalarında verilmeyen alan mevcut değeri korur. `null`, yalnızca nullable/optional alanlarda değeri temizlemek için kullanılır. Örneğin `{"parcelId":null}` ilişkiyi kaldırır; `{"name":null}` geçerli değildir.

Liste endpoint'leri genel bir sayfalama sözleşmesi uygulamaz. Analiz kayıt listesi en yeni 200 sonuçla sınırlıdır. Kaynak dosyada bulunan `ApiFeatures` yardımcı sınıfının varlığı bütün route'ların bu filtreleri kullandığı anlamına gelmez.

Referanslar: [analiz](analysis.md), [çiftlik](farm.md), [coğrafi API](geospatial.md).
