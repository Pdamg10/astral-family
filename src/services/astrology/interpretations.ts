export interface AspectReportItem {
  aspectTitle: string;
  type: string;
  orb: number;
  text: string;
}

export interface PlanetaryInterpretation {
  body: string;
  title: string;
  astronomicalDescription: string;
  sign: string;
  signInterpretation: string;
  house: number;
  houseInterpretation: string;
  aspectInterpretations: AspectReportItem[];
}

export interface FullAstrologicalReport {
  title: string;
  subtitle: string;
  prologue: string;
  ascendant: {
    sign: string;
    degreeFormatted: string;
    symbol: string;
    concept: string;
    text: string;
  };
  midheaven: {
    sign: string;
    degreeFormatted: string;
    text: string;
  };
  elementalSynthesis: {
    dominantElement: string;
    elementalSummary: string;
    dominantModality: string;
    modalitySummary: string;
  };
  planets: PlanetaryInterpretation[];
  epilogue: string;
}

const ASCENDANT_DESCRIPTIONS: Record<string, string> = {
  Aries: 'Persona de temperamento pionero, audaz, dinámico y lleno de iniciativa. Proyecta una energía frontal y directa hacia el mundo. Tiende a reaccionar con rapidez e ímpetu ante los desafíos, abriendo caminos con valentía.',
  Taurus: 'Persona de presencia firme, serena y perseverante. Transmite estabilidad, paciencia y calma constructiva. Aprecia los ritmos orgánicos y posee un pragmatismo natural para consolidar metas palpables.',
  Gemini: 'Persona de mente despierta, comunicativa, versátil y curiosa. Proyecta agilidad mental y don de gentes. Se adapta con asombrosa facilidad a entornos cambiantes y conecta ideas con rapidez.',
  Cancer: 'Persona intuitiva, protectora, receptiva y de profunda sensibilidad. Proyecta empatía natural y una inclinación innata a cuidar y nutrir los vínculos significativos.',
  Leo: 'Persona de carácter fuerte, noble y orgulloso. Dominante en todos los terrenos de su vida y por lo tanto también en el trabajo, su engreimiento ha nacido de haber sabido dominarse a sí misma. Generosa, franca y justa a la hora de comprender a los demás, transmite seguridad y dignidad. Irradia alegría y entusiasmo, amante de los placeres y con un magnetismo natural de liderazgo.',
  Virgo: 'Persona analítica, observadora, detallista y orientada a la excelencia. Proyecta lucidez, método y un sentido práctico para resolver problemas cotidianos con impecable precisión.',
  Libra: 'Persona diplomática, estética, conciliadora y sociable. Busca la armonía en todos sus tratos y proyecta un encanto natural que desarma tensiones mediante el diálogo y el equilibrio.',
  Scorpio: 'Persona intensa, perceptiva, magnética y de mirada penetrante. Proyecta profundidad emocional y una determinación inquebrantable capaz de sortear cualquier crisis con resiliencia.',
  Sagittarius: 'Persona entusiasta, optimista, filosófica y de espíritu libre. Proyecta una visión amplia hacia el futuro, amor por la aventura y una búsqueda constante de significado y expansión.',
  Capricorn: 'Persona sobria, responsable, perseverante y con sólida visión a largo plazo. Proyecta madurez, autoridad moral y un compromiso férreo con la autosuperación.',
  Aquarius: 'Persona original, vanguardista, independiente y con profunda conciencia social. Proyecta libertad de pensamiento, rechazo a los convencionalismos rígidos y visión de futuro.',
  Pisces: 'Persona sensible, soñadora, empática e intuitiva. Proyecta una comprensión sutil de las corrientes emocionales y una calidez que conecta con la dimensión trascendente.',
};

const MIDHEAVEN_DESCRIPTIONS: Record<string, string> = {
  Aries: 'Vocación orientada a la iniciativa independiente, el liderazgo pionero y el emprendimiento audaz en el ámbito profesional.',
  Taurus: 'Vocación orientada a la creación de valor duradero, la gestión de recursos tangibles, la estética y la estabilidad patrimonial.',
  Gemini: 'Vocación orientada a la comunicación, el periodismo, las redes, el comercio intelectual y la difusión de ideas dinámicas.',
  Cancer: 'Vocación orientada a la nutrición comunitaria, la psicología, la protección social, el patrimonio histórico o la hostelería.',
  Leo: 'Vocación orientada a la dirección creativa, las artes escénicas, el prestigio ejecutivo y la representación carismática.',
  Virgo: 'Vocación orientada a la consultoría analítica, los servicios de salud, la ingeniería de procesos y la optimización rigurosa.',
  Libra: 'Vocación orientada a la diplomacia, las leyes, la mediación, las relaciones públicas y el diseño artístico.',
  Scorpio: 'Vocación orientada a la investigación profunda, la transformación financiera, la cirugía, el psicoanálisis y el poder estratégico.',
  Sagittarius: 'Vocación orientada a la docencia superior, el derecho internacional, las editoriales, el turismo y los grandes horizontes filosóficos.',
  Capricorn: 'Vocación orientada a la alta administración, la política, la arquitectura institucional y el logro escalonado de autoridad pública.',
  Aquarius: 'Vocación orientada a la tecnología de vanguardia, las ciencias sociales, la innovación comunitaria y proyectos humanitarios.',
  Pisces: 'Vocación orientada a las artes espirituales, la cinematografía, la medicina holística, la filantropía y el trabajo solidario.',
};

