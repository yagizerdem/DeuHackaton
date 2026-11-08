import { themes as prismThemes } from "prism-react-renderer";
import tailwindcss from "@tailwindcss/postcss";
import type { Config, Plugin } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const repositoryUrl = "https://github.com/yagizerdem/DeuHackaton";

const config: Config = {
  title: "Depark Hackaton",
  tagline: "Bitki koruma, RAG ve coğrafi analiz teknik dokümantasyonu",
  favicon: "img/favicon.ico",
  url: process.env.DOCS_URL ?? "http://localhost:3001",
  baseUrl: process.env.DOCS_BASE_URL ?? "/",
  organizationName: "yagizerdem",
  projectName: "DeuHackaton",
  deploymentBranch: "gh-pages",
  trailingSlash: false,

  future: {
    v4: true,
    // Keep HTML minification portable across Windows development environments.
    faster: { swcHtmlMinimizer: false },
  },
  onBrokenLinks: "throw",
  markdown: {
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: "throw" },
  },
  i18n: { defaultLocale: "tr", locales: ["tr"] },
  themes: ["@docusaurus/theme-mermaid"],
  plugins: [
    function tailwindPlugin(): Plugin {
      return {
        name: "depark-tailwind",
        configurePostCss(options) {
          options.plugins.push(tailwindcss());
          return options;
        },
      };
    },
  ],
  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: "Depark · Teknik dokümantasyon",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Dokümanlar",
        },
        { to: "/rag/overview", label: "RAG algoritması", position: "left" },
        { to: "/api/overview", label: "API", position: "left" },
        { href: repositoryUrl, label: "GitHub", position: "right" },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Başlangıç",
          items: [
            { label: "Yerel kurulum", to: "/getting-started/installation" },
            { label: "Sistem mimarisi", to: "/architecture/overview" },
          ],
        },
        {
          title: "Algoritmalar",
          items: [
            { label: "RAG akışı", to: "/rag/overview" },
            { label: "Coğrafi analiz", to: "/maps/overview" },
          ],
        },
        {
          title: "Geliştirme",
          items: [
            {
              label: "Dokümantasyona katkı",
              to: "/contributing/documentation",
            },
            { label: "Kaynak kod", href: repositoryUrl },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Depark Hackaton. Docusaurus ile hazırlanmıştır.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "bash",
        "json",
        "python",
        "typescript",
        "docker",
        "yaml",
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
