---
title: Görev tekrarı, pano ve türetilmiş sağlık durumu
---

## Görev durumları

Veritabanı iki boolean taşır: `done` ve `inProgress`. Pano durumu şu sırayla türetilir:

```text
done == true       → done
inProgress == true → doing
diğer              → todo
```

`done` önceliklidir. Pano `todo` veya `doing` durumuna taşıyınca `done=false` yapılır, `doneAt` temizlenir. `done` durumuna taşıma ortak tamamlama akışını kullanır.

## Çift tıklamada tekrarı önleme

Tamamlama işlemi şu filtreyle atomik bir güncelleme yapar:

```text
{ _id: taskId, owner: currentUser, done: false }
→ { done: true, doneAt: now }
```

Birden fazla istek aynı görevi tamamlarsa yalnızca ilk güncelleme açık kaydı bulur. Sonrakiler mevcut görevi döndürür ve `next: null` verir.

Bu koruma tamamlamayı işaretleme adımını kapsar. Sonraki tekrarı oluşturma ayrı yazmadır; ikisini kapsayan transaction bulunmaz. İşaretlemeden sonra oluşturma hata verirse gelecekteki kayıt eksik kalabilir.

## Sonraki son tarih

`nextDueDate(due, repeat, now)`:

1. Eski son tarihe bir aralık ekle.
2. Bulunan tarih şimdiye eşit veya geçmişteyse tekrar bir aralık ekle.
3. İlk gelecekteki tarihi döndür.

```python
# Mevcut TypeScript davranışının sözde kodu
next_date = add_interval(due_date, repeat)
while next_date <= now:
    next_date = add_interval(next_date, repeat)
return next_date
```

Günlük ve haftalık aralıklar UTC gününe 1 veya 7 ekler. Aylık aralık `setUTCMonth` kullanır; ay sonları JavaScript tarih taşması kurallarına tabidir. Örneğin her ayın son iş gününü koruyan özel takvim algoritması yoktur.

Çok eski görevlerde döngü, atlanan dönem sayısı kadar adım atar. Bir sonraki görev eski kaydın başlığı, notları ve ilişkilerini kopyalar. Bu bir cron scheduler değildir; yeni örnek kullanıcı görevi tamamladığında oluşur.

## Bitki sağlık durumu

Bitki özetinde en yeni analiz kaydı seçilir: kullanıcıya ait, bitkiye bağlı kayıtlar `createdAt` azalan sıralanır; bitki başına ilk kayıt alınır.

| assessment.severity | Görünen durum |
|---|---|
| none | healthy |
| low | watching |
| medium / high | treating |
| critical | critical |
| Diğer / analiz yok | unknown |

Açık görevler ayrıca `done=false` üzerinden sayılır. Bitki listesi, en yeni analiz ve görev sayıları paralel sorgulanır; Map ile bitki kimliğinde birleştirilir. En yeni analiz kaydı silinirse önceki kayıt görünür durumu belirleyebilir.

## Toplu etiketleme

Kimlikler tekilleştirilir, tüm bitkilerin kullanıcıya ait olduğu doğrulanır. Etiketler önce çıkarılır, sonra eklenir ve Set ile tekilleştirilir. Sonuç 10 etiketi aşarsa hiçbir bulkWrite başlatılmaz. Bu ön kontrol, veritabanı yazımlarının transaction ile atomik olduğu anlamına gelmez.

Kaynaklar: [farm-service.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/services/farm-service.ts), [task-controller.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/controllers/task-controller.ts), [farm-overview-service.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/services/farm-overview-service.ts).