const PLANET_INTRO: Record<string, { title: string; desc: string }> = {
  Sun: {
    title: 'El Sol - El Núcleo de la Conciencia y la Identidad Vital',
    desc: 'El Sol representa la esencia central del ser, el principio de vitalidad, voluntad creadora y el propósito evolutivo que ilumina el camino vital.',
  },
  Moon: {
    title: 'La Luna - El Mundo Emocional, la Memoria y el Refugio Afectivo',
    desc: 'La Luna rige el inconsciente, las respuestas instintivas, la nutrición emocional, los hábitos arraigados y la búsqueda de seguridad y pertenencia.',
  },
  Mercury: {
    title: 'Mercurio - La Mente Racional, el Discernimiento y la Comunicación',
    desc: 'Mercurio simboliza los procesos cognitivos, el intercambio verbal y escrito, la capacidad de análisis y la agilidad para interconectar ideas.',
  },
  Venus: {
    title: 'Venus - El Principio de Armonía, el Afecto y el Sentido del Valor',
    desc: 'Venus rige la capacidad de amar, la apreciación estética, los valores éticos, la atracción magnética y la búsqueda de concordia en los vínculos.',
  },
  Mars: {
    title: 'Marte - La Fuerza de Acción, la Pasión y la Autoafirmación',
    desc: 'Marte representa el motor del deseo, la capacidad de iniciativa, el coraje para defender principios y la energía motriz para abrir caminos.',
  },
  Jupiter: {
    title: 'Júpiter - La Expansión, la Sabiduría y la Búsqueda de Sentido',
    desc: 'Júpiter simboliza la generosidad, el crecimiento intelectual y espiritual, la confianza en el devenir y la apertura hacia metas trascendentes.',
  },
  Saturn: {
    title: 'Saturno - La Estructura, la Disciplina y la Maestría Personal',
    desc: 'Saturno representa el principio de realidad, el tiempo, los límites constructivos, la perseverancia y la madurez alcanzada con esfuerzo honesto.',
  },
  Uranus: {
    title: 'Urano - La Innovación, la Originalidad y la Emancipación',
    desc: 'Urano rige los destellos de lucidez intuitiva, la necesidad de libertad individual, las revoluciones de conciencia y el pensamiento futurista.',
  },
  Neptune: {
    title: 'Neptuno - La Trascendencia, la Imaginación y el Amor Incondicional',
    desc: 'Neptuno simboliza la disolución de fronteras, la inspiración artística superior, la mística, la compasión y la conexión con el inconsciente colectivo.',
  },
  Pluto: {
    title: 'Plutón - La Metamorfosis Psicológica, el Poder Oculto y el Renacimiento',
    desc: 'Plutón rige las fuerzas telúricas de transformación, la capacidad de regenerarse ante cualquier crisis y la desintoxicación de apegos obsoletos.',
  },
  Chiron: {
    title: 'Quirón - El Sanador Herido y el Puente hacia la Compasión',
    desc: 'Quirón señala la herida primordial que, al ser integrada conscientemente, se convierte en la mayor fuente de sabiduría y sanación para los demás.',
  },
  NorthNode: {
    title: 'El Nodo Norte - La Brújula del Propósito Evolutivo',
    desc: 'El Nodo Norte marca la dirección hacia la cual el alma necesita desplegarse en esta encarnación para equilibrar aprendizajes kármicos previos.',
  },
  Lilith: {
    title: 'Lilith (Luna Negra) - La Fuerza Salvaje, el Deseo y la Soberanía',
    desc: 'Lilith representa la autenticidad indómita, la rebeldía frente al condicionamiento castrante y el reclamo de la dignidad personal.',
  },
};

