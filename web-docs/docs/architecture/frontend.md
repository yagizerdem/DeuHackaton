---
title: Frontend, durum yönetimi ve API istemcisi
---

## Route yapısı

| Yol | Ekran |
|---|---|
| `/` | Tanıtım ana sayfası |
| `/register`, `/login` | Hesap işlemleri |
| `/plant-protection-assistant` | Standart ve RAG analiz çalışma alanı |
| `/plants`, `/parcels`, `/records`, `/tasks` | Çiftlik kayıtları |
| `/plants/overview` | Türetilmiş sağlık durumu ve görev özeti |
| `/tasks/board` | Görev panosu |
| `/2dmap` | Leaflet ve GWIS katmanları |
| `/3dmap` | Cesium birleşik haritası |
| `/invasive-species` | `/3dmap` adresine yönlendirme |

React Router tarayıcı geçmişini kullanır. Üretim web sunucusu bu uygulamanın bilinmeyen route'larını `index.html` dosyasına yönlendirmelidir. Docusaurus ayrı bir sitedir ve kendi statik yollarını üretir.

## Durum türleri

- Auth provider: `/auth/me` sonucundaki kullanıcı ve başlangıç yüklenme durumu.
- Tema provider: tarayıcı tercihleri ve localStorage üzerinden tema.
- TanStack Query: uzak kaynakların listeleri, mutation'lar ve cache geçersizleştirme.
- 2B harita provider'ı: seçili tarih, katman seçenekleri, tıklanan konum ve panel.
- 3B harita bileşeni: katmanlar, seçim, çizim, kamera odağı ve tur durumu.

Her yazma işleminden sonra çiftlik listelerini birlikte geçersizleştirmek, bitki silmenin görev/parsel/analiz ilişkilerine etkisini de yeniler. Bu yaklaşım ek istek üretebilir; bağımlılık takibini basitleştirir.

## 401 ve tek refresh isteği

`lib/axios-wrapper.ts`, cookie'leri `withCredentials: true` ile gönderir. Bir 401 alındığında:

1. Login, register ve refresh istekleri hariç tutulur.
2. İstek daha önce denenmişse tekrar edilmez.
3. Aynı anda hata alan istekler tek bir `refreshing` Promise'ını paylaşır.
4. Refresh başarılıysa özgün istek bir kez tekrar gönderilir.
5. Refresh başarısızsa özgün hata reddedilir.

Ayrı `refreshClient` kullanılması interceptor'ın kendi refresh isteğine tekrar girmesini engeller. Promise paylaşımı aynı sayfadaki istekleri kapsar; farklı sekmeler arasında kilit oluşturmaz.

## İyimser pano ve geri alınabilir silme

Pano kartı taşındığında önce `board` cache'i güncellenir. Önceki veri saklanır; sunucu reddederse geri yüklenir. İstek sonuçlandığında listeler yeniden sorgulanır; tekrarlayan görev yeni kayıt oluşturabilir.

Geri alınabilir silmede kayıt hemen gizlenir, gerçek DELETE yaklaşık 6 saniyelik geri alma penceresi kapandıktan sonra gönderilir. Geri alma, sunucuya yazmadan yerel görünürlüğü geri getirir. Bileşenden ayrılmak bekleyen işlemleri gönderir; sekmenin tamamen kapanması güvenilir ağ teslimi garantisi değildir.

## Analiz ekranı

Standart ve RAG mutation'ları bağımsızdır. Biri hata verse de diğeri sonuç gösterebilir. Sonuçları kayıt altına alma ayrıca yapılır. Kaynak tipinde isteğe bağlı `sources` bulunması backend'in bunu gerçekten döndürdüğü anlamına gelmez.

Kaynaklar: [router.tsx](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/web/src/router.tsx), [axios-wrapper.ts](https://github.com/yagizerdem/DeuHackaton/blob/dev/apps/web/src/lib/axios-wrapper.ts).
