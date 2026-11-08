---
title: Sorun giderme ve bilinen boşluklar
---

## RAG ayakta ama analiz 503 dönüyor

1. Flask `/health` yanıtında `indexedPages` değerini kontrol edin.
2. Sıfırsa metni çıkarılabilir PDF'ler ekleyin ve manuel ingest çalıştırın.
3. İndeksleme sonrası API konteynerini yeniden başlatın.
4. `docker compose logs --tail 100 rag` ile embedding/özet hatalarını inceleyin.
5. `RAG_URL` değerinin backend'in çalıştığı ağdan erişildiğini kontrol edin.

Flask'ın sağlık kontrolü Gemini erişimini sınamaz. İndeks dolu olsa da anahtar, kota veya model erişimi nedeniyle query embedding'i 503 olabilir.

## Yanlış veya alakasız PDF sayfaları geliyor

Mevcut algoritma alaka eşiği olmadan top-k döndürür. Önce `buildRetrievalQuery` ile oluşan tür/zararlı/belirti metnini, ardından doğrudan `/query` sonuçlarını inceleyin. Kaynak kapsamını ve özeti kontrol edin.

Yalnız k'yı artırmak sorunu çözmeyebilir; daha fazla ilgisiz alıntı getirebilir. Doğru sayfa bulunduysa bile ilk 2000 karakterin gerekli bilgiyi içerdiğini doğrulayın. [Değerlendirme rehberi](../rag/evaluation.md).

## Yeni PDF içeriği görünmüyor

Sayfa kimliği içerik hash'i değildir. Aynı yoldaki sayfa değişince eski kayıt atlanır. Dosya silmek de indeksi temizlemez. Sadece yeniden adlandırmak eski kayıtları bırakabilir. Yedekli ve hedef koleksiyonu belirleyen yeniden indeksleme planı kullanın; bütün Compose volume'larını silmek varsayılan çözüm değildir.

## Bazı sayfalar hiç indekslenmiyor

Metin seçilemiyorsa OCR eksikliği olabilir. Ayrıca sayfa özet çağrısı retry sonrası başarısız olduğunda loglanıp atlanır. Batch embedding/upsert hatası ise çalışmayı durdurabilir. Her sayfanın atlanma nedenini aynı hata kategorisi saymayın.

## Login çalışıyor ama me isteği 401

Cookie'nin gerçekten kaydedilip gönderildiğini kontrol edin. Axios `withCredentials`, Express credentials CORS, izinli origin ve Secure/SameSite politikaları birlikte etkili olur. Üretimde HTTP üzerinden Secure cookie gönderilmez. Farklı site dağıtımında SameSite=Strict engeli olabilir.

Aynı refresh token'ın iki sekmeden eşzamanlı kullanımı aile iptaline yol açabilir. Sayfa içi tek Promise bu sekmeler arası durumu çözmez.

## Logout sonrası token hâlâ geçerli

Logout yalnızca cookie'leri siler. Sunucuda refresh ailesi iptali uygulanmaz. Bu mevcut uygulama sınırıdır; JWT'nin exp süresi ve diğer doğrulama koşulları geçerliliği belirler.

## Coğrafi yanıt 200 ama bazı alanlar null

Vejetasyon API'si kısmi başarı döndürebilir. `unavailable` alanını okuyun. CORINE kapsam dışı konumda hata olmadan null olabilir. Veri yokluğu, servis hatası ve gerçek sıfır değer birbirinden ayrıdır.

`coveragePercent` düşükken `vegetationPercent` değerini bütün alanın kesin oranı gibi göstermeyin.

## /api/risk çalışmıyor

Mevcut backend'e bu route bağlanmamıştır. İstemci tipi ve fonksiyonunun bulunması çalışan endpoint kanıtı değildir. GWIS WMS katmanları ayrı doğrudan ağ istekleri kullanır.

## Üretimde env bulunmuyor

Backend'in derlenmiş env çözümleme yolu kaynak modülün yolundan farklıdır. Süreç ortamını kullanın veya mevcut `start:local` komutunu değerlendirin. [Dağıtım sayfası](deployment.md).

## Docusaurus derlenmiyor

- `npm ci` komutunu `web-docs` içinde çalıştırın.
- Markdown dosyasını sidebar'a eklediğinizden ve bağlantı hedeflerinin mevcut olduğundan emin olun.
- Kod örneklerini fenced code block içine alın; MDX, çıplak `<placeholder>` veya süslü parantezi kod sanabilir.
- Tailwind 4 için PostCSS eklentisi `@tailwindcss/postcss` olmalıdır.
- Başlık anchor'ları değiştiyse iç bağlantıları düzeltin; kırık bağlantılar derlemeyi durdurur.
- Env veya config değişikliğinden sonra geliştirme sunucusunu yeniden başlatın.

Genel otomatik uygulama/RAG test takımı ve ölçülmüş kalite raporu bu incelemede bulunmadı. Doküman sitesinin typecheck/build başarısı, dış servislerin canlı doğruluğu veya biyolojik önerilerin uzman tarafından doğrulandığı anlamına gelmez.