const PLANET_IN_SIGN: Record<string, Record<string, string>> = {
  Sun: {
    Aries: 'Voluntad ardiente, espíritu de vanguardia y entusiasmo contagioso. Afrontas la vida con valentía directa y no temes ser la primera persona en abrir senderos inexplorados.',
    Taurus: 'Determinación serena, paciencia constructiva y fuerte conexión con la belleza material y la estabilidad. Creas valor mediante la constancia y la calma productiva.',
    Gemini: 'Mente curiosa, comunicativa y polifacética. Encuentras tu vitalidad en el aprendizaje continuo, el debate estimulante y la versatilidad de intereses.',
    Cancer: 'Conciencia profundamente empática, protectora y ligada al alma familiar. Tu poder radica en tu intuición emocional y tu capacidad para cobijar y nutrir a quienes amas.',
    Leo: 'Magnanimidad, nobleza de corazón y presencia radiante. Posees un liderazgo natural que busca inspirar a los demás con dignidad, generosidad y autoexpresión auténtica.',
    Virgo: 'Mente orientada a la perfección, sentido del servicio y lucidez práctica. Destacas por tu capacidad para ordenar el caos, resolver dilemas complejos y optimizar la realidad.',
    Libra: 'Búsqueda constante de equilibrio, elegancia y justicia social. Brillas al generar armonía en los vínculos humanos y valorar la belleza estética en todas sus formas.',
    Scorpio: 'Intensidad emocional transformadora, agudeza psicológica y voluntad inquebrantable. Tu fuerza reside en mirar de frente a las sombras y renacer de cualquier dificultad.',
    Sagittarius: 'Espíritu libre, optimismo contagioso y vocación filosófica. Te motiva la búsqueda de horizontes amplios, los viajes y la comprensión de las leyes universales.',
    Capricorn: 'Madurez temprana, sentido de la responsabilidad y perseverancia férrea. Construyes tu destino paso a paso con sobriedad, paciencia y visión de legado duradero.',
    Aquarius: 'Mentalidad visionaria, originalidad disruptiva y compromiso con el progreso colectivo. Valoras la independencia de criterio y la fraternidad universal.',
    Pisces: 'Sensibilidad poética, compasión ilimitada y conexión intuitiva con el misterio de la vida. Tu esencia fluye con empatía, arte y comprensión espiritual.',
  },
  Moon: {
    Aries: 'Reacciones emocionales espontáneas, pasionales y directas. Necesitas independencia y acción para canalizar tus sentimientos sin represión.',
    Taurus: 'Estabilidad emocional, apego a la calma y disfrute sensorial. Encuentras tu refugio afectivo en la constancia, la naturaleza y la seguridad hogareña.',
    Gemini: 'Procesamiento racional de las emociones, necesidad de diálogo y versatilidad afectiva. Te calmas al expresar en palabras lo que sientes.',
    Cancer: 'Sensibilidad a flor de piel, memoria afectiva prodigiosa e instinto maternal. Tu hogar y tus raíces íntimas son tu santuario imprescindible.',
    Leo: 'Generosidad afectiva, necesidad de reconocimiento y calidez de corazón. Expresas tu cariño de forma grandilocuente, leal y protectora.',
    Virgo: 'Afecto expresado a través de actos útiles de servicio y cuidado práctico. Buscas orden interior para procesar tus estados emocionales con serenidad.',
    Libra: 'Búsqueda innata de serenidad, diplomacia afectiva y necesidad de compartir. Las discusiones te desestabilizan; floreces en atmósferas amables y estéticas.',
    Scorpio: 'Emociones abisales, lealtad inquebrantable y necesidad de honestidad visceral. Tu mundo interior es un volcán de pasión y resiliencia transformadora.',
    Sagittarius: 'Emocionalidad optimista, entusiasmo contagioso y rechazo a las ataduras asfixiantes. Te reconforta viajar, aprender y mirar hacia el futuro con fe.',
    Capricorn: 'Reserva emocional, autocontrol y lealtad a toda prueba. Aunque te cueste exteriorizar tus sentimientos, tu compromiso afectivo es sólido como una roca.',
    Aquarius: 'Desapego saludable, empatía con las causas amplias y amistad entrañable. Necesitas espacio personal y libertad para sentirte en paz contigo mismo.',
    Pisces: 'Esponja psíquica de extraordinaria ternura, empatía universal y talento imaginativo. Sientes las vibraciones del entorno con una sensibilidad oceánica.',
  },
  Mercury: {
    Aries: 'Pensamiento rápido, directo, incisivo y espontáneo. Dices las verdades con claridad meridiana y destacas por tu rapidez para tomar decisiones.',
    Taurus: 'Pensamiento reflexivo, práctico y metódico. Asimilas la información a fondo y tus razonamientos se orientan hacia resultados tangibles y sólidos.',
    Gemini: 'Agilidad mental fulgurante, destreza verbal y curiosidad insaciable. Tienes un talento nato para los idiomas, la comunicación y las relaciones públicas.',
    Cancer: 'Pensamiento intuitivo, teñido por la memoria emocional y la imaginación poética. Aprendes mejor cuando te vinculas afectivamente con el tema.',
    Leo: 'Comunicación elocuente, persuasiva, teatral y cargada de convicción. Expresas tus ideas con seguridad y capacidad para motivar a grupos enteros.',
    Virgo: 'Mente analítica suprema, rigor lógico, atención milimétrica al detalle y don para la organización de sistemas complejos.',
    Libra: 'Pensamiento dialéctico, equilibrado, diplomático y estético. Evalúas todos los puntos de vista antes de emitir un juicio ecuánime.',
    Scorpio: 'Mente detectivesca, penetrante, perspicaz y estratégica. No te conformas con las apariencias; descifras los motivos ocultos con pasmosa lucidez.',
    Sagittarius: 'Pensamiento sintético, holístico, filosófico y global. Te apasionan las grandes ideas, las culturas extranjeras y los conceptos trascendentes.',
    Capricorn: 'Estructura mental sólida, pensamiento estratégico, sobrio y pragmático. Destacas por tu sensatez, disciplina de estudio y lógica implacable.',
    Aquarius: 'Mente brillante, innovadora, inventiva y no convencional. Eres capaz de concebir soluciones futuristas que se adelantan a tu tiempo.',
    Pisces: 'Pensamiento holístico, intuitivo, artístico y metafórico. Captas las ideas por resonancia simbólica y comprendes más allá de las palabras lógicas.',
  },
  Venus: {
    Aries: 'Amor apasionado, directo, conquistador y ardiente. En las relaciones buscas emoción viva, aventura y sinceridad sin rodeos.',
    Taurus: 'Afecto cálido, sensual, fiel y duradero. Disfrutas de los placeres de la vida, las caricias, la buena mesa y la solidez compartida.',
    Gemini: 'Atracción mental, coquetería chispeante y necesidad de complicidad intelectual. Te enamoran las conversaciones ingeniosas y la libertad compartida.',
    Cancer: 'Amor protector, tierno, dulce y de profunda entrega emocional. Creas un nido de calidez donde los vínculos se cuidan con devoción.',
    Leo: 'Amor regio, generoso, apasionado y leal. Te entregas con orgullo y magnanimidad, colmando a tu pareja de detalles memorables.',
    Virgo: 'Amor discreto, devoto, atento a las necesidades del otro y basado en la ayuda mutua cotidiana. Tu ternura se manifiesta en la lealtad constante.',
    Libra: 'El refinamiento del amor en su máxima expresión. Buscas la reciprocidad perfecta, el romance exquisito, la belleza y la armonía conyugal.',
    Scorpio: 'Pasión volcánica, entrega absoluta, magnetismo magnánimo y deseo de fusión total de almas. El amor para ti es un viaje transformador.',
    Sagittarius: 'Amor libre, alegre, generoso y compañero de aventuras. Buscas una pareja con quien explorar el mundo y expandir los horizontes vitales.',
    Capricorn: 'Afecto maduro, comprometido, prudente y fiel para toda la vida. Valoras el respeto mutuo, el tiempo compartido y la construcción de un futuro sólido.',
    Aquarius: 'Amor basado en la amistad profunda, el respeto a la individualidad y la complicidad no convencional. Huidas de los celos y la posesividad.',
    Pisces: 'Romance místico, entrega incondicional, compasión sublime y poesía en el trato. Amas con el alma entera, disolviendo cualquier barrera del ego.',
  },
  Mars: {
    Aries: 'Fuerza de acción pura, valentía inagotable y determinación arrolladora. Actúas con iniciativa fulgurante y lideras desde la primera línea.',
    Taurus: 'Fuerza perseverante, resistencia física formidable y determinación inquebrantable. Trabajas con paciencia y no te detienes hasta consolidar tus metas.',
    Gemini: 'Energía ágil, multifacética y combativa a través de la palabra. Destacas por tus rápidos reflejos, debate incisivo y destreza manual.',
    Cancer: 'Fuerza defensiva, apasionada por la protección de los suyos y tenaz ante los desafíos. Actúas guiado por el corazón y una intuición protectora.',
    Leo: 'Empuje audaz, coraje noble y liderazgo vigoroso. Te moviliza el orgullo del trabajo bien hecho y la conquista de metas que dejen huella.',
    Virgo: 'Acción precisa, metodológica, eficiente y orientada a la solución práctica. Canalizas tu energía con disciplina y concentración quirúrgica.',
    Libra: 'Energía encauzada hacia la justicia, la defensa de los débiles y la mediación asertiva. Luchas por causas nobles con elegancia y diplomacia.',
    Scorpio: 'Poder de voluntad colosal, resistencia psicológica imbatible y energía estratégica penetrante. Tu fuerza es silenciosa pero implacable.',
    Sagittarius: 'Acción entusiasta, deportiva, inspiradora y guiada por nobles ideales. Te movilizan las grandes causas y la conquista de nuevos horizontes.',
    Capricorn: 'Energía canalizada con máxima disciplina, ambición constructiva y paciencia estratégica. Eres capaz de mover montañas con constancia.',
    Aquarius: 'Acción rebelde, original, cooperativa e innovadora. Luchas por la libertad, el progreso tecnológico y las transformaciones humanitarias.',
    Pisces: 'Fuerza guiada por la compasión, la inspiración artística y la entrega espiritual. Actúas como un canal para nobles obras de ayuda y belleza.',
  },
  Jupiter: {
    Aries: 'Crecimiento a través de la audacia personal, el espíritu pionero y el liderazgo independiente.',
    Taurus: 'Prosperidad a través del uso sabio de los recursos naturales, la inversión paciente y el aprecio por la abundancia sólida.',
    Gemini: 'Expansión mediante el conocimiento multifacético, las redes de contactos, la enseñanza y los intercambios culturales.',
    Cancer: 'Fortuna a través de la hospitalidad, la protección comunitaria, el arraigo y el cultivo de la generosidad familiar.',
    Leo: 'Grandeza a través del talento creativo, la magnanimidad, la generosidad deslumbrante y la dirección de grandes proyectos.',
    Virgo: 'Sabiduría forjada en la maestría técnica, el servicio abnegado a la salud y la búsqueda de la eficiencia constructiva.',
    Libra: 'Oportunidades a través de alianzas justas, la diplomacia, las artes y la capacidad para conciliar intereses opuestos.',
    Scorpio: 'Abundancia a través de la regeneración financiera, el poder de investigación psicológica y la superación de crisis.',
    Sagittarius: 'Plenitud jupiteriana en su propio domicilio: optimismo desbordante, sabiduría filosófica y fortuna en viajes y altos estudios.',
    Capricorn: 'Crecimiento estructurado mediante la integridad profesional, la perseverancia y el ascenso institucional sólido.',
    Aquarius: 'Expansión a través de proyectos visionarios, redes humanitarias globales y la defensa de causas comunitarias avanzadas.',
    Pisces: 'Gracia espiritual, fe inquebrantable, bendiciones artísticas y una profunda generosidad que conmueve corazones.',
  },
  Saturn: {
    Aries: 'Lección kármica de forjar la paciencia, canalizar el impulso agresivo y desarrollar una autodisciplina madura y reflexiva.',
    Taurus: 'Maestría en la construcción de seguridad material, superando temores de escasez mediante el trabajo perseverante y austero.',
    Gemini: 'Estructuración del intelecto, rigor en la comunicación y desarrollo de una oratoria y pensamiento de alta precisión lógica.',
    Cancer: 'Consolidación de la madurez emocional, sanando heridas de pertenencia y convirtiéndose en un pilar de contención afectiva.',
    Leo: 'Purificación del ego, aprendizaje de la verdadera humildad y conquista de un liderazgo basado en la autoridad moral indiscutible.',
    Virgo: 'Perfeccionamiento del sentido del deber, maestría técnica rigurosa y administración impecable de la salud y el trabajo.',
    Libra: 'Saturno en exaltación: compromiso intachable en los pactos, sentido supremo de la justicia y relaciones forjadas en la lealtad.',
    Scorpio: 'Resistencia titanica frente a las pruebas emocionales, dominio de las pasiones y renacimiento psicológico inquebrantable.',
    Sagittarius: 'Maduración de la propia filosofía de vida, búsqueda de certezas éticas sólidas y responsabilidad pedagógica.',
    Capricorn: 'Saturno en su máximo esplendor: integridad, capacidad organizativa excepcional, paciencia milenaria y éxito cimentado en la roca.',
    Aquarius: 'Saturno en domicilio tradicional: compromiso social férreo, fidelidad a principios humanitarios y visión científica estructurada.',
    Pisces: 'Transmutación de la compasión en obras concretas de servicio silencioso, superando ilusiones para abrazar la sabiduría espiritual.',
  },
  Uranus: {
    Aries: 'Impulso revolucionario de innovación radical, valentía para romper ataduras obsoletas e invenciones audaces.',
    Taurus: 'Revolución en los paradigmas económicos, nuevas formas de relación con la tierra y sostenibilidad de vanguardia.',
    Gemini: 'Pensamiento visionario eléctrico, dominio de las tecnologías de la comunicación y destellos de genialidad verbal.',
    Cancer: 'Transformación de los conceptos tradicionales de familia y hogar hacia modelos comunitarios más libres e inclusivos.',
    Leo: 'Originalidad deslumbrante en la autoexpresión artística y rechazo a los moldes jerárquicos dogmáticos.',
    Virgo: 'Innovación en los métodos de trabajo, medicina de vanguardia, ecología técnica y optimización tecnológica cotidiana.',
    Libra: 'Nuevas formas de vinculación afectiva y social basadas en la libertad individual y la igualdad de derechos.',
    Scorpio: 'Profunda catarsis psicológica colectiva, investigación de energías ocultas y regeneración de recursos estratégicos.',
    Sagittarius: 'Expansión de la conciencia global, visión cosmopolita avanzada y renovación de los dogmas filosóficos.',
    Capricorn: 'Reforma de las estructuras de poder, ingeniería de sistemas de gobierno y modernización institucional.',
    Aquarius: 'Urano en su plenitud: salto cuántico tecnológico, fraternidad universal, redes globales y pensamiento humanitario libre.',
    Pisces: 'Despertar de la intuición superior, mística renovada, cinematografía vanguardista y conexión con campos sutiles.',
  },
  Neptune: {
    Aries: 'Idealismo heroico, inspiración para emprender cruzadas altruistas y canalización de la intuición hacia la acción.',
    Taurus: 'Sensibilidad para percibir la sacralidad de la materia, talento artístico plástico y búsqueda de armonía con la naturaleza.',
    Gemini: 'Imaginación poética, pensamiento intuitivo sutil y facilidad para la literatura fantástica y la comunicación telepática.',
    Cancer: 'Profunda devoción por el hogar cósmico, empatía psíquica familiar y conexión con las memorias del linaje.',
    Leo: 'Glamour artístico deslumbrante, capacidad para encarnar arquetipos mitológicos y generosidad romántica inspirada.',
    Virgo: 'Búsqueda de la pureza interior, vocación de servicio desinteresado y comprensión de la medicina holística y natural.',
    Libra: 'Idealización de la pareja cósmica, búsqueda de la belleza platónica y talento para la música y la diplomacia sutil.',
    Scorpio: 'Percepción de los misterios esotéricos, transmutación de deseos densos en devoción mística y sanación chamánica.',
    Sagittarius: 'Fe en la unidad de todas las religiones, idealismo ecuménico, amor por los viajes de peregrinación y filosofía mística.',
    Capricorn: 'Habilidad para plasmar sueños etéreos en realidades institucionales y canalizar la compasión en estructuras concretas.',
    Aquarius: 'Sueño de una sociedad fraterna sin fronteras, idealismo humanitario y conexión con la conciencia colectiva.',
    Pisces: 'Neptuno en su trono sagrado: mística pura, disolución del ego en el océano de amor cósmico y genio musical o espiritual.',
  },
  Pluto: {
    Aries: 'Poder pionero indomable, transformación radical del concepto de coraje y regeneración a través de la iniciativa.',
    Taurus: 'Transformación profunda del sistema de valores, empoderamiento mediante recursos sostenibles y desapego material.',
    Gemini: 'Poder de la palabra incisiva, transmutación de paradigmas mentales y capacidad para investigar secretos impenetrables.',
    Cancer: 'Regeneración visceral de las raíces familiares, sanación de heridas transgeneracionales y protección inquebrantable.',
    Leo: 'Empoderamiento del carisma creador, metamorfosis de la soberbia en nobleza regia y liderazgo transformacional.',
    Virgo: 'Poder de sanación profunda a través de la purificación orgánica, rigor técnico y erradicación de ineficiencias.',
    Libra: 'Transformación de las dinámicas de poder en la pareja, disolución de relaciones tóxicas y renacimiento de la justicia.',
    Scorpio: 'Plutón en su máxima soberanía: transmutación psicológica radical, magnetismo irresistible y poder de resurrección total.',
    Sagittarius: 'Metamorfosis de las creencias filosóficas, erradicación de dogmas y búsqueda de la verdad esencial del universo.',
    Capricorn: 'Derrumbe de estructuras caducas, reconstrucción ética del poder público y forja de un legado indestructible.',
    Aquarius: 'Poder democratizador, renacimiento del poder en manos del colectivo y revolución evolutiva de la conciencia.',
    Pisces: 'Disolución de ilusiones espirituales, compasión redentora y conexión con la fuente cósmica del ser.',
  },
  Chiron: {
    Aries: 'Herida en la autoafirmación y el derecho a existir; se convierte en el don de inspirar y empoderar el coraje ajeno.',
    Taurus: 'Herida en la autovaloración y la seguridad material; florece como una profunda sabiduría en la abundancia orgánica y la calma.',
    Gemini: 'Herida en la comunicación o aprendizaje temprano; se transforma en un don excepcional para la pedagogía y la escucha empática.',
    Cancer: 'Herida en el sentido de pertenencia o cuidado materno; se convierte en un refugio incondicional de sanación afectiva.',
    Leo: 'Herida en la creatividad o reconocimiento propio; se transmuta en el talento de celebrar y hacer brillar el potencial de los demás.',
    Virgo: 'Herida en la autoexigencia o salud física; se convierte en maestría médica, terapéutica y sabiduría holística cotidiana.',
    Libra: 'Herida en las relaciones o la búsqueda de aprobación; florece como un don maestro para la mediación, la justicia y la paz.',
    Scorpio: 'Herida en experiencias de pérdida o traición; se transforma en la capacidad chamánica de guiar a otros en sus noches oscuras.',
    Sagittarius: 'Herida en la fe o el sentido de la vida; florece como un faro de sabiduría trascendente y guía espiritual auténtica.',
    Capricorn: 'Herida en el reconocimiento del padre o la autoridad; se transforma en un liderazgo maduro, ético y de servicio noble.',
    Aquarius: 'Herida por sentirse incomprendido o marginado; se transmuta en un activismo visionario por la inclusión y la libertad colectiva.',
    Pisces: 'Herida de desconexión cósmica o hipersensibilidad; florece como un canal sublime de compasión, arte y sanación energética.',
  },
  NorthNode: {
    Aries: 'El sendero evolutivo te invita a desarrollar el coraje individual, la iniciativa propia y la valentía para liderar tu propio destino.',
    Taurus: 'Tu evolución te llama a consolidar la estabilidad, disfrutar de la paz presente y valorar la sencillez y abundancia orgánica.',
    Gemini: 'Tu sendero te invita a cultivar la curiosidad, el diálogo abierto, la flexibilidad mental y el aprendizaje permanente.',
    Cancer: 'Tu evolución te guía a honrar tus emociones íntimas, nutrir tus vínculos y crear un hogar cálido desde el corazón.',
    Leo: 'Tu sendero te invita a desplegar tu creatividad singular, irradiar generosidad y asumir tu rol de líder desde la nobleza.',
    Virgo: 'Tu evolución te llama al servicio práctico, la disciplina saludable, el orden constructivo y la maestría en los detalles.',
    Libra: 'Tu sendero te invita a desarrollar la empatía, la diplomacia, el arte de cooperar y la búsqueda de relaciones armónicas.',
    Scorpio: 'Tu evolución te desafía a profundizar en tu poder psicológico, abrazar la transformación y soltar apegos obsoletos.',
    Sagittarius: 'Tu sendero te guía hacia la expansión de horizontes, la fe en el porvenir, los altos estudios y la verdad filosófica.',
    Capricorn: 'Tu evolución te invita a cultivar la madurez, la autosuficiencia, la integridad moral y la construcción de metas duraderas.',
    Aquarius: 'Tu sendero te invita a integrarte a causas colectivas, abrazar la originalidad y trabajar por el progreso fraternal de la humanidad.',
    Pisces: 'Tu evolución te llama a conectar con la intuición superior, la compasión incondicional y la entrega a la dimensión espiritual.',
  },
  Lilith: {
    Aries: 'Fuerza salvaje que no tolera sumisiones; reclama la soberanía de la voluntad propia con fuego indómito.',
    Taurus: 'Sensualidad visceral y apego radical a la propia autonomía corporal y material frente a mandatos sociales.',
    Gemini: 'Palabra afilada que desenmascara hipocresías; rebeldía mental frente al pensamiento dogmático impuesto.',
    Cancer: 'Instinto de protección feroz que rompe con mandatos tradicionales de domesticación emocional asfixiante.',
    Leo: 'Magnetismo soberbio que se niega a mendigar aprobación; brillo auténtico desde la pura autoafirmación.',
    Virgo: 'Rechazo a la servidumbre impuesta; lucidez implacable que no teme señalar los fallos de los sistemas establecidos.',
    Libra: 'Negativa a complacer para ser aceptada; búsqueda de relaciones basadas en la igualdad estricta y sin máscaras.',
    Scorpio: 'Poder erótico y psíquico supremo; desmantela cualquier intento de manipulación con mirada penetrante.',
    Sagittarius: 'Espíritu libre indomable que huye de jaulas ideológicas; búsqueda intransigente de su propia verdad.',
    Capricorn: 'Desafío a las jerarquías opresivas; autoridad forjada en la propia coherencia y no en títulos heredados.',
    Aquarius: 'Rebeldía vanguardista absoluta frente a las normas convencionales; defensa feroz de la singularidad.',
    Pisces: 'Mística indómita y clarividencia que trasciende cualquier dogma religioso o límite de la realidad material.',
  },
};

