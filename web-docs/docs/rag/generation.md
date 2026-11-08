---
title: Getirilen sayfalardan risk yanıtı üretimi
---

## Bağlam oluşturma

Flask yanıtı backend'e döndükten sonra `assessPlantRisk` her kaydı şu yapıya çevirir:

```text
[1] eppo/example.pdf, page 7:
<ham sayfa metninin ilk 2000 karakteri>

[2] another.pdf, page 3:
<ham sayfa metninin ilk 2000 karakteri>
```

Son prompt önce `Diagnosis:` ve tanı JSON'unu, ardından kaynak varsa `Reference excerpts:` bölümünü içerir. Üretim modeline ham sayfalar gider; `summary` ve `score` alanları prompt'a eklenmez.

Varsayılan k=5 ile en fazla 10.000 ham metin karakteri aktarılır. Kaynak etiketleri, ayraçlar, tanı JSON'u ve sistem talimatı bunun dışındadır. Bu bir token bütçesi değildir.

## 2000 karakter sınırının etkisi

Kesme `text.slice(0, 2000)` ile baştan yapılır. Sorguyla en alakalı cümleyi seçen bir pencereleme algoritması yoktur. Özet, sayfanın sonundaki kontrol yöntemini temsil edip sayfanın ilk 2000 karakterinde bu yöntem bulunmayabilir. Bu durumda arama doğru sayfayı bulsa bile üretim yeterli bağlamı alamaz.

Benzer şekilde çok sayıda komşu sayfa seçilirse bağlam aynı bilgiyi tekrar edebilir. Kodda deduplication veya bağlam sıkıştırma aşaması yoktur.

## Model talimatları

Sistem talimatı:

- Türkçe ve yalnızca istenen JSON alanlarını üretmesini,
- şiddet ve aciliyeti tanıdan değerlendirmesini,
- tedavi adımlarını ve izlemeyi referans alıntılarına dayandırmasını,
- alıntılarla çelişmemesini ve yeni kaynak uydurmamasını ister.

Çıktı standart analizle aynı `PlantRiskAssessment` şemasından geçer. İstemci iki yöntemi ortak bileşenle gösterebilir.

Prompt'ta istenmesi, her cümlenin kaynağa dayandığını mekanik olarak doğrulamaz. Uygulamada cümle-kaynak eşleme, otomatik citation checker veya yanıt sonrası faithfulness denetimi yoktur.

## Kaynakların istemciye aktarılmaması

Controller şu yanıtı üretir:

```text
{ analysis, assessment }
```

`sources` veya ham PDF metni bu yanıta eklenmez. Flask API'sine doğrudan erişen bir istemci kaynakları görebilir; normal web analiz yanıtından aynı iz sürme yapılamaz.

İstemci tarafında isteğe bağlı `sources` alanı ve analiz kayıt şemasında kaynak listesi bulunur. Bu alanların varlığı verinin otomatik doldurulduğu anlamına gelmez. Kayıt oluşturma `sources` verilmezse boş liste kullanır.

## Standart analizle karşılaştırma

Standart akış tanı JSON'unu referans olmadan değerlendirir. RAG akışı aynı şemaya referans ekler. Ancak web formu her akış için görsel tanıyı yeniden üretir. Bu yüzden iki çıktıyı yan yana değerlendirmek kontrollü bir RAG ablation deneyi değildir.

Adil değerlendirmede sabit bir tanı alınmalı; aynı tanı referanslı ve referanssız koşullara verilmelidir. Bu önerilen bir ölçüm yöntemidir; mevcut UI böyle bir ortak tanı cache'i kullanmaz.

## Güven ve hata davranışı

PDF metni dışarıdan gelen veridir. Kod alıntıları prompt'a doğrudan ekler; prompt injection'a özel ayrıştırma veya güvenlik filtresi bulunmaz. Şema doğrulaması biçimi sınırlar, içerik talimatlarını bütünüyle güvenli hale getirmez.

RAG erişimi başarısızsa otomatik olarak standart değerlendirmeye geri dönülmez; RAG endpoint'i hata verir. Görsel bitki değilse ise arama bilinçli olarak atlanır ve referanssız değerlendirme yapılır.

Kaynaklar: [analiz servisi](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/services/plant-analysis-service.ts), [controller](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/backend/src/controllers/plan-analysis-controller.ts).
