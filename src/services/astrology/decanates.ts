// Astrological Decanates (Decanatos) Knowledge Base
// 36 Decanates (3 per sign, 10 degrees each) based on the traditional Triplicity & Planetary Sub-Rulership system.

export interface DecanateInfo {
  sign: string;
  decanNumber: 1 | 2 | 3;
  degreeRange: string;
  approxDates: string;
  title: string;
  ruler: string;
  subRuler: string;
  subSign: string;
  element: string;
  symbol: string;
  keywords: string[];
  description: string;
  personalityTraits: string[];
  relationalStyle: string;
  spiritualDrive: string;
  shadowTendency: string;
  lifeMotto: string;
}

export const DECANATES_DATABASE: Record<string, Record<1 | 2 | 3, DecanateInfo>> = {
  Aries: {
    1: {
      sign: 'Aries',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Aries',
      approxDates: '21 de Marzo - 30 de Marzo',
      title: 'El Pionero Audaz y Guerrero Puro',
      ruler: 'Marte',
      subRuler: 'Marte',
      subSign: 'Aries',
      element: 'Fuego Puro',
      symbol: '♈ ♂',
      keywords: ['Iniciador', 'Valiente', 'Impulsivo', 'Enérgico', 'Competitivo', 'Líder nato'],
      description: 'El primer decanato de Aries representa la fuerza primordial del fuego en su estado más puro y directo. Regido doblemente por Marte, este nativo posee una energía inagotable, determinación férrea y una necesidad imperiosa de comenzar proyectos y abrir brechas donde nadie más se atreve. No teme a los retos y actúa guiado por el instinto y la acción inmediata.',
      personalityTraits: [
        'Valentía y franqueza total sin filtros',
        'Capacidad innata para superar cualquier obstáculo con determinación directa',
        'Impulso competitivo y liderazgo natural en situaciones de emergencia',
        'Espíritu independiente que detesta la rutina y la subordinación'
      ],
      relationalStyle: 'Apasionado, directo y protector. Busca parejas que admiren su ímpetu y compartan aventuras con la misma intensidad.',
      spiritualDrive: 'Manifestar la voluntad creadora e individualidad pura en el mundo material.',
      shadowTendency: 'Impaciencia extrema, arranques de ira repentinos y tendencia a abandonar proyectos una vez pasada la emoción inicial.',
      lifeMotto: '«Yo soy, yo inicio y conquisto mis metas por la fuerza de mi voluntad.»'
    },
    2: {
      sign: 'Aries',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Aries',
      approxDates: '31 de Marzo - 9 de Abril',
      title: 'El Líder Magnánimo y Carismático',
      ruler: 'Marte',
      subRuler: 'Sol',
      subSign: 'Leo',
      element: 'Fuego Radiante',
      symbol: '♈ ♌ ☉',
      keywords: ['Carismático', 'Noble', 'Magnánimo', 'Orgulloso', 'Creativo', 'Inspirador'],
      description: 'La influencia solar de Leo confiere a este decanato de Aries una presencia regia, generosidad desbordante y una inclinación natural al dramatismo creador. Posee un sentido del honor muy elevado y una calidez que atrae a las personas. Su energía marciana está templada por la dignidad solar, convirtiéndolo en un líder inspirador y protector.',
      personalityTraits: [
        'Presencia imponente y magnetismo personal radiante',
        'Generosidad heroica y lealtad inquebrantable hacia sus seres queridos',
        'Gran creatividad y necesidad de reconocimiento por sus logros',
        'Sentido natural de la justicia y defensa de los desfavorecidos'
      ],
      relationalStyle: 'Cálido, leal, protector y entusiasta. Le gusta hacer sentir especial a su pareja y recibir admiración genuina.',
      spiritualDrive: 'Brillar con luz propia e irradiar entusiasmo, inspirando a otros a alcanzar su máximo potencial.',
      shadowTendency: 'Orgullo herido ante las críticas, tendencia a la arrogancia y necesidad excesiva de aplausos.',
      lifeMotto: '«Lidero con nobleza de corazón y enciendo la chispa de la grandeza en los demás.»'
    },
    3: {
      sign: 'Aries',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Aries',
      approxDates: '10 de Abril - 19 de Abril',
      title: 'El Pionero Visionario y Filósofo de Acción',
      ruler: 'Marte',
      subRuler: 'Júpiter',
      subSign: 'Sagitario',
      element: 'Fuego Expansivo',
      symbol: '♈ ♐ ♃',
      keywords: ['Visionario', 'Aventurero', 'Filosófico', 'Optimista', 'Buscador de Verdad', 'Generoso'],
      description: 'Bajo la sub-regencia de Júpiter y la influencia de Sagitario, este decanato une la audacia combativa de Aries con la visión expansiva y filosófica de la vida. Es un pionero de ideales elevados, un explorador incansable del conocimiento y las fronteras lejanas. Posee un optimismo contagioso, espíritu aventurero y una búsqueda perenne de sabiduría y libertad.',
      personalityTraits: [
        'Mente visionaria capaz de concebir grandes ideales y ejecutarlos con audacia',
        'Optimismo inquebrantable que transforma las crisis en oportunidades de crecimiento',
        'Sed insaciable de aprendizaje, viajes, filosofía y expansión de horizontes',
        'Franqueza sincera combinada con un sentido de generosidad universal'
      ],
      relationalStyle: 'Libre, honesto, entusiasta y profundamente estimulante. Busca compañeros de vida con quienes viajar, aprender y soñar en grande.',
      spiritualDrive: 'Expandir la conciencia humana y construir puentes hacia horizontes desconocidos de verdad y sabiduría.',
      shadowTendency: 'Exceso de confianza, asumir más compromisos de los posibles y dogmatismo en sus opiniones.',
      lifeMotto: '«No solo abro caminos: busco la verdad y el propósito más allá del horizonte.»'
    }
  },

  Taurus: {
    1: {
      sign: 'Taurus',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Tauro',
      approxDates: '20 de Abril - 29 de Abril',
      title: 'El Creador Sensual y Firme',
      ruler: 'Venus',
      subRuler: 'Venus',
      subSign: 'Tauro',
      element: 'Tierra Fértil',
      symbol: '♉ ♀',
      keywords: ['Sensual', 'Paciente', 'Leal', 'Estético', 'Perseverante', 'Práctico'],
      description: 'Regido puramente por Venus, este decanato encarna el amor por la belleza tangible, la armonía natural y el confort sensorial. Posee una paciencia infinita, un sentido artístico refinado y una habilidad natural para generar abundancia y seguridad.',
      personalityTraits: ['Lealtad inquebrantable', 'Aprecio profundo por el arte, la buena mesa y la naturaleza', 'Tenacidad indestructible'],
      relationalStyle: 'Devoto, afectuoso y buscando estabilidad emocional duradera.',
      spiritualDrive: 'Materializar la belleza divina y la paz en la tierra.',
      shadowTendency: 'Terquedad obstinada y apego material.',
      lifeMotto: '«Construyo con paciencia aquello que perdurará por siempre.»'
    },
    2: {
      sign: 'Taurus',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Tauro',
      approxDates: '30 de Abril - 9 de Mayo',
      title: 'El Arquitecto Práctico y Analítico',
      ruler: 'Venus',
      subRuler: 'Mercurio',
      subSign: 'Virgo',
      element: 'Tierra Productiva',
      symbol: '♉ ♍ ☿',
      keywords: ['Metódico', 'Analítico', 'Confiable', 'Eficiente', 'Constructor'],
      description: 'Con la sub-regencia de Mercurio (Virgo), este decanato combina la solidez taurina con una mente analítica, detallista y orientada a la productividad práctica y la excelencia en el trabajo.',
      personalityTraits: ['Capacidad organizativa superior', 'Ojo crítico para los detalles y la optimización', 'Sentido común impecable'],
      relationalStyle: 'Servicial, atento a los detalles cotidianos y sumamente protector.',
      spiritualDrive: 'Poner el orden y la destreza al servicio del bienestar colectivo.',
      shadowTendency: 'Exceso de preocupación y resistencia a los cambios imprevistos.',
      lifeMotto: '«La excelencia se forja en el cuidado de cada detalle.»'
    },
    3: {
      sign: 'Taurus',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Tauro',
      approxDates: '10 de Mayo - 20 de Mayo',
      title: 'El Guardián Estratega y Ambicioso',
      ruler: 'Venus',
      subRuler: 'Saturno',
      subSign: 'Capricornio',
      element: 'Tierra Sólida',
      symbol: '♉ ♑ ♄',
      keywords: ['Ambicioso', 'Disciplinado', 'Estratega', 'Resiliente', 'Constructor'],
      description: 'Bajo la influencia de Saturno (Capricornio), este decanato posee una madurez precoz, disciplina de hierro y una visión a largo plazo para edificar patrimonios y legados familiares duraderos.',
      personalityTraits: ['Perseverancia a prueba de cualquier crisis', 'Madurez y fiabilidad incondicional', 'Liderazgo sólido y paciente'],
      relationalStyle: 'Comprometido, protector de la familia y proveedor incondicional.',
      spiritualDrive: 'Erguir estructuras materiales y éticas que trasciendan generaciones.',
      shadowTendency: 'Rigidez y excesiva austeridad emocional.',
      lifeMotto: '«El tiempo es mi aliado; cada paso firme asegura la cumbre.»'
    }
  },

  Gemini: {
    1: {
      sign: 'Gemini',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Géminis',
      approxDates: '21 de Mayo - 31 de Mayo',
      title: 'La Mente Ágil y Comunicador Puro',
      ruler: 'Mercurio',
      subRuler: 'Mercurio',
      subSign: 'Géminis',
      element: 'Aire Puro',
      symbol: '♊ ☿',
      keywords: ['Elocuente', 'Curioso', 'Veloz', 'Ingenioso', 'Versátil', 'Multitasking'],
      description: 'Doble regencia de Mercurio. Mente relampagueante, curiosidad insaciable y don natural para la oratoria, la escritura y el intercambio constante de ideas. Aprende a la velocidad de la luz y conecta conceptos diversos con asombrosa facilidad.',
      personalityTraits: ['Agilidad mental y verbal brillante', 'Curiosidad insaciable por todo lo nuevo', 'Adaptabilidad camaleónica ante cualquier circunstancia'],
      relationalStyle: 'Estimulante, conversador y buscando siempre complicidad intelectual y buen humor.',
      spiritualDrive: 'Ser el canal de transmisión de ideas y conocimiento libre entre los seres humanos.',
      shadowTendency: 'Dispersión mental y superficialidad al saltar de un tema a otro.',
      lifeMotto: '«Conecto las ideas, cuestiono el mundo y aprendo sin cesar.»'
    },
    2: {
      sign: 'Gemini',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Géminis',
      approxDates: '1 de Junio - 10 de Junio',
      title: 'El Diplomático Encantador y Artista de la Palabra',
      ruler: 'Mercurio',
      subRuler: 'Venus',
      subSign: 'Libra',
      element: 'Aire Armónico',
      symbol: '♊ ♎ ♀',
      keywords: ['Sociable', 'Diplomático', 'Elegante', 'Seductor', 'Artístico', 'Empático'],
      description: 'La sub-regencia de Venus (Libra) aporta encanto, gracia social y refinamiento estético a la mente de Géminis. Es un mediador nato que sabe suavizar tensiones y comunicar con delicadeza y elegancia persuasiva.',
      personalityTraits: ['Carisma social magnético y trato exquisito', 'Talento para la diplomacia y resolución de conflictos', 'Gusto estético refinado'],
      relationalStyle: 'Romántico, comunicativo y buscando equilibrio y armonía permanente en pareja.',
      spiritualDrive: 'Crear puentes de diálogo y entendimiento armónico entre perspectivas opuestas.',
      shadowTendency: 'Indecisión y tendencia a evitar confrontaciones necesarias.',
      lifeMotto: '«La belleza y la armonía nacen del diálogo comprensivo.»'
    },
    3: {
      sign: 'Gemini',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Géminis',
      approxDates: '11 de Junio - 20 de Junio',
      title: 'El Visionario Innovador e Intelectual Humanitario',
      ruler: 'Mercurio',
      subRuler: 'Urano',
      subSign: 'Acuario',
      element: 'Aire Eléctrico',
      symbol: '♊ ♒ ♅',
      keywords: ['Vanguardista', 'Original', 'Humanitario', 'Ingenioso', 'Libre pensador'],
      description: 'Con Urano/Saturno (Acuario) como sub-regentes, este decanato piensa décadas adelante de su tiempo. Mente disruptiva, interés en la ciencia, la tecnología y causas progresistas de impacto humano.',
      personalityTraits: ['Pensamiento no convencional y original', 'Compromiso con ideales colectivos y justicia social', 'Mente analítica e inventiva'],
      relationalStyle: 'Amigable, respetuoso de la libertad mutua y buscando conexión mental profunda.',
      spiritualDrive: 'Despertar conciencias y modernizar las ideas caducas de la sociedad.',
      shadowTendency: 'Desapego emocional frío y excentricidad rebelde.',
      lifeMotto: '«El futuro se inventa hoy con ideas libres y revolucionarias.»'
    }
  },

  Cancer: {
    1: {
      sign: 'Cancer',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Cáncer',
      approxDates: '21 de Junio - 1 de Julio',
      title: 'El Guardián Maternal y Empático Puro',
      ruler: 'Luna',
      subRuler: 'Luna',
      subSign: 'Cáncer',
      element: 'Agua Pura',
      symbol: '♋ ☽',
      keywords: ['Protector', 'Intuitivo', 'Nutricio', 'Empático', 'Hogareño', 'Leal'],
      description: 'Doble regencia de la Luna. Sensibilidad a flor de piel, intuición casi psíquica y un instinto protector incondicional para con su núcleo familiar. Guarda la memoria emocional y crea hogares llenos de calidez.',
      personalityTraits: ['Sensibilidad empática profunda', 'Gran devoción hacia la familia y ancestros', 'Memoria emotiva prodigiosa'],
      relationalStyle: 'Profundamente leal, afectuoso y buscando seguridad emocional para toda la vida.',
      spiritualDrive: 'Sanar y nutrir los lazos del corazón humano.',
      shadowTendency: 'Hipersensibilidad, nostalgia del pasado y fluctuaciones anímicas.',
      lifeMotto: '«Protejo y nutro con el amor más puro aquello que me es encomendado.»'
    },
    2: {
      sign: 'Cancer',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Cáncer',
      approxDates: '2 de Julio - 12 de Julio',
      title: 'El Guardián Magnético y Resiliente',
      ruler: 'Luna',
      subRuler: 'Plutón',
      subSign: 'Escorpio',
      element: 'Agua Profunda',
      symbol: '♋ ♏ ♇',
      keywords: ['Intenso', 'Transformador', 'Magnético', 'Férreo', 'Defensor', 'Leal a morir'],
      description: 'Sub-regencia de Plutón/Marte (Escorpio). Esta combinación le otorga una fuerza interior asombrosa, lealtad incondicional y una mirada penetrante capaz de descifrar las intenciones ocultas de los demás.',
      personalityTraits: ['Voluntad inquebrantable en la adversidad', 'Instinto protector combativo ante amenazas a su clan', 'Profundidad psicológica'],
      relationalStyle: 'Apasionado, incondicional y de una lealtad absoluta e inquebrantable.',
      spiritualDrive: 'Transformar las heridas emocionales en sabiduría y poder regenerativo.',
      shadowTendency: 'Rencor persistente y desconfianza defensiva.',
      lifeMotto: '«Mi fuerza interior es un refugio inexpugnable para los que amo.»'
    },
    3: {
      sign: 'Cancer',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Cáncer',
      approxDates: '13 de Julio - 22 de Julio',
      title: 'El Sanador Místico y Compasivo',
      ruler: 'Luna',
      subRuler: 'Neptuno',
      subSign: 'Piscis',
      element: 'Agua Espiritual',
      symbol: '♋ ♓ ♆',
      keywords: ['Místico', 'Compasivo', 'Soñador', 'Artístico', 'Generoso', 'Sanador'],
      description: 'Sub-regencia de Neptuno/Júpiter (Piscis). Una de las combinaciones más intuitivas, artísticas y caritativas del zodiaco. Conexión natural con el plano espiritual, la música y el servicio desinteresado.',
      personalityTraits: ['Empatía universal y compasión sin límites', 'Imaginación poética y dones artísticos', 'Capacidad de consuelo y sanación'],
      relationalStyle: 'Romántico idílico, devoto y entregado al bienestar de su compañero.',
      spiritualDrive: 'Unir a las almas a través del amor compasivo y la belleza.',
      shadowTendency: 'Tendencia al sacrificio excesivo o evasión de la realidad cruda.',
      lifeMotto: '«El amor incondicional es la medicina que sana todas las heridas.»'
    }
  },

  Leo: {
    1: {
      sign: 'Leo',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Leo',
      approxDates: '23 de Julio - 1 de Agosto',
      title: 'El Soberano Radiante y Magnánimo Puro',
      ruler: 'Sol',
      subRuler: 'Sol',
      subSign: 'Leo',
      element: 'Fuego Central',
      symbol: '♌ ☉',
      keywords: ['Radiante', 'Noble', 'Majestuoso', 'Generoso', 'Líder nato', 'Creativo'],
      description: 'Doble regencia solar. Fuerza vital resplandeciente, generosidad real y un corazón noble. Nació para iluminar su entorno, inspirar lealtad y liderar proyectos de gran envergadura.',
      personalityTraits: ['Presencia carismática natural', 'Sentido del honor y generosidad regia', 'Gran confianza en sus capacidades creadoras'],
      relationalStyle: 'Apasionado, protector y sumamente generoso en atenciones y regalos.',
      spiritualDrive: 'Manifestar la luz divina y el gozo de existir en cada acto.',
      shadowTendency: 'Orgullo exagerado y vulnerabilidad al rechazo del público.',
      lifeMotto: '«Brillo con nobleza y derramo calidez sobre todo mi reino.»'
    },
    2: {
      sign: 'Leo',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Leo',
      approxDates: '2 de Agosto - 12 de Agosto',
      title: 'El Conquistador Entusiasta y Expansivo',
      ruler: 'Sol',
      subRuler: 'Júpiter',
      subSign: 'Sagitario',
      element: 'Fuego Expansivo',
      symbol: '♌ ♐ ♃',
      keywords: ['Aventurero', 'Optimista', 'Generoso', 'Filósofo', 'Visionario', 'Alegre'],
      description: 'Sub-regencia de Júpiter (Sagitario). Fusión de brillo solar con sed de aventura y sabiduría. Espíritu jovial, amante de los viajes, las empresas monumentales y el humor contagioso.',
      personalityTraits: ['Optimismo contagioso y entusiasmo imparable', 'Mente amplia con visión internacional o filosófica', 'Generosidad desmedida'],
      relationalStyle: 'Divertido, estimulante, leal y buscando siempre nuevas aventuras juntos.',
      spiritualDrive: 'Expandir la alegría y la fe en el porvenir a gran escala.',
      shadowTendency: 'Exageración, exceso de gastos y promesas sobredimensionadas.',
      lifeMotto: '«La vida es una gran fiesta de aventura y generosidad sin límites.»'
    },
    3: {
      sign: 'Leo',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Leo',
      approxDates: '13 de Agosto - 22 de Agosto',
      title: 'El Conquistador Audaz y Guerrero',
      ruler: 'Sol',
      subRuler: 'Marte',
      subSign: 'Aries',
      element: 'Fuego Comburente',
      symbol: '♌ ♈ ♂',
      keywords: ['Audaz', 'Determinado', 'Competitivo', 'Valiente', 'Enérgico', 'Pionero'],
      description: 'Sub-regencia de Marte (Aries). Una combinación de fuego imparable. Posee la determinación del guerrero y el porte del rey, capaz de vencer cualquier desafío mediante la acción decidida.',
      personalityTraits: ['Fuerza de voluntad implacable', 'Coraje directo ante cualquier rival o adversidad', 'Iniciativa y dinamismo total'],
      relationalStyle: 'Intenso, apasionado, demandante y extremadamente protector.',
      spiritualDrive: 'Abrir senderos victoriosos mediante la acción heroica.',
      shadowTendency: 'Impaciencia y choques de ego por dominio.',
      lifeMotto: '«Con coraje indomable conquisto mi destino y protejo a mi gente.»'
    }
  },

  Virgo: {
    1: {
      sign: 'Virgo',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Virgo',
      approxDates: '23 de Agosto - 1 de Septiembre',
      title: 'El Analista Meticuloso y Sanador Puro',
      ruler: 'Mercurio',
      subRuler: 'Mercurio',
      subSign: 'Virgo',
      element: 'Tierra Cristalina',
      symbol: '♍ ☿',
      keywords: ['Meticuloso', 'Analítico', 'Servicial', 'Eficiente', 'Perfeccionista', 'Observador'],
      description: 'Doble regencia de Mercurio. Inteligencia crítica refinada, capacidad analítica prodigiosa y un vocación natural por el servicio útil, la salud y la perfección funcional de los sistemas.',
      personalityTraits: ['Precisión y exactitud en todo lo que emprende', 'Capacidad diagnóstica brillante', 'Humildad y dedicación desinteresada'],
      relationalStyle: 'Atento, servicial, leal y demostrando su afecto a través de actos prácticos.',
      spiritualDrive: 'Purificar y ordenar el plano material para que la vida prospere armónicamente.',
      shadowTendency: 'Hipercrítica hacia uno mismo y hacia los demás.',
      lifeMotto: '«El orden y la dedicación transforman el caos en armonía útil.»'
    },
    2: {
      sign: 'Virgo',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Virgo',
      approxDates: '2 de Septiembre - 11 de Septiembre',
      title: 'El Estratega Tenaz y Constructor Productivo',
      ruler: 'Mercurio',
      subRuler: 'Saturno',
      subSign: 'Capricornio',
      element: 'Tierra Firme',
      symbol: '♍ ♑ ♄',
      keywords: ['Disciplinado', 'Estratega', 'Perseverante', 'Productivo', 'Confiable', 'Serio'],
      description: 'Sub-regencia de Saturno (Capricornio). Concentración de hierro, ambición profesional sobria y gran capacidad de liderazgo estructurado. Asume responsabilidades complejas con maestría.',
      personalityTraits: ['Responsabilidad y ética laboral inquebrantables', 'Visión pragmática orientada a resultados tangibles', 'Madurez y autosuficiencia'],
      relationalStyle: 'Serio, leal, protector y constructor de bases sólidas para el futuro familiar.',
      spiritualDrive: 'Edificar obras útiles y perdurables que sirvan a la comunidad.',
      shadowTendency: 'Pesimismo o exigencia excesiva que frena el disfrute del presente.',
      lifeMotto: '«Con disciplina y constancia ningún objetivo queda fuera de mi alcance.»'
    },
    3: {
      sign: 'Virgo',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Virgo',
      approxDates: '12 de Septiembre - 22 de Septiembre',
      title: 'El Esteta Práctico y Amante de la Naturaleza',
      ruler: 'Mercurio',
      subRuler: 'Venus',
      subSign: 'Tauro',
      element: 'Tierra Fértil',
      symbol: '♍ ♉ ♀',
      keywords: ['Práctico', 'Estético', 'Cálido', 'Paciente', 'Artesano', 'Gourmet'],
      description: 'Sub-regencia de Venus (Tauro). Suaviza la exigencia de Virgo con el amor por la belleza, el confort natural, el arte y el bienestar del cuerpo. Es el artesano paciente y gourmet de la tierra.',
      personalityTraits: ['Buen gusto estético y habilidad manual', 'Calidez humana combinada con sentido práctico', 'Aprecio por la tranquilidad y la buena vida'],
      relationalStyle: 'Afectuoso, estable, paciente y muy detallista en la convivencia.',
      spiritualDrive: 'Armonizar la funcionalidad técnica con la belleza natural de la creación.',
      shadowTendency: 'Apego a rutinas fijas y resistencia a soltar el control.',
      lifeMotto: '«La perfección más hermosa es la que se disfruta en paz y armonía.»'
    }
  },

  Libra: {
    1: {
      sign: 'Libra',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Libra',
      approxDates: '23 de Septiembre - 2 de Octubre',
      title: 'El Pacificador Elegante y Amante de la Armonía',
      ruler: 'Venus',
      subRuler: 'Venus',
      subSign: 'Libra',
      element: 'Aire Estético',
      symbol: '♎ ♀',
      keywords: ['Diplomático', 'Elegante', 'Armónico', 'Justo', 'Encantador', 'Sociable'],
      description: 'Doble regencia de Venus. Encarna el ideal de la belleza, la justicia equilibrada, la cortesía y la búsqueda incesante de acuerdos pacíficos. Posee un sentido estético innato y un carisma seductor.',
      personalityTraits: ['Elegancia y gracia social insuperable', 'Búsqueda constante de equilibrio y justicia', 'Capacidad innata para hacer sentir bien a los demás'],
      relationalStyle: 'Romántico, compañero devoto, buscando siempre el diálogo y la reciprocidad.',
      spiritualDrive: 'Sembrar paz, belleza y concordia en todas las relaciones humanas.',
      shadowTendency: 'Dependencia de la aprobación ajena y dificultad para tomar decisiones firmes.',
      lifeMotto: '«Donde hay conflicto, traigo belleza, armonía y comprensión mutua.»'
    },
    2: {
      sign: 'Libra',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Libra',
      approxDates: '3 de Octubre - 12 de Octubre',
      title: 'El Justiciero Idealista y Reformador Humanitario',
      ruler: 'Venus',
      subRuler: 'Urano',
      subSign: 'Acuario',
      element: 'Aire Visionario',
      symbol: '♎ ♒ ♅',
      keywords: ['Justiciero', 'Idealista', 'Intelectual', 'Humanitario', 'Libre pensador', 'Brillante'],
      description: 'Sub-regencia de Urano/Saturno (Acuario). Combina el amor por la justicia de Libra con el pensamiento visionario e independiente de Acuario. Es un defensor apasionado de los derechos humanos, la equidad social y las ideas progresistas.',
      personalityTraits: ['Mente analítica e innovadora', 'Defensa inquebrantable de la igualdad y la justicia social', 'Espíritu de amistad leal y mente abierta'],
      relationalStyle: 'Compañero libre, intelectual, leal y comprometido con causas compartidas.',
      spiritualDrive: 'Construir una sociedad más justa, libre y fraterna para todos.',
      shadowTendency: 'Distancia emocional cuando las cosas se tornan demasiado irracionales.',
      lifeMotto: '«La verdadera justicia respeta la libertad y la dignidad de cada ser.»'
    },
    3: {
      sign: 'Libra',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Libra',
      approxDates: '13 de Octubre - 22 de Octubre',
      title: 'El Orador Persuasivo y Comunicador Brillante',
      ruler: 'Venus',
      subRuler: 'Mercurio',
      subSign: 'Géminis',
      element: 'Aire Vivaz',
      symbol: '♎ ♊ ☿',
      keywords: ['Elocuente', 'Curioso', 'Persuasivo', 'Vivaz', 'Versátil', 'Negociador'],
      description: 'Sub-regencia de Mercurio (Géminis). Mente sumamente rápida, ingeniosa y don extraordinario para la escritura, la negociación y el debate diplomático. Conecta personas y abre puertas con su palabra.',
      personalityTraits: ['Elocuencia persuasiva y rapidez mental', 'Habilidad brillante para la negociación y las relaciones públicas', 'Curiosidad cultural amplia'],
      relationalStyle: 'Divertido, chispeante, comunicativo y siempre abierto a nuevas ideas.',
      spiritualDrive: 'Conectar corazones y mentes a través de la verdad y la palabra amable.',
      shadowTendency: 'Inquietud mental y dispersión entre demasiados intereses sociales.',
      lifeMotto: '«La palabra sabia y justa tiene el poder de abrir cualquier puerta.»'
    }
  },

  Scorpio: {
    1: {
      sign: 'Scorpio',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Escorpio',
      approxDates: '23 de Octubre - 1 de Noviembre',
      title: 'El Alquimista Intenso y Resiliente Puro',
      ruler: 'Plutón',
      subRuler: 'Plutón',
      subSign: 'Escorpio',
      element: 'Agua Profunda',
      symbol: '♏ ♇ ♂',
      keywords: ['Magnético', 'Intenso', 'Perceptivo', 'Resiliente', 'Transformador', 'Leal'],
      description: 'Doble regencia de Plutón/Marte. Poder magnético irresistible, capacidad de regeneración psicológica asombrosa y percepción aguda de las verdades que otros ocultan.',
      personalityTraits: ['Fuerza de voluntad inquebrantable', 'Intuición psicológica de rayos X', 'Lealtad absoluta e incondicional'],
      relationalStyle: 'Apasionado, profundo, todo o nada; busca fusión de almas.',
      spiritualDrive: 'Transformar la sombra en luz mediante el renacimiento interior.',
      shadowTendency: 'Control, celos y dificultad para perdonar traiciones.',
      lifeMotto: '«Renazco de mis cenizas más fuerte, más sabio y más invencible.»'
    },
    2: {
      sign: 'Scorpio',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Escorpio',
      approxDates: '2 de Noviembre - 11 de Noviembre',
      title: 'El Místico Sanador y Vidente',
      ruler: 'Plutón',
      subRuler: 'Neptuno',
      subSign: 'Piscis',
      element: 'Agua Mística',
      symbol: '♏ ♓ ♆',
      keywords: ['Místico', 'Intuitivo', 'Sanador', 'Empático', 'Poético', 'Espiritual'],
      description: 'Sub-regencia de Neptuno/Júpiter (Piscis). Une la intensidad de Escorpio con la compasión y los dones espirituales de Piscis. Gran poder para la sanación emocional y la creación artística profunda.',
      personalityTraits: ['Intuición mística y empatía profunda', 'Talento artístico y conexión con el inconsciente', 'Devoción compasiva'],
      relationalStyle: 'Entregado, romántico, protector y buscando una unión espiritual sagrada.',
      spiritualDrive: 'Disolver el dolor humano a través del amor y la sanación espiritual.',
      shadowTendency: 'Absorber energías ajenas y caer en melancolía.',
      lifeMotto: '«En lo más profundo de las aguas encuentro la luz que todo lo sana.»'
    },
    3: {
      sign: 'Scorpio',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Escorpio',
      approxDates: '12 de Noviembre - 21 de Noviembre',
      title: 'El Protector Férreo y Guardián del Clan',
      ruler: 'Plutón',
      subRuler: 'Luna',
      subSign: 'Cáncer',
      element: 'Agua Protectora',
      symbol: '♏ ♋ ☽',
      keywords: ['Protector', 'Leal', 'Férreo', 'Emocional', 'Defensor', 'Intuitivo'],
      description: 'Sub-regencia de la Luna (Cáncer). Instinto de preservación familiar feroz, lealtad de hierro a los suyos y capacidad inmensa para albergar y nutrir a quienes ama.',
      personalityTraits: ['Defensa incondicional de su familia y seres queridos', 'Sensibilidad emocional contenida pero inmensa', 'Memoria indeleble'],
      relationalStyle: 'Protector, protector, fiel hasta el fin y creando un santuario seguro.',
      spiritualDrive: 'Guardar la llama sagrada de la vida y proteger los afectos más puros.',
      shadowTendency: 'Apego posesivo y corazas defensivas difíciles de derribar.',
      lifeMotto: '«Por mi familia y mis seres amados cruzo cualquier tempestad.»'
    }
  },

  Sagittarius: {
    1: {
      sign: 'Sagittarius',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Sagitario',
      approxDates: '22 de Noviembre - 1 de Diciembre',
      title: 'El Explorador Filosófico y Visionario Puro',
      ruler: 'Júpiter',
      subRuler: 'Júpiter',
      subSign: 'Sagitario',
      element: 'Fuego Expansivo',
      symbol: '♐ ♃',
      keywords: ['Optimista', 'Explorador', 'Filósofo', 'Franco', 'Generoso', 'Libre'],
      description: 'Doble regencia de Júpiter. Optimismo radiante, amor incondicional por la libertad, sed de conocimientos universales y una fe inquebrantable en el destino.',
      personalityTraits: ['Alegría contagiosa y generosidad de espíritu', 'Amor por los viajes, idiomas y filosofías del mundo', 'Honestidad directa y sincera'],
      relationalStyle: 'Aventurero, sincero, alegre y buscando compañeros de viaje con mente abierta.',
      spiritualDrive: 'Buscar el sentido trascendente de la existencia y compartir la verdad.',
      shadowTendency: 'Exceso de confianza y falta de tacto en ocasiones.',
      lifeMotto: '«Mi horizonte no tiene fin; cada día es una oportunidad para aprender.»'
    },
    2: {
      sign: 'Sagittarius',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Sagitario',
      approxDates: '2 de Diciembre - 11 de Diciembre',
      title: 'El Guerrero Pionero y Conquistador Dinámico',
      ruler: 'Júpiter',
      subRuler: 'Marte',
      subSign: 'Aries',
      element: 'Fuego Dinámico',
      symbol: '♐ ♈ ♂',
      keywords: ['Dinámico', 'Competitivo', 'Valiente', 'Directo', 'Líder', 'Apasionado'],
      description: 'Sub-regencia de Marte (Aries). Fusión explosiva de visión jupiteriana y acción marciana. Es un deportista nato, líder emprendedor y guerrero de causas nobles que no vacila al actuar.',
      personalityTraits: ['Energía física y entusiasmo imparables', 'Coraje para defender la verdad y desafiar lo convencional', 'Iniciativa veloz'],
      relationalStyle: 'Directo, apasionado, divertido y leal a toda prueba.',
      spiritualDrive: 'Conquistar metas heroicas y motivar a otros a la acción valiente.',
      shadowTendency: 'Impulsividad combativa y terquedad ante la oposición.',
      lifeMotto: '«Disparo mi flecha a las estrellas y corro tras ella con paso firme.»'
    },
    3: {
      sign: 'Sagittarius',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Sagitario',
      approxDates: '12 de Diciembre - 21 de Diciembre',
      title: 'El Maestro Inspirador y Líder Noble',
      ruler: 'Júpiter',
      subRuler: 'Sol',
      subSign: 'Leo',
      element: 'Fuego Real',
      symbol: '♐ ♌ ☉',
      keywords: ['Carismático', 'Inspirador', 'Noble', 'Magnánimo', 'Maestro', 'Creador'],
      description: 'Sub-regencia del Sol (Leo). Presencia carismática, gran sentido del honor y capacidad innata para educar, liderar e inspirar a multitudes con su visión grandiosa.',
      personalityTraits: ['Magnetismo regio y oratoria elocuente', 'Generosidad de corazón y orgullo por sus principios', 'Creatividad visionaria'],
      relationalStyle: 'Noble, protector, cálido y sumamente leal en sus compromisos.',
      spiritualDrive: 'Ser un faro de inspiración, dignidad y sabiduría para el mundo.',
      shadowTendency: 'Orgullo dogmático y necesidad de ser el centro de atención.',
      lifeMotto: '«Inspiro con nobleza y enseño que la grandeza reside en el corazón.»'
    }
  },

  Capricorn: {
    1: {
      sign: 'Capricorn',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Capricornio',
      approxDates: '22 de Diciembre - 31 de Diciembre',
      title: 'El Constructor Tenaz y Soberano de la Cumbre',
      ruler: 'Saturno',
      subRuler: 'Saturno',
      subSign: 'Capricornio',
      element: 'Tierra Inquebrantable',
      symbol: '♑ ♄',
      keywords: ['Perseverante', 'Disciplinado', 'Responsable', 'Constructor', 'Resiliente', 'Líder sobrio'],
      description: 'Doble regencia de Saturno. Fortaleza de roca, autocontrol absoluto y una ambición paciente y madura. Nada detiene a este escalador implacable que llega a la cima por mérito propio.',
      personalityTraits: ['Disciplina inquebrantable', 'Sentido del deber y honor intachable', 'Capacidad de resistencia ante cualquier crisis'],
      relationalStyle: 'Leal de por vida, protector, prudente y proveedor incondicional.',
      spiritualDrive: 'Demostrar que con paciencia, esfuerzo y ética se conquista cualquier cumbre.',
      shadowTendency: 'Rigidez, melancolía y dificultad para mostrar vulnerabilidad.',
      lifeMotto: '«Paso a paso, con esfuerzo y verdad, conquisto la cumbre más alta.»'
    },
    2: {
      sign: 'Capricorn',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Capricornio',
      approxDates: '1 de Enero - 10 de Enero',
      title: 'El Estratega Próspero y Paciente',
      ruler: 'Saturno',
      subRuler: 'Venus',
      subSign: 'Tauro',
      element: 'Tierra Fructífera',
      symbol: '♑ ♉ ♀',
      keywords: ['Próspero', 'Estratega', 'Sensual', 'Paciente', 'Confiable', 'Fiel'],
      description: 'Sub-regencia de Venus (Tauro). Suaviza la sobriedad saturnina con un ojo certero para las finanzas, los bienes raíces, el arte y el bienestar del hogar. Generador de riqueza estable.',
      personalityTraits: ['Prudencia financiera y visión comercial impecable', 'Aprecio por la calidad y el confort familiar', 'Lealtad sólida'],
      relationalStyle: 'Afectuoso, generoso en seguridad, estable y muy fiel.',
      spiritualDrive: 'Manifestar la prosperidad sólida y duradera para el clan familiar.',
      shadowTendency: 'Materialismo excesivo y resistencia a salir de la zona de confort.',
      lifeMotto: '«La verdadera prosperidad se construye sobre cimientos inamovibles.»'
    },
    3: {
      sign: 'Capricorn',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Capricornio',
      approxDates: '11 de Enero - 19 de Enero',
      title: 'El Maestro Estratega y Organizador Magistral',
      ruler: 'Saturno',
      subRuler: 'Mercurio',
      subSign: 'Virgo',
      element: 'Tierra Intelectual',
      symbol: '♑ ♍ ☿',
      keywords: ['Analítico', 'Organizador', 'Estratega', 'Pragmático', 'Eficiente', 'Lúcido'],
      description: 'Sub-regencia de Mercurio (Virgo). Agudeza mental extraordinaria combinada con disciplina ejecutiva. Gran capacidad para la administración, la ciencia, las leyes y la resolución de problemas complejos.',
      personalityTraits: ['Pensamiento lógico impecable y metódico', 'Habilidad magistral para coordinar recursos y proyectos', 'Honestidad profesional'],
      relationalStyle: 'Atento, leal, comunicativo y resolviendo con hechos cualquier dificultad.',
      spiritualDrive: 'Poner la inteligencia y el orden al servicio de la construcción social.',
      shadowTendency: 'Exceso de trabajo y exigencia mental agotadora.',
      lifeMotto: '«La precisión mental y la disciplina forjan los mayores logros.»'
    }
  },

  Aquarius: {
    1: {
      sign: 'Aquarius',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Acuario',
      approxDates: '20 de Enero - 29 de Enero',
      title: 'El Visionario Rebelde e Innovador Puro',
      ruler: 'Urano',
      subRuler: 'Urano',
      subSign: 'Acuario',
      element: 'Aire Eléctrico',
      symbol: '♒ ♅ ♄',
      keywords: ['Innovador', 'Original', 'Libre', 'Humanitario', 'Genial', 'Independiente'],
      description: 'Doble regencia de Urano/Saturno. Mente futurista, independencia radical y devoción por causas que rompen con los moldes establecidos. Es el inventor y visionario de la nueva era.',
      personalityTraits: ['Originalidad incorruptible', 'Mente científica y abierta a lo insólito', 'Defensa de la libertad individual y colectiva'],
      relationalStyle: 'Amigable, respetuoso de los espacios propios, sin ataduras sofocantes.',
      spiritualDrive: 'Impulsar el salto evolutivo de la conciencia colectiva.',
      shadowTendency: 'Distancia emocional y rebeldía sin causa.',
      lifeMotto: '«Rompo las cadenas del pasado para construir el mundo del mañana.»'
    },
    2: {
      sign: 'Aquarius',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Acuario',
      approxDates: '30 de Enero - 8 de Febrero',
      title: 'El Divulgador Brillante y Mensajero de Futuro',
      ruler: 'Urano',
      subRuler: 'Mercurio',
      subSign: 'Géminis',
      element: 'Aire Dinámico',
      symbol: '♒ ♊ ☿',
      keywords: ['Elocuente', 'Intelectual', 'Divulgador', 'Vivaz', 'Conector', 'Ingenioso'],
      description: 'Sub-regencia de Mercurio (Géminis). Gran velocidad de pensamiento, facilidad para la tecnología, las redes y la comunicación de vanguardia. Es el gran conector de comunidades.',
      personalityTraits: ['Oratoria brillante y sentido del humor ingenioso', 'Facilidad para asimilar tecnología y conceptos abstractos', 'Sociabilidad amplia'],
      relationalStyle: 'Estimulante, conversador, divertido y buscando complicidad mental total.',
      spiritualDrive: 'Difundir el conocimiento libre e interconectar a la humanidad.',
      shadowTendency: 'Sobrecarga nerviosa y dispersión en mil proyectos a la vez.',
      lifeMotto: '«Comparto ideas que despiertan mentes y transforman realidades.»'
    },
    3: {
      sign: 'Aquarius',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Acuario',
      approxDates: '9 de Febrero - 18 de Febrero',
      title: 'El Humanitario Universal y Pacificador Social',
      ruler: 'Urano',
      subRuler: 'Venus',
      subSign: 'Libra',
      element: 'Aire Armónico',
      symbol: '♒ ♎ ♀',
      keywords: ['Humanitario', 'Empático', 'Idealista', 'Diplomático', 'Artístico', 'Fraterno'],
      description: 'Sub-regencia de Venus (Libra). Une la visión social de Acuario con el sentido estético y pacificador de Libra. Gran vocación por la filantropía, el arte conceptual y la armonía comunitaria.',
      personalityTraits: ['Encanto personal combinado con ideales elevados', 'Habilidad para conciliar grupos y movimientos sociales', 'Sensibilidad artística'],
      relationalStyle: 'Cálido, respetuoso, leal y buscando un amor basado en la amistad y valores mutuos.',
      spiritualDrive: 'Establecer la fraternidad universal a través del arte y la justicia.',
      shadowTendency: 'Utopismo irreal y dificultad para lidiar con la mezquindad.',
      lifeMotto: '«La verdadera belleza florece cuando todos los seres viven en hermandad.»'
    }
  },

  Pisces: {
    1: {
      sign: 'Pisces',
      decanNumber: 1,
      degreeRange: '0°00\' - 9°59\' Piscis',
      approxDates: '19 de Febrero - 28/29 de Febrero',
      title: 'El Místico Vidente y Empático Universal',
      ruler: 'Neptuno',
      subRuler: 'Neptuno',
      subSign: 'Piscis',
      element: 'Agua Oceánica',
      symbol: '♓ ♆ ♃',
      keywords: ['Intuitivo', 'Compasivo', 'Místico', 'Sensible', 'Poético', 'Soñador'],
      description: 'Doble regencia de Neptuno/Júpiter. Intuición oceánica, conexión directa con el mundo de los sueños y una capacidad infinita para sentir lo que otros sienten.',
      personalityTraits: ['Sensibilidad psíquica y espiritual innata', 'Talento artístico, musical o poético', 'Bondad y empatía sin límites'],
      relationalStyle: 'Romántico incondicional, tierno, devoto y buscando comunión de almas.',
      spiritualDrive: 'Disolver las fronteras del ego en el amor universal.',
      shadowTendency: 'Vulnerabilidad a absorber la negatividad del entorno y evasión.',
      lifeMotto: '«Siento la unidad de todas las almas en el océano del amor divino.»'
    },
    2: {
      sign: 'Pisces',
      decanNumber: 2,
      degreeRange: '10°00\' - 19°59\' Piscis',
      approxDates: '1 de Marzo - 10 de Marzo',
      title: 'El Guardián Emocional y Sanador del Alma',
      ruler: 'Neptuno',
      subRuler: 'Luna',
      subSign: 'Cáncer',
      element: 'Agua Nutricia',
      symbol: '♓ ♋ ☽',
      keywords: ['Protector', 'Sanador', 'Emocional', 'Nutricio', 'Leal', 'Intuitivo'],
      description: 'Sub-regencia de la Luna (Cáncer). Gran instinto protector familiar y dones para la sanación emocional. Es el refugio donde los seres heridos encuentran paz y consuelo.',
      personalityTraits: ['Capacidad de consuelo y contención emocional profunda', 'Lealtad entrañable hacia su familia y círculo íntimo', 'Intuición protectora'],
      relationalStyle: 'Afectuoso, tierno, protector y creando un nido de seguridad y amor.',
      spiritualDrive: 'Albergar y sanar los corazones afligidos mediante la compasión.',
      shadowTendency: 'Apego a heridas del pasado y sobreprotección emocional.',
      lifeMotto: '«Mi corazón es un santuario de paz y consuelo para quienes amo.»'
    },
    3: {
      sign: 'Pisces',
      decanNumber: 3,
      degreeRange: '20°00\' - 29°59\' Piscis',
      approxDates: '11 de Marzo - 20 de Marzo',
      title: 'El Alquimista Espiritual y Resiliente Profundo',
      ruler: 'Neptuno',
      subRuler: 'Plutón',
      subSign: 'Escorpio',
      element: 'Agua Transformadora',
      symbol: '♓ ♏ ♇',
      keywords: ['Transformador', 'Magnético', 'Resiliente', 'Espiritual', 'Profundo', 'Místico'],
      description: 'Sub-regencia de Plutón/Marte (Escorpio). Combina la sensibilidad de Piscis con la fuerza regenerativa y el magnetismo de Escorpio. Capaz de atravesar las mayores tormentas y emerger victorioso.',
      personalityTraits: ['Fuerza espiritual indomable y resiliencia asombrosa', 'Poder magnético y visión psicológica profunda', 'Determinación en sus convicciones'],
      relationalStyle: 'Intenso, apasionado, leal hasta el infinito y profundamente transformador.',
      spiritualDrive: 'Trascender cualquier oscuridad y elevar la conciencia hacia la luz.',
      shadowTendency: 'Secretismo y desconfianza en momentos de dolor.',
      lifeMotto: '«De las profundidades más oscuras emerjo iluminado y renovado.»'
    }
  }
};

import { canonicalSignName } from './utils';
export { canonicalSignName };

/**
 * Calculates the Decanate (1, 2, or 3) from a degree within the sign (0 to 30).
 */
export function getDecanNumberFromDegree(deg: number): 1 | 2 | 3 {
  if (deg < 10) return 1;
  if (deg < 20) return 2;
  return 3;
}

/**
 * Returns full Decanate information for a given sign and degree.
 */
export function getDecanateInfo(sign: string, degree: number): DecanateInfo {
  const canonical = canonicalSignName(sign);
  const decanNum = getDecanNumberFromDegree(degree);
  const signDatabase = DECANATES_DATABASE[canonical] || DECANATES_DATABASE['Aries'];
  return signDatabase[decanNum];
}