const HOUSE_THEMES: Record<number, { title: string; desc: string }> = {
  1: {
    title: 'Casa I - El Ascendente y la Proyección Personal',
    desc: 'Rige la personalidad manifiesta, la vitalidad física, la primera impresión que causamos en el mundo y el estilo de iniciativa ante la vida.',
  },
  2: {
    title: 'Casa II - Recursos, Finanzas y Autoestima',
    desc: 'Rige la economía personal, los talentos innatos, la capacidad de generar sustento material y la escala de valores que otorgan seguridad.',
  },
  3: {
    title: 'Casa III - Comunicación, Mente Práctica y Entorno Cercano',
    desc: 'Rige los intercambios cotidianos, hermanos, vecinos, viajes cortos, procesos de aprendizaje básico y la destreza verbal y escrita.',
  },
  4: {
    title: 'Casa IV (Fondo de Cielo) - Hogar, Raíces y Subconsciente',
    desc: 'Rige la base emocional íntima, el linaje familiar, la relación con las figuras parentales y el refugio privado del alma.',
  },
  5: {
    title: 'Casa V - Creatividad, Romance y Gozo Vital',
    desc: 'Rige la autoexpresión artística, los amores apasionados, los hijos, los juegos, las diversiones y el disfrute placentero de la existencia.',
  },
  6: {
    title: 'Casa VI - Trabajo Cotidiano, Salud y Servicio',
    desc: 'Rige la disciplina diaria, el ambiente laboral, los hábitos saludables, el perfeccionamiento técnico y el servicio útil a la comunidad.',
  },
  7: {
    title: 'Casa VII (Descendente) - Pareja, Asociaciones y Compromisos',
    desc: 'Rige el matrimonio, los socios comerciales, los contratos formales y la manera en que nos encontramos frente al espejo del "Otro".',
  },
  8: {
    title: 'Casa VIII - Transformación, Sexualidad y Finanzas Compartidas',
    desc: 'Rige las herencias, inversiones compartidas, la transmutación psicológica profunda, la intimidad sexual y la regeneración en las crisis.',
  },
  9: {
    title: 'Casa IX - Altos Estudios, Filosofía y Horizontes Lejanos',
    desc: 'Rige los viajes internacionales, la docencia superior, la ética, las leyes, la búsqueda espiritual y la visión de mundo abarcadora.',
  },
  10: {
    title: 'Casa X (Medio Cielo) - Vocación, Carrera y Reputación Pública',
    desc: 'Rige el estatus profesional, los logros sociales, el liderazgo institucional y la huella o legado visible que dejamos en la sociedad.',
  },
  11: {
    title: 'Casa XI - Amistades, Metas Colectivas y Proyectos de Futuro',
    desc: 'Rige los círculos de amigos afines, las organizaciones humanitarias, los ideales compartidos y las esperanzas para el porvenir.',
  },
  12: {
    title: 'Casa XII - Espiritualidad, Karma y el Inconsciente Colectivo',
    desc: 'Rige el retiro interior, la conexión con lo invisible, la superación de limitaciones kármicas, la compasión universal y el perdón sanador.',
  },
};

