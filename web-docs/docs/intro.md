---
title: Depark Hackaton teknik dokümantasyonu
description: Bitki koruma uygulamasının mimarisi, RAG algoritması, coğrafi analizleri ve API sözleşmeleri.
slug: /
---

Depark Hackaton, bitki fotoğraflarını yapılandırılmış tanıya dönüştüren, tanıyı bir PDF bilgi tabanıyla destekleyen ve çiftlik verilerini haritalarla birleştiren bir karar destek uygulamasıdır. Bu dokümantasyon; geliştiriciler, teknik değerlendiriciler ve sistemi yerelde çalıştıracak ekipler için hazırlanmıştır.

## Sistem neler yapıyor?

- Fotoğraftan bitki türü, belirtiler ve olası zararlı/hastalıkları çıkarır.
- Standart ve RAG destekli risk değerlendirmelerini ayrı isteklerle üretir.
- Bitkileri, parselleri, analiz kayıtlarını ve tekrarlayan bakım görevlerini kullanıcıya ait veriler olarak saklar.
- GBIF gözlemlerini, CORINE arazi örtüsünü ve Open-Meteo verilerini analiz eder.
- Leaflet ile 2B yangın katmanlarını; Cesium ile çiftliği, tehditleri, araziyi ve görev turunu 3B haritada gösterir.

## Nereden başlamalı?

| Amaç | Okuma yolu |
|---|---|
| Sistemi çalıştırmak | [Kurulum](getting-started/installation.md) → [Yapılandırma](getting-started/configuration.md) → [İlk analiz](getting-started/first-analysis.md) |
| Kod tabanını anlamak | [Mimari](architecture/overview.md) → [Depo yapısı](architecture/repository.md) → [Veri modeli](architecture/data-model.md) |
| RAG algoritmasını öğrenmek | [RAG genel bakış](rag/overview.md) → [İndeksleme](rag/ingestion.md) → [Embedding](rag/embeddings.md) → [Arama](rag/retrieval.md) → [Yanıt üretimi](rag/generation.md) |
| Harita algoritmalarını incelemek | [Coğrafi analiz](maps/overview.md) → [Vejetasyon](maps/vegetation.md) → [Arazi ve tur](maps/terrain-and-tour.md) |
| Bir istemci geliştirmek | [API kuralları](api/overview.md) → [Kimlik doğrulama](api/authentication.md) → [Analiz API'si](api/analysis.md) |
| Sorun çözmek | [İşletim](operations/deployment.md) → [Sorun giderme](operations/troubleshooting.md) |

## Dokümantasyonun doğruluk sınırı

Anlatım 8 Kasım 2026 tarihinde incelenen yerel kaynak koda dayanır. Çalışma ağacındaki henüz commit edilmemiş 3B harita dosyaları da incelenmiştir; GitHub bağlantılarındaki uzak `dev` dalı bunların tamamını henüz içermeyebilir. Çalışan davranışlar ile geliştirme önerileri özellikle ayrılmıştır.

Model isimleri ve parametreler koddaki yapılandırmayı gösterir; sağlayıcı hesabınızda ilgili modelin kullanılabilir olduğunu garanti etmez. Ölçülmüş bir doğruluk oranı, gecikme veya maliyet raporu bulunmadığı için bu tür rakamlar başarı ölçümü olarak sunulmaz.

> **Kritik ayrımlar**
>
> RAG servisi metin parçalarını getirir; son risk değerlendirmesini Express backend üretir. Analiz uç noktaları sonuçları otomatik kaydetmez. RAG kaynakları backend analiz yanıtına eklenmez. Harita gözlemleri de hastalık teşhisi veya yayılım olasılığı değildir.

Bu ayrımların teknik sonuçları [RAG sınırlamalarında](rag/evaluation.md) ve [analiz sözleşmesinde](api/analysis.md) açıklanır.
