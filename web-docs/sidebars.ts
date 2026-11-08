import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {type: 'category', label: 'Başlangıç', items: [
      'getting-started/installation', 'getting-started/configuration', 'getting-started/first-analysis',
    ]},
    {type: 'category', label: 'Proje mimarisi', items: [
      'architecture/overview', 'architecture/repository', 'architecture/backend',
      'architecture/frontend', 'architecture/data-model',
    ]},
    {type: 'category', label: 'Analiz ve iş algoritmaları', items: [
      'algorithms/image-analysis', 'algorithms/task-lifecycle',
    ]},
    {type: 'category', label: 'RAG algoritması', collapsed: false, items: [
      'rag/overview', 'rag/ingestion', 'rag/embeddings', 'rag/retrieval',
      'rag/generation', 'rag/operations', 'rag/evaluation',
    ]},
    {type: 'category', label: 'Harita ve coğrafi analiz', items: [
      'maps/overview', 'maps/invasive-species', 'maps/vegetation',
      'maps/fire-risk', 'maps/terrain-and-tour',
    ]},
    {type: 'category', label: 'API referansı', items: [
      'api/overview', 'api/authentication', 'api/analysis', 'api/farm', 'api/geospatial',
    ]},
    {type: 'category', label: 'İşletim', items: [
      'operations/deployment', 'operations/troubleshooting',
    ]},
    'contributing/documentation',
  ],
};

export default sidebars;
