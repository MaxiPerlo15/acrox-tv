export type ProjectCategory = "eventos" | "musicales" | "produccion" | "cortos";

export type ProjectItem = {
  id: string;
  category: ProjectCategory;
  title: string;
  kind: "image" | "youtube";
  thumbnailUrl: string;
  href: string;
  alt: string;
  subtitle?: string;
  year?: string;
};

export type ProjectCategoryMeta = {
  label: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

export type HomeProjectHighlight = {
  category: ProjectCategory;
  item: ProjectItem;
};

export const PROJECT_CATEGORY_ORDER: ProjectCategory[] = [
  "eventos",
  "musicales",
  "produccion",
  "cortos"
];

export const PROJECT_CATEGORY_META: Record<ProjectCategory, ProjectCategoryMeta> = {
  eventos: {
    label: "Cobertura de Eventos",
    description: "Registros fotográficos y audiovisuales para eventos sociales, culturales e institucionales.",
    emptyTitle: "Portfolio de eventos en preparación",
    emptyDescription: "Pronto vas a poder recorrer coberturas completas de eventos de la región."
  },
  musicales: {
    label: "Producciones Musicales",
    description: "Videoclips y piezas musicales producidas junto a artistas de la región.",
    emptyTitle: "Portfolio musical en preparación",
    emptyDescription: "Estamos curando videoclips y producciones musicales para sumar en esta sección."
  },
  produccion: {
    label: "Producción Audiovisual",
    description: "Piezas para marcas, instituciones y campañas con enfoque narrativo y comercial.",
    emptyTitle: "Portfolio de producción en preparación",
    emptyDescription: "Estamos organizando proyectos de producción audiovisual para sumar en esta categoría."
  },
  cortos: {
    label: "Cortos Cinematográficos",
    description: "Historias breves y proyectos autorales desarrollados con lenguaje cinematográfico.",
    emptyTitle: "Portfolio de cortos en preparación",
    emptyDescription: "Muy pronto vamos a publicar cortos y trabajos narrativos de esta línea creativa."
  }
};

export const PROJECT_ITEMS: Record<ProjectCategory, ProjectItem[]> = {
  eventos: [
    {
      id: "evento-m9DTXatGs60",
      category: "eventos",
      title: "Santiago Garione - 12 años con la música - Recital Completo",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/m9DTXatGs60/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=m9DTXatGs60",
      alt: "Miniatura de cobertura de evento en YouTube",
      subtitle: "Ver en YouTube",
      year: "2025"
    },
    {
      id: "evento-bgOSMDrlmpo",
      category: "eventos",
      title: "Miyazato Karate Do - 50 años Arce Dojo",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/bgOSMDrlmpo/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=bgOSMDrlmpo",
      alt: "Miniatura de cobertura de evento en YouTube",
      subtitle: "Ver en YouTube",
      year: "2024"
    },
    {
      id: "evento-4jc4fgRLKQk",
      category: "eventos",
      title: "Joyriders - Recital completo",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/4jc4fgRLKQk/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=4jc4fgRLKQk",
      alt: "Miniatura de cobertura de evento en YouTube",
      subtitle: "Ver en YouTube",
      year: "2023"
    },
    {
      id: "evento-BjtxUoGLU_s",
      category: "eventos",
      title: "Caballeros del Matambre - Despedida 2019",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/BjtxUoGLU_s/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=BjtxUoGLU_s",
      alt: "Miniatura de cobertura de evento en YouTube",
      subtitle: "Ver en YouTube",
      year: "2019"
    }
  ],
  musicales: [
    {
      id: "musical-qBH0zeAbSWs",
      category: "musicales",
      title: "Tigre herido (Lyrics) - Stefy Gonella",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/qBH0zeAbSWs/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=qBH0zeAbSWs",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2024"
    },
    {
      id: "musical-d1zc6lPb6xI",
      category: "musicales",
      title: "Nos Perdonaría - Rafael Perret ft Luz Belén",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/d1zc6lPb6xI/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=d1zc6lPb6xI",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2025"
    },
    {
      id: "musical-8FAmmUOfk6E",
      category: "musicales",
      title: "Toxiamor - Rafael Perret ft Leysa Peiretti",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/8FAmmUOfk6E/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=8FAmmUOfk6E",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2025"
    },
    {
      id: "musical-csUIiMmcfGA",
      category: "musicales",
      title: "Quiero saber cómo estás - Edgar Wingeyer, José Berardi, Julián Burgos",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/csUIiMmcfGA/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=csUIiMmcfGA",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2025"
    },
    {
      id: "musical-350txkUX0XM",
      category: "musicales",
      title: "Iba a decirte - KEYSI",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/350txkUX0XM/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=350txkUX0XM",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2025"
    },
    {
      id: "musical-OFs0oyN8TBA",
      category: "musicales",
      title: "Ojitos Rojos - Cristian Reynoso y La Banda del Efra",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/OFs0oyN8TBA/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=OFs0oyN8TBA",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2024"
    },
    {
      id: "musical-U6COjfn-Bq0",
      category: "musicales",
      title: "Los Guardamontes",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/U6COjfn-Bq0/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=U6COjfn-Bq0",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2023"
    },
    {
      id: "musical-LYTfaBUl4Lo",
      category: "musicales",
      title: "Ciudad de Papel - Stefy Gonella",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/LYTfaBUl4Lo/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=LYTfaBUl4Lo",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2023"
    },
    {
      id: "musical-JdMcrKUOXls",
      category: "musicales",
      title: "Amor Taimado - Jano",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/JdMcrKUOXls/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=JdMcrKUOXls",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2023"
    },
    {
      id: "musical-_hMt9NSJbyE",
      category: "musicales",
      title: "Enganchados de Leo Dan - Cristian Reynoso y La Banda del Efra",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/_hMt9NSJbyE/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=_hMt9NSJbyE",
      alt: "Miniatura de producción musical en YouTube",
      subtitle: "Ver en YouTube",
      year: "2023"
    }
  ],
  produccion: [
    {
      id: "produccion-G2BMAA6GS_0",
      category: "produccion",
      title: "Especial \"A través del tiempo\"",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/G2BMAA6GS_0/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=G2BMAA6GS_0",
      alt: "Miniatura de producción audiovisual en YouTube",
      subtitle: "Ver en YouTube",
      year: "2017"
    },
    {
      id: "produccion-PaoRuXXjjTM",
      category: "produccion",
      title: "Los Cedros - Presentación",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/PaoRuXXjjTM/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=PaoRuXXjjTM",
      alt: "Miniatura de producción audiovisual en YouTube",
      subtitle: "Ver en YouTube",
      year: "2019"
    },
    {
      id: "produccion-VhtnNTZQJx4",
      category: "produccion",
      title: "Homenaje a Luis y Carlos Zanello",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/VhtnNTZQJx4/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=VhtnNTZQJx4",
      alt: "Miniatura de producción audiovisual en YouTube",
      subtitle: "Ver en YouTube",
      year: "2021"
    },
    {
      id: "produccion-vSWmAqW1UZo",
      category: "produccion",
      title: "1918 - La reforma",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/vSWmAqW1UZo/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=vSWmAqW1UZo",
      alt: "Miniatura de producción audiovisual en YouTube",
      subtitle: "Ver en YouTube",
      year: "2018"
    },
    {
      id: "produccion-AwwcB7-oUHQ",
      category: "produccion",
      title: "Tu Compañía - Apertura 2016",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/AwwcB7-oUHQ/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=AwwcB7-oUHQ",
      alt: "Miniatura de producción audiovisual en YouTube",
      subtitle: "Ver en YouTube",
      year: "2016"
    },
    {
      id: "produccion-wUD6j1bjCZc",
      category: "produccion",
      title: "AUTOPSIA - El Matadero",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/wUD6j1bjCZc/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=wUD6j1bjCZc",
      alt: "Miniatura de producción audiovisual en YouTube",
      subtitle: "Ver en YouTube",
      year: "2019"
    },
    {
      id: "produccion-ELfm5WfSKfg",
      category: "produccion",
      title: "Entreteni2 - Apertura 2019",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/ELfm5WfSKfg/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=ELfm5WfSKfg",
      alt: "Miniatura de producción audiovisual en YouTube",
      subtitle: "Ver en YouTube",
      year: "2019"
    },
    {
      id: "produccion-3vyErMpQ-vw",
      category: "produccion",
      title: "LAS VARILLAS EN BLANCO",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/3vyErMpQ-vw/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=3vyErMpQ-vw",
      alt: "Miniatura de producción audiovisual en YouTube",
      subtitle: "Ver en YouTube",
      year: "2007"
    }
  ],
  cortos: [
    {
      id: "corto-2cMeQoVxvX0",
      category: "cortos",
      title: "Artabán, el 4ᵗᵒ Rey Mago",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/2cMeQoVxvX0/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=2cMeQoVxvX0",
      alt: "Miniatura del corto cinematográfico de Acrox en YouTube",
      subtitle: "Ver en YouTube",
      year: "2022"
    },
    {
      id: "corto-zt8ZRGZlTXM",
      category: "cortos",
      title: "Sabor a Silencio",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/zt8ZRGZlTXM/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=zt8ZRGZlTXM",
      alt: "Miniatura del corto cinematográfico en YouTube",
      subtitle: "Ver en YouTube",
      year: "2014"
    },
    {
      id: "corto-Ouw58WbOxVg",
      category: "cortos",
      title: "Cine Teatro Colón - 90 años de historias",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/Ouw58WbOxVg/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=Ouw58WbOxVg",
      alt: "Miniatura del corto cinematográfico en YouTube",
      subtitle: "Ver en YouTube",
      year: "2020"
    },
    {
      id: "corto-lHhzZQqCQdA",
      category: "cortos",
      title: "DANIELE DUGONI YO ESTUVE AHI",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/lHhzZQqCQdA/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=lHhzZQqCQdA",
      alt: "Miniatura del corto cinematográfico en YouTube",
      subtitle: "Ver en YouTube",
      year: "2016"
    },
    {
      id: "corto-WoJQSfjIcBE",
      category: "cortos",
      title: "Campo Neutral",
      kind: "youtube",
      thumbnailUrl: "https://i.ytimg.com/vi/WoJQSfjIcBE/hqdefault.jpg",
      href: "https://www.youtube.com/watch?v=WoJQSfjIcBE",
      alt: "Miniatura del corto cinematográfico en YouTube",
      subtitle: "Ver en YouTube",
      year: "2000"
    }
  ]
};

export const HOME_PROJECT_HIGHLIGHTS: HomeProjectHighlight[] = PROJECT_CATEGORY_ORDER
  .map((category) => {
    const item = PROJECT_ITEMS[category][0];
    return item ? { category, item } : null;
  })
  .filter((entry): entry is HomeProjectHighlight => Boolean(entry));
