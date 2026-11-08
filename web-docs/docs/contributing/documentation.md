---
title: Dokümantasyona katkı ve Tailwind kullanımı
---

## İçerik düzeni

Her konu kendi Markdown dosyasında tutulur. Yeni içerik için en yakın alanı seçin:

| Dizin | İçerik |
|---|---|
| getting-started | Kurulum ve ilk kullanım |
| architecture | Katmanlar ve veri sahipliği |
| algorithms | Görsel analiz ve iş kuralları |
| rag | İndeksleme, retrieval, üretim ve kalite |
| maps | Coğrafi algoritmalar ve veri kaynakları |
| api | HTTP sözleşmesi ve örnekler |
| operations | Dağıtım ve sorun giderme |

Başlık ve açıklama için YAML frontmatter kullanın. Sayfa sırası `sidebars.ts` içinde açıkça tanımlıdır; dosya eklemek tek başına menüye eklemez. Diğer dokümanlara göreli `.md` bağlantısı verin; Docusaurus bunları site route'una çevirir.

## Kaynak koda dayanma

Bir davranışı anlatırken giriş noktası, service, şema ve yanıtı birlikte kontrol edin. README veya kod yorumu güncel uygulamayla çelişiyorsa yürütülen kodu esas alın. Örneğin parselin kapalı halkası, kaynakların API'ye dönmesi ve /risk route'u yalnızca yorumdan çıkarılamaz.

Önerileri “uygulanmış özellik” olarak yazmayın. Temsilî JSON, maliyet ve test verisini açıkça belirtin. Ortam dosyalarındaki gerçek değerleri kopyalamayın; değişken adları ve sahte örnekler yeterlidir.

## Mermaid diyagramları

Bu site `@docusaurus/theme-mermaid` kullanır. Markdown içinde `mermaid` dil etiketli fenced code block ile akış, sequence ve veri modeli diyagramları yazılabilir. Diyagramdaki servisler ve yan etkiler gerçek çağrı zinciriyle uyumlu olmalıdır.

## Tailwind 4 kurulumu

Bağımlılıklar yalnızca `web-docs/package.json` ve yerel lockfile içindedir:

- `tailwindcss`
- `@tailwindcss/postcss`
- `postcss`

Docusaurus Vite kullanmadığı için Tailwind, config içindeki `depark-tailwind` eklentisinin `configurePostCss` hook'una bağlanır. Ayrı bir `postcss.config` dosyası veya Tailwind 3 tarzı `tailwind.config.js` gerekmez.

CSS girişi `src/css/custom.css`:

```css
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme) prefix(tw);
@import 'tailwindcss/utilities.css' layer(utilities) prefix(tw) source(none);

@source '../../docs';
@source '../';

@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
```

Preflight import edilmez; Docusaurus'un Infima başlık, liste ve temel stilleri korunur. `tw` prefix'i, Infima'nın container/table gibi sınıflarıyla isim çakışmasını engeller. Kaynak taraması açıkça docs ve src ile sınırlandırılır.

Bu kurulum [Tailwind PostCSS rehberine](https://tailwindcss.com/docs/installation/using-postcss), [Preflight entegrasyon notlarına](https://tailwindcss.com/docs/preflight) ve [Docusaurus configurePostCss API'sine](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis#configurePostCss) dayanır.

## Utility örneği

Bir MDX veya React bileşeninde:

```tsx
<div className="tw:grid tw:gap-4 tw:md:grid-cols-2">
  <section className="tw:rounded-lg tw:p-4">
    <h2 className="tw:text-xl tw:font-semibold">İndeksleme</h2>
    <p>PDF sayfalarının nasıl arama kaydına dönüştüğünü inceleyin.</p>
  </section>
</div>
```

Tailwind 4'te prefix önce gelir: `tw:md:grid-cols-2` ve `tw:dark:bg-slate-900`. Dark varyantı Docusaurus'un `data-theme="dark"` seçimiyle eşleşir. Koşullu utility kullanırken tarayıcının görebileceği tam sınıf adlarını kaynakta tutun; dinamik parça birleştirmesiyle sınıf üretmeyin.

Utility'ler CSS layer içinde, Infima kuralları layer dışında olabilir. Eşleşen özelliklerde cascade önceliğini kontrol edin; yalnızca class adının varlığı her mevcut tema stilinin geçersiz kılınacağını garanti etmez.

## Doğrulama

```bash
npm run typecheck
npm run build
npm run serve
```

Üretim derlemesi iç route'ları, Markdown bağlantılarını ve MDX derlemesini doğrular. Tarayıcıda uzun tabloları, mobil sidebar'ı, kod bloklarını, Mermaid diyagramlarını ve açık/koyu tema okunurluğunu ayrıca kontrol edin.

Mevcut görünümü yeniden tasarlayacak UI çalışmaları için depo kökündeki AGENTS.md ve Google Stitch iş akışı geçerlidir. Bu dokümantasyon güncellemesi Docusaurus'un mevcut tema düzenini kullanır.