const ASPECT_INTERPRETATIONS_MAP: Record<string, string> = {
  'Sun-Moon': 'Integración entre la voluntad consciente y las necesidades emocionales profundas. Cuando fluye en armonía genera una gran paz interna y coherencia de vida.',
  'Sun-Mercury': 'Juicio lúcido, rapidez de pensamiento e inteligencia constructiva. Facilidad para la expresión oral y escrita y el aprendizaje continuo.',
  'Sun-Venus': 'Encanto personal, diplomacia innata, gracia estética y amor por la concordia y el buen trato social.',
  'Sun-Mars': 'Gran dinamismo, espíritu emprendedor y coraje para asumir desafíos. Impulso a la acción directa y liderazgo natural.',
  'Sun-Jupiter': 'Optimismo vital, generosidad de miras, nobleza y atracción constante de oportunidades afortunadas de crecimiento.',
  'Sun-Saturn': 'Voluntad férrea, constancia y disciplina madura. Capacidad para asumir grandes responsabilidades y alcanzar logros duraderos.',
  'Sun-Uranus': 'Mente vanguardista, magnetismo personal y creatividad original. Gusto por la innovación y la libertad de pensamiento.',
  'Sun-Neptune': 'Sensibilidad inspirada, intuición artística y compasión universal. Capacidad para captar matices sutiles del entorno.',
  'Sun-Pluto': 'Poder interior regenerador, magnetismo personal y determinación indomable ante cualquier reto vital.',
  'Sun-Ascendant': 'Presencia magnética, vitalidad física radiante y facilidad para proyectar tu autenticidad ante el mundo.',
  'Sun-MC': 'Brillo profesional natural, liderazgo reconocido y capacidad para dejar una impronta honorable en la sociedad.',
  'Moon-Mercury': 'Sensibilidad para comunicar emociones y captar el estado de ánimo de los demás. Mente intuitiva y empática.',
  'Moon-Venus': 'Dulzura en el trato, sentido estético refinado y amor por la armonía doméstica y los vínculos afectivos.',
  'Moon-Mars': 'Reacciones emocionales apasionadas, temperamento valiente y defensa leal de quienes ama.',
  'Moon-Jupiter': 'Optimismo emocional, generosidad de corazón y facilidad para generar bienestar y confianza en el hogar.',
  'Moon-Saturn': 'Reserva afectiva, lealtad incondicional y madurez emocional construida con sobriedad y cuidado.',
  'Moon-Uranus': 'Intuición relampagueante, necesidad de libertad emocional y capacidad para adaptarse a cambios imprevistos con frescura.',
  'Moon-Neptune': 'Imaginación desbordante, talento musical o poético y empatía profunda hacia los sentimientos ajenos.',
  'Moon-Pluto': 'Profundidad psicológica, resiliencia emocional y capacidad transformadora en los momentos críticos.',
  'Moon-Ascendant': 'Carácter afectuoso, espontaneidad en el trato y facilidad para sintonizar con el entorno social.',
  'Moon-MC': 'Sensibilidad para captar las necesidades del público y popularidad natural en la esfera profesional.',
  'Mercury-Venus': 'Elocuencia armoniosa, encanto en la conversación y gusto por la literatura, el arte y la diplomacia.',
  'Mercury-Mars': 'Mente incisiva, agudeza verbal, rapidez para debatir y gran destreza en la toma rápida de decisiones.',
  'Mercury-Jupiter': 'Visión panorámica, facilidad para la docencia, los idiomas y la asimilación de conceptos filosóficos complejos.',
  'Mercury-Saturn': 'Pensamiento estructurado, disciplina mental, rigor analítico y aptitud para la organización y la estrategia.',
  'Mercury-Uranus': 'Mente visionaria, destellos de genialidad, capacidad técnica excepcional e interés por lo innovador.',
  'Mercury-Neptune': 'Imaginación poética, pensamiento holístico y talento para la intuición y la comunicación simbólica.',
  'Mercury-Pluto': 'Profundidad analítica, agudeza detectivesca y capacidad para penetrar en las causas ocultas de las cosas.',
  'Mercury-Ascendant': 'Comunicación fluida, don de gentes y facilidad para expresar ideas con carisma y claridad pedagógica.',
  'Mercury-MC': 'Habilidad profesional para la gestión de información, el periodismo, los negocios y la consultoría estratégica.',
  'Venus-Mars': 'Atracción magnética, complementariedad entre ternura y pasión, y gran disfrute de las artes y el amor.',
  'Venus-Jupiter': 'Calidez social, generosidad afectiva, dicha compartida y atracción de circunstancias prósperas.',
  'Venus-Saturn': 'Fidelidad duradera, valores éticos profundos y amor que se consolida con el paso del tiempo.',
  'Venus-Uranus': 'Relaciones estimulantes, libertad en los afectos y búsqueda de conexiones singulares y creativas.',
  'Venus-Neptune': 'Idealismo romántico, amor incondicional, inspiración artística refinada y devoción espiritual.',
  'Venus-Pluto': 'Pasiones intensas, vínculos transformadores y magnetismo afectivo de gran calado psicológico.',
  'Venus-Ascendant': 'Belleza física o gracia encantadora que facilita el contacto social y abre puertas con simpatía.',
  'Venus-MC': 'Gracia social, talento artístico reconocido y facilidad para generar armonía en el ámbito profesional.',
  'Mars-Jupiter': 'Entusiasmo contagioso, valentía para emprender grandes metas y espíritu deportivo o conquistador.',
  'Mars-Saturn': 'Fuerza aplicada a la perseverancia, resistencia física y mental, y capacidad de trabajo incansable.',
  'Mars-Uranus': 'Acción audaz, reflejos rápidos, originalidad en la ejecución y espíritu independiente.',
  'Mars-Neptune': 'Energía canalizada hacia ideales artísticos, deportivos o humanitarios con gran devoción.',
  'Mars-Pluto': 'Voluntad sobrehumana, coraje reconstructivo y poder para superar cualquier obstáculo con determinación.',
  'Mars-Ascendant': 'Energía combativa, porte dinámico y determinación para abrirse paso con decisión ante el mundo.',
  'Mars-MC': 'Ambición enérgica, empuje competitivo y capacidad para liderar proyectos de alta exigencia.',
  'Jupiter-Saturn': 'Equilibrio constructivo entre expansión y prudencia, consolidando proyectos duraderos con solidez.',
  'Jupiter-Uranus': 'Oportunidades sorpresivas, espíritu pionero e impulsos afortunados de renovación y progreso.',
  'Jupiter-Neptune': 'Mística compasiva, generosidad sin límites y fe inquebrantable en nobles ideales humanos.',
  'Jupiter-Pluto': 'Capacidad para movilizar grandes recursos, visión transformadora y ambición por metas trascendentes.',
  'Jupiter-Ascendant': 'Presencia jovial, bondad manifiesta y facilidad para ganarse la confianza de quienes le rodean.',
  'Jupiter-MC': 'Prestigio social, buena reputación y expansión continua en el camino profesional y comunitario.',
  'Saturn-Uranus': 'Capacidad para reformar estructuras tradicionales con métodos innovadores y sólidos.',
  'Saturn-Neptune': 'Habilidad para materializar sueños e ideales sutiles en obras y proyectos concretos.',
  'Saturn-Pluto': 'Resistencia legendaria, templanza en la adversidad y capacidad de reconstrucción total.',
  'Saturn-Ascendant': 'Porte formal, madurez precoz y sentido de la responsabilidad visible en su presencia física.',
  'Saturn-MC': 'Ascenso profesional laborioso pero de máxima solidez y autoridad reconocida en su profesión.',
  'Uranus-Neptune': 'Intuición generacional elevada, inquietud por la renovación espiritual y social colectiva.',
  'Uranus-Pluto': 'Impulso evolutivo audaz, conciencia transformadora y compromiso con la evolución humana.',
  'Uranus-Ascendant': 'Presencia original, magnética y anticonvencional que despierta interés inmediato.',
  'Uranus-MC': 'Carrera innovadora, cambios de rumbo estimulantes y vocación por la vanguardia y el progreso.',
  'Neptuno-Pluto': 'Sensibilidad evolutiva profunda, búsqueda de valores universales y regeneración de la conciencia.',
  'Neptuno-Ascendant': 'Aura magnética, sensibilidad sutil y comprensión espontánea de la psicología de los demás.',
  'Neptuno-MC': 'Vocación conectada con las artes, la filantropía o carreras inspiradas de proyección pública.',
  'Pluto-Ascendant': 'Presencia magnética imponente, autoridad natural y capacidad innata para inspirar transformaciones.',
  'Pluto-MC': 'Poder transformador en la profesión, liderazgo estratégico y capacidad para asumir crisis ejecutivas.',
};

