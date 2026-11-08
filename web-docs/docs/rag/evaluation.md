---
title: RAG değerlendirmesi ve bilinen sınırlamalar
---

## Mevcut durum

Depoda RAG için etiketli sorgu kümesi, Recall@k/MRR raporu veya otomatik faithfulness ölçümü bulunmuyor. “RAG daha doğru” sonucu bu koddan tek başına çıkarılamaz. Aşağıdaki yöntem, uygulanabilecek değerlendirme planıdır; ölçülmüş sonuç değildir.

## 1. Retrieval veri kümesi

Her örnekte şunları saklayın:

```json
{
  "queryId": "plane-tree-001",
  "query": "Platanus orientalis yaprak altı beneklenme",
  "relevantPages": [
    {"source": "example.pdf", "page": 7}
  ],
  "inCorpus": true,
  "topic": "plant-pest"
}
```

Gerçek belge ve sayfa eşleşmelerini uzman incelemesiyle etiketleyin. Tür adıyla, belirtiyle, Türkçe/İngilizce ifadeyle ve korpus dışında kalan konularla ayrı örnekler hazırlayın. Aynı belgenin çok benzer sorularını eğitim/ayar ve değerlendirme kümelerine rastgele dağıtmak sonucu olduğundan iyi gösterebilir.

## 2. Retrieval metrikleri

```text
Recall@k = ilk k sonuçta bulunan ilgili sayfa sayısı / tüm ilgili sayfa sayısı
Precision@k = ilk k sonuçtaki ilgili sayfa sayısı / dönen sonuç sayısı
ReciprocalRank = 1 / ilk ilgili sonucun sırası
MRR = sorguların ReciprocalRank ortalaması
```

İlgili sayfa dönmeyen sorgunun ReciprocalRank değeri 0 alınır. Korpus dışı sorgular için, ilgili sayfa gerektiren Recall yerine yanlış kanıt getirme ve yanıt vermekten kaçınma davranışı ayrıca ölçülmelidir.

k büyüdükçe bağlam kapsamı artabilir; tekrar, alakasız alıntı ve üretim maliyeti de artabilir. Sistemin varsayılan k=5 seçimi ölçülmüş optimum olarak sunulmaz.

## 3. Üretim değerlendirmesi

Aynı sabit tanıyı şu koşullarla değerlendirin:

1. Referanssız değerlendirme.
2. Mevcut retrieval ile referanslı değerlendirme.
3. Uzmanın seçtiği doğru sayfalarla değerlendirme.

Üçüncü koşul, hatanın retrieval'dan mı yoksa üretimden mi kaynaklandığını ayırmaya yardım eder. Uzman incelemesinde önerinin kaynakta desteklenmesi, tanıyla ilgisi, belirsizliğin korunması ve kaynakla çelişme ayrı puanlanmalıdır.

Özellikle 2000 karakterlik kesmeden önce ve sonra hangi bilginin modelde kaldığını kontrol edin. Doğru sayfayı bulmak, gerekli cümlenin prompt'a ulaştığı anlamına gelmez.

## 4. Mevcut sınırlamalar

| Sınırlama | Sonuç |
|---|---|
| OCR yok | Taranmış sayfalar atlanır. |
| Sayfa temelli bölme | Bölünmüş tablo veya yöntem bağlam kaybedebilir. |
| Özet embedding'i | Özet hatası retrieval hatasına dönüşebilir. |
| Alaka eşiği yok | Korpus dışı sorgu da en yakın sayfaları alır. |
| Reranking/hybrid arama yok | İlk vektör sırası doğrudan kullanılır. |
| Sayfa başından kesme | Sondaki önemli bilgi üretime ulaşmayabilir. |
| Kaynaklar analiz yanıtında yok | Kullanıcı yanıtı PDF sayfasına kadar izleyemez. |
| İçerik hash'i yok | Güncellenmiş PDF eski kayıtla temsil edilebilir. |
| Ayrı görsel tanılar | UI karşılaştırması RAG etkisini tek başına ölçmez. |

## 5. İyileştirmeleri ölçerek seçme

Önerilen deneyler: içerik hash'iyle güncellik takibi, sorguya göre alıntı penceresi, alaka eşiği, hybrid retrieval, reranker ve kaynakların API'ye taşınması. Bunlar mevcut özellik değildir.

Her değişimde aynı değerlendirme kümesini, k değerini, embedding modelini ve prompt sürümünü kaydedin. Gecikme için p50/p95, başarısız istek oranı ve sorgu başına token kullanımını izleyin. Hiçbir tek benzerlik skorunu bitki teşhisinin doğruluk yüzdesi olarak göstermeyin.
