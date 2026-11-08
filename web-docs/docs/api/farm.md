---
title: Bitki, parsel, kayıt ve görev API'si
---

Tüm yollar `/api` tabanına göredir ve kimlik doğrulama gerektirir. İşlemler mevcut kullanıcının `owner` kapsamındadır.

## Bitkiler

| Metot | Yol | İşlev |
|---|---|---|
| GET / POST | `/plants` | Liste / oluştur |
| GET / PATCH / DELETE | `/plants/:id` | Oku / güncelle / sil |
| GET / PUT / DELETE | `/plants/:id/photo` | Görüntü byte'ı / fotoğraf ekle / kaldır |

Liste opsiyonel `parcelId` filtresi alır. Oluşturma örneği:

```json
{
  "name": "Bahçedeki çınar",
  "latinName": "Platanus orientalis",
  "careNote": "Düzenli gözlem",
  "location": {"lat": 38.42, "lng": 27.14},
  "parcelId": null
}
```

`name` 1–80 karakter; latinName en fazla 120, careNote 2000 karakterdir. Konum aralıkları lat ±90, lng ±180'dir. Parsel ilişkisi verilirse aynı kullanıcıya ait olmalıdır. Fotoğraf PUT işlemi analizle aynı `image` alanını ve boyut/MIME sınırlarını kullanır.

## Parseller

| Metot | Yol | İşlev |
|---|---|---|
| GET / POST | `/parcels` | Liste / oluştur |
| GET / PATCH / DELETE | `/parcels/:id` | Oku / güncelle / sil |

```json
{
  "name": "Deneme tarlası",
  "kind": "field",
  "polygon": [[27.14,38.42],[27.141,38.42],[27.141,38.421]],
  "notes": "Kuzey bölüm"
}
```

`kind` field veya garden; oluştururken varsayılan field. Polygon 3–500 adet `[lng,lat]` köşesidir. Kapanış köşesi zorunlu değildir. Yanıtta `plantCount` hesaplanır.

Parsel silinince bitkiler ve görevler silinmez; yalnızca parsel bağlantısı temizlenir.

## Analiz kayıtları

| Metot | Yol | İşlev |
|---|---|---|
| GET / POST | `/analysis-records` | Liste / snapshot kaydet |
| GET / PATCH / DELETE | `/analysis-records/:id` | Oku / etiket-bağlantı güncelle / sil |

GET `plantId` ve `tag` filtrelerini destekler; en yeni 200 kayıt döner.

POST gövdesi:

```typescript
type RecordInput = {
  mode: 'standard' | 'rag';
  plantId?: string | null;
  tags?: string[];
  analysis: PlantAnalysis;
  assessment: PlantRiskAssessment;
  sources?: {
    source: string;
    page: number;
    score: number;
    summary: string;
  }[];
};
```

`PlantAnalysis` ve `PlantRiskAssessment` alanları [analiz yanıtındaki](analysis.md) tam şemadır. En fazla 20 kaynak kabul edilir; verilmezse sources boş listedir. Ham sayfa metni kaynak giriş şemasında bulunmaz.

Etiketler trim edilir, tekilleştirilir; en fazla 10 etiket ve her biri 1–30 karakterdir. PATCH yalnızca `tags` ve `plantId` değiştirir. Tanı ve değerlendirme snapshot olarak korunur. Kayıt gövdesi istemciden geldiğinden şema geçerliliği kaynağın doğrulanmış olduğu anlamına gelmez.

## Görevler

| Metot | Yol | İşlev |
|---|---|---|
| GET / POST | `/tasks` | Liste / oluştur |
| PATCH / DELETE | `/tasks/:id` | Güncelle / sil |
| POST | `/tasks/:id/complete` | Tamamla ve gerekiyorsa sonraki örneği oluştur |

Liste filtreleri: `done=true/false`, `plantId`, `parcelId`. Açık görevler önce, kendi aralarında son tarihe göre sıralanır. Tek görev GET endpoint'i tanımlı değildir.

```json
{
  "title": "Yaprakları kontrol et",
  "dueDate": "2026-11-10T09:00:00+03:00",
  "repeat": "weekly",
  "plantId": null,
  "parcelId": null
}
```

Başlık 1–200, notlar en fazla 2000 karakterdir. Tarih offset içeren ISO datetime olmalıdır. Repeat `none/daily/weekly/monthly`; varsayılan none.

Tamamlama yanıtında `data={task,next}` bulunur; next tekrar yoksa null'dır. Tamamlanmış görevi tekrar tamamlama yeni tekrar üretmez. Yeniden açmak için PATCH `{"done":false}`; tamamlamak için PATCH done=true kullanılamaz.

## Çiftlik özetleri ve pano

| Metot | Yol | İşlev |
|---|---|---|
| GET | `/farm/plants` | Bitkiler + sağlık durumu + en yeni analiz + açık görev sayısı |
| PATCH | `/farm/plants/tags` | Çoklu bitki etiketi |
| GET | `/farm/board` | status alanlı görev listesi |
| PATCH | `/farm/tasks/:id/status` | todo / doing / done durumuna taşı |

Toplu etiket gövdesi `{"ids":["ID"],"add":["izle"],"remove":[]}` biçimindedir; 1–200 kimlik ve en az bir etiket ekleme/çıkarma gerekir. Yeni etiket toplamı her bitkide en fazla 10 olabilir.

Pano durum gövdesi `{"status":"doing"}` biçimindedir. todo/doing yanıtı taşınan görevi, done yanıtı tamamlama akışının `{task,next}` biçimini kullanır. Tek bir değişmez yanıt şekli varsaymayın.

İlişki temizleme ve veri tipleri [veri modelinde](../architecture/data-model.md), tekrar algoritması [görev yaşam döngüsünde](../algorithms/task-lifecycle.md).