export const SIGN_NAMES_ES: Record<string, string> = {
  Aries: 'Aries',
  Taurus: 'Tauro',
  Gemini: 'Géminis',
  Cancer: 'Cáncer',
  Leo: 'Leo',
  Virgo: 'Virgo',
  Libra: 'Libra',
  Scorpio: 'Escorpio',
  Sagittarius: 'Sagitario',
  Capricorn: 'Capricornio',
  Aquarius: 'Acuario',
  Pisces: 'Piscis',
};

export function toSpanishSign(sign?: string | null): string {
  if (!sign) return 'Aries';
  return SIGN_NAMES_ES[sign] || sign;
}

export function formatDegreeMinute(deg?: number | null, min?: number | null): string {
  if (deg == null) return '0°00\'';
  const m = min != null ? Math.floor(min) : 0;
  return `${Math.floor(deg)}°${String(m).padStart(2, '0')}'`;
}

export function generateAstrologicalReport(
  profileNameOrOptions: string | any,
  sunSignArg?: string,
  sunDegreeArg?: number,
  sunHouseArg: number = 9,
  moonSignArg?: string,
  moonDegreeArg?: number,
  moonHouseArg: number = 2,
  ascSignArg?: string,
  ascDegreeArg?: number,
  positionsArg: { body: string; sign: string; degree: number; minute?: number; house?: number }[] = [],
  aspectsArg: { body1: string; body2: string; type: string; orb: number }[] = []
): FullAstrologicalReport {
  let profileName: string;
  let sunSign: string;
  let sunDegree: number;
  let sunMinute: number;
  let sunHouse: number;
  let moonSign: string;
  let moonDegree: number;
  let moonMinute: number;
  let moonHouse: number;
  let ascSign: string;
  let ascDegree: number;
  let ascMinute: number;
  let mcSign: string;
  let mcDegree: number;
  let mcMinute: number;
  let positions: { body: string; sign: string; degree: number; minute?: number; house?: number }[];
  let aspects: { body1: string; body2: string; type: string; orb: number }[];

  if (typeof profileNameOrOptions === 'object' && profileNameOrOptions !== null) {
    const opts = profileNameOrOptions;
    profileName = opts.profileName || opts.name || 'Miembro';
    sunSign = opts.sun?.sign || opts.sunSign || 'Aries';
    sunDegree = opts.sun?.degree ?? opts.sunDegree ?? 0;
    sunMinute = opts.sun?.minute ?? opts.sunMinute ?? 0;
    sunHouse = opts.sun?.house ?? opts.sunHouse ?? 9;

    moonSign = opts.moon?.sign || opts.moonSign || 'Acuario';
    moonDegree = opts.moon?.degree ?? opts.moonDegree ?? 0;
    moonMinute = opts.moon?.minute ?? opts.moonMinute ?? 0;
    moonHouse = opts.moon?.house ?? opts.moonHouse ?? 2;

    ascSign = opts.asc?.sign || opts.ascSign || 'Virgo';
    ascDegree = opts.asc?.degree ?? opts.ascDegree ?? 0;
    ascMinute = opts.asc?.minute ?? opts.ascMinute ?? 0;

    mcSign = opts.mc?.sign || opts.mcSign || 'Géminis';
    mcDegree = opts.mc?.degree ?? opts.mcDegree ?? 0;
    mcMinute = opts.mc?.minute ?? opts.mcMinute ?? 0;

    positions = opts.planetaryPositions || opts.positions || [];
    aspects = opts.aspects || [];
  } else {
    profileName = profileNameOrOptions || 'Miembro';
    sunSign = sunSignArg || 'Aries';
    sunDegree = sunDegreeArg || 0;
    sunMinute = 0;
    sunHouse = sunHouseArg || 9;

    moonSign = moonSignArg || 'Libra';
    moonDegree = moonDegreeArg || 0;
    moonMinute = 0;
    moonHouse = moonHouseArg || 2;

    ascSign = ascSignArg || 'Leo';
    ascDegree = ascDegreeArg || 0;
    ascMinute = 0;

    positions = positionsArg || [];
    aspects = aspectsArg || [];

    const mcPos = positions.find(p => p.body === 'MC');
    mcSign = mcPos?.sign || 'Géminis';
    mcDegree = mcPos?.degree || 0;
    mcMinute = mcPos?.minute || 0;
  }

  const ascText =
    ASCENDANT_DESCRIPTIONS[ascSign] ||
    ASCENDANT_DESCRIPTIONS[toSpanishSign(ascSign)] ||
    `El Ascendente en ${toSpanishSign(ascSign)} moldea la manera en que te proyectas hacia el mundo exterior, funcionando como el canal de expresión de tu esencia interna y tu primera reacción ante los estímulos de la vida.`;

  const mcText =
    MIDHEAVEN_DESCRIPTIONS[mcSign] ||
    MIDHEAVEN_DESCRIPTIONS[toSpanishSign(mcSign)] ||
    `El Medio Cielo en ${toSpanishSign(mcSign)} orienta tu reputación profesional, vocación y los ideales públicos que aspiras consolidar a lo largo de tu trayectoria vital.`;

  // Calculate Element & Modality Dominance
  const fireSigns = ['Aries', 'Leo', 'Sagittarius', 'Sagitario'];
  const earthSigns = ['Taurus', 'Tauro', 'Virgo', 'Capricorn', 'Capricornio'];
  const airSigns = ['Gemini', 'Géminis', 'Libra', 'Aquarius', 'Acuario'];
  const waterSigns = ['Cancer', 'Cáncer', 'Scorpio', 'Escorpio', 'Pisces', 'Piscis'];

  const cardinalSigns = ['Aries', 'Cancer', 'Cáncer', 'Libra', 'Capricorn', 'Capricornio'];
  const fixedSigns = ['Taurus', 'Tauro', 'Leo', 'Scorpio', 'Escorpio', 'Aquarius', 'Acuario'];
  const mutableSigns = ['Gemini', 'Géminis', 'Virgo', 'Sagittarius', 'Sagitario', 'Pisces', 'Piscis'];

  let fire = 0, earth = 0, air = 0, water = 0;
  let cardinal = 0, fixed = 0, mutable = 0;

  positions.forEach(p => {
    if (fireSigns.includes(p.sign)) fire++;
    else if (earthSigns.includes(p.sign)) earth++;
    else if (airSigns.includes(p.sign)) air++;
    else if (waterSigns.includes(p.sign)) water++;

    if (cardinalSigns.includes(p.sign)) cardinal++;
    else if (fixedSigns.includes(p.sign)) fixed++;
    else if (mutableSigns.includes(p.sign)) mutable++;
  });

  let dominantElement = 'Fuego 🔥';
  let elemSummary = 'Predominio de pasión, vitalidad, entusiasmo y coraje para emprender.';
  const maxElem = Math.max(fire, earth, air, water);
  if (maxElem === earth) {
    dominantElement = 'Tierra 🌍';
    elemSummary = 'Predominio de pragmatismo, estabilidad, perseverancia y construcción tangible.';
  } else if (maxElem === air) {
    dominantElement = 'Aire 💨';
    elemSummary = 'Predominio de agilidad mental, visión estratégica, comunicación y sociabilidad.';
  } else if (maxElem === water) {
    dominantElement = 'Agua 💧';
    elemSummary = 'Predominio de empatía profunda, intuición psíquica y sensibilidad emocional.';
  }

  let dominantModality = 'Cardinal ◆';
  let modSummary = 'Temperamento iniciador, con liderazgo innato y motivación para abrir ciclos.';
  const maxMod = Math.max(cardinal, fixed, mutable);
  if (maxMod === fixed) {
    dominantModality = 'Fijo ■';
    modSummary = 'Temperamento constante, leal, con gran capacidad de concentración y resistencia.';
  } else if (maxMod === mutable) {
    dominantModality = 'Mutable ▲';
    modSummary = 'Temperamento adaptable, versátil, flexible y con facilidad para la integración.';
  }

  const planetList = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'Lilith'];

  const planets: PlanetaryInterpretation[] = planetList
    .map(body => {
      const info = PLANET_INTRO[body];
      const pos = positions.find(p => p.body === body);
      if (!info || !pos) return null;

      const signKey = pos.sign;
      const signText =
        PLANET_IN_SIGN[body]?.[signKey] ||
        PLANET_IN_SIGN[body]?.[toSpanishSign(signKey)] ||
        `${info.title} en el signo de ${toSpanishSign(pos.sign)} canaliza sus energías a través de las cualidades arquetípicas de este elemento.`;

      const houseNum = pos.house || 1;
      const houseInfo = HOUSE_THEMES[houseNum];
      const houseText = houseInfo
        ? `${info.title} en ${houseInfo.title}: ${houseInfo.desc}`
        : `Ubicado en la Casa ${houseNum}, enfoca su dinamismo en esta área concreta de la experiencia vital.`;

      // Find relevant aspects for this planet
      const relevantAspects = (aspects || [])
        .filter(a => a.body1 === body || a.body2 === body)
        .slice(0, 5)
        .map(a => {
          const otherBody = a.body1 === body ? a.body2 : a.body1;
          const pairKey1 = `${body}-${otherBody}`;
          const pairKey2 = `${otherBody}-${body}`;
          const aspectDesc =
            ASPECT_INTERPRETATIONS_MAP[pairKey1] ||
            ASPECT_INTERPRETATIONS_MAP[pairKey2] ||
            `Configuración de ${a.type} entre ${body} y ${otherBody} (orbe: ${a.orb}°), entrelazando sus principios energéticos.`;

          return {
            aspectTitle: `${a.type.toUpperCase()} con ${otherBody} (${a.orb}° orbe)`,
            type: a.type,
            orb: a.orb,
            text: aspectDesc,
          };
        });

      return {
        body,
        title: info.title,
        astronomicalDescription: info.desc,
        sign: toSpanishSign(pos.sign),
        signInterpretation: signText,
        house: houseNum,
        houseInterpretation: houseText,
        aspectInterpretations: relevantAspects,
      };
    })
    .filter(Boolean) as PlanetaryInterpretation[];

  return {
    title: `Carta Astral & Mapa Psicológico de ${profileName}`,
    subtitle: `Sol en ${toSpanishSign(sunSign)} · Luna en ${toSpanishSign(moonSign)} · Ascendente en ${toSpanishSign(ascSign)}`,
    prologue: `El presente mapa natal constituye un plano arquetípico de la psique humana en el instante exacto del nacimiento. Las posiciones planetarias y las doce casas astrológicas según el sistema de Placidus revelan los talentos innatos, los motores vocacionales y las áreas de aprendizaje y evolución consciente de ${profileName}.`,
    ascendant: {
      sign: toSpanishSign(ascSign),
      degreeFormatted: formatDegreeMinute(ascDegree, ascMinute),
      symbol: 'AC',
      concept: 'La Máscara del Alma y la Proyección Vital',
      text: ascText,
    },
    midheaven: {
      sign: toSpanishSign(mcSign),
      degreeFormatted: formatDegreeMinute(mcDegree, mcMinute),
      text: mcText,
    },
    elementalSynthesis: {
      dominantElement,
      elementalSummary: elemSummary,
      dominantModality,
      modalitySummary: modSummary,
    },
    planets,
    epilogue: `La astrología psicológica no predice un destino inexorable, sino que ofrece una brújula de autoconocimiento. Al integrar conscientemente las tensiones y los dones de tu carta, transformas cada desafío en maestría y autorrealización.`,
  };
}
