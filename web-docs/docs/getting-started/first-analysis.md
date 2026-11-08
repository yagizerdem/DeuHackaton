---
title: İlk analiz ve kayıt akışı
---

## Önce bağlantıları kontrol edin

```bash
curl http://localhost:3000/health
curl http://localhost:5001/health
```

İlk yanıt `{"status":"ok","db":true}` biçimindedir. İkinci yanıttaki `indexedPages` pozitif olmalıdır. RAG sağlık yanıtı API anahtarının çalıştığını sınamaz; yalnızca indeks sayısını okur.

## Kayıt ve giriş

Örnekler Bash içindir; Windows PowerShell'de yerel curl davranışı farklıysa `curl.exe` kullanın.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.org","password":"example-password-123","userName":"demo-user"}'

curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.org","password":"example-password-123"}'
```

Kayıt işlemi token üretmez; giriş ayrıca yapılır. `cookies.txt` oturum bilgisi içerir, paylaşmayın veya Git'e eklemeyin.

## Aynı görsel için iki değerlendirme

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/plan-analysis \
  -F 'image=@leaf.jpg'

curl -b cookies.txt -X POST http://localhost:3000/api/plan-analysis/rag \
  -F 'image=@leaf.jpg'
```

Her ikisi `data.analysis` ve `data.assessment` döndürür. İkinci istekte değerlendirme, bulunan PDF sayfalarından beslenir. Ancak iki istek görsel tanıyı bağımsız üretir; sonuçların farklı olması yalnızca RAG etkisini kanıtlamaz.

Tarayıcıdaki analiz formu iki isteği birlikte başlatır. Standart akış iki üretim çağrısı, bitki içeren RAG akışı iki üretim ve bir embedding çağrısı yapar. Yeniden denemeler hariç toplam beş model çağrısı oluşur.

## Yanıtı okuma

- `analysis.species.confidence`: modelin ürettiği 0–1 arası tanı alanı; kalibre edilmiş klinik doğruluk değildir.
- `assessment.severity`: `none`, `low`, `medium`, `high`, `critical`.
- `assessment.urgency`: `monitor`, `within_weeks`, `within_days`, `immediate`.
- `assessment.treatmentPlan`: adım ve zamanlama çiftleri.
- `assessment.reportToAuthorities`: modelin değerlendirmesi; otomatik bildirim gönderilmez.

Görsel bitki içermiyorsa RAG araması atlanır; risk değerlendirmesi yine ayrı bir model çağrısıyla üretilir.

## Sonucu kalıcı saklama

Analiz oluşturmak MongoDB kaydı oluşturmaz. Arayüzde sonuç altındaki kayıt eylemiyle bitki ve etiket seçilir; `POST /api/analysis-records` çağrılır. Bitki ekleme işlemi de ayrıdır: tanınan tür kendiliğinden `Plant` oluşturmaz.

Backend RAG analiz yanıtına `sources` eklemediğinden normal kayıt akışında kaynak listesi boş kalabilir. İstemcideki isteğe bağlı kaynak tipi bu veri akışını değiştirmez. Ayrıntılar [analiz API'sinde](../api/analysis.md).
