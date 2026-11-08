# Depark Hackaton dokümantasyonu

Docusaurus 3 tabanlı Türkçe teknik dokümantasyon. Proje mimarisi, görsel analiz, RAG indeksleme/retrieval/üretim, coğrafi algoritmalar, API ve işletim ayrı Markdown dosyalarındadır.

## Kurulum ve geliştirme

Bu dizin kök npm workspace listesinde değildir. Komutları burada çalıştırın:

```bash
npm ci --workspaces=false
npm start
```

Yerel adres: http://localhost:3001. Express'in 3000 portuyla çakışmaması için 3001 kullanılır.

## Kontrol ve önizleme

```bash
npm run typecheck
npm run build
npm run serve
```

Derleme çıktısı `build/` dizinidir. Kırık iç bağlantılar ve Markdown bağlantıları derlemeyi durdurur. Statik doküman derlemesi çalışan backend, Docker veya Gemini anahtarı istemez.

## İçerik haritası

- [Başlangıç](docs/intro.md)
- [Kurulum](docs/getting-started/installation.md)
- [Mimari](docs/architecture/overview.md)
- [RAG algoritması](docs/rag/overview.md)
- [Harita algoritmaları](docs/maps/overview.md)
- [API](docs/api/overview.md)
- [Dağıtım](docs/operations/deployment.md)
- [Dokümantasyona katkı ve Tailwind](docs/contributing/documentation.md)

Navigasyon `sidebars.ts` içinde tanımlıdır. Blog eklentisi kapalı, örnek blog ve tutorial içerikleri kaldırılmıştır. Dokümanlar doğrudan kök route'ta sunulur.

## Tailwind CSS

Tailwind 4, Docusaurus `configurePostCss` hook'uyla bağlanmıştır. Utility prefix'i `tw:` şeklindedir; örneğin `tw:grid tw:gap-4 tw:md:grid-cols-2`. Preflight yüklenmez ve Infima'nın temel doküman stilleri korunur. Kaynak taraması `docs/` ve `src/` yollarıyla sınırlandırılmıştır.

## Dağıtım adresi

Yayın ortamında `DOCS_URL` gerçek origin, `DOCS_BASE_URL` ise kök veya alt dizin yoludur. PowerShell örneği:

```powershell
$env:DOCS_URL = 'https://docs.example.org'
$env:DOCS_BASE_URL = '/'
npm run build
```

Derleme siteyi otomatik yayımlamaz. Üretilen `build/` klasörünü seçtiğiniz statik sunucuya dağıtın.
