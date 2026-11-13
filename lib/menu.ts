// Carta real de Unión Carnes y Vinos, transcripta de CARTANOV.pdf
// (versión vigente nov-2026). Precios en euros. Los códigos de alérgenos
// siguen la leyenda impresa en la carta física — ver ALERGENOS abajo.
// Traducciones: ES (base), EN, IT, FR, DE — usadas por /carta, /en/carta,
// /it/carta, /fr/carta y /de/carta.

export interface Plato {
  nombre: string;
  nombreEn?: string;
  nombreIt?: string;
  nombreFr?: string;
  nombreDe?: string;
  descripcion?: string;
  descripcionEn?: string;
  descripcionIt?: string;
  descripcionFr?: string;
  descripcionDe?: string;
  precio: string;
  alergenos?: string[];
}

export interface SeccionCarta {
  id: string;
  titulo: string;
  tituloEn: string;
  tituloIt: string;
  tituloFr: string;
  tituloDe: string;
  platos: Plato[];
}

export const ALERGENOS: Record<string, string> = {
  a: 'vegetariano',
  b: 'gluten',
  c: 'lácteos',
  d: 'frutos secos',
  e: 'huevos',
  f: 'cereales con gluten',
  g: 'frutos de cáscara',
  h: 'crustáceos',
  i: 'apio',
  j: 'mostaza',
  k: 'pescado',
  l: 'granos de sésamo',
  m: 'cacahuetes',
  n: 'sulfitos',
};

export const ALERGENOS_EN: Record<string, string> = {
  a: 'vegetarian',
  b: 'gluten',
  c: 'dairy',
  d: 'nuts',
  e: 'eggs',
  j: 'mustard',
};

export const ALERGENOS_IT: Record<string, string> = {
  a: 'vegetariano',
  b: 'glutine',
  c: 'latticini',
  d: 'frutta a guscio',
  e: 'uova',
  j: 'senape',
};

export const ALERGENOS_FR: Record<string, string> = {
  a: 'végétarien',
  b: 'gluten',
  c: 'produits laitiers',
  d: 'fruits à coque',
  e: 'œufs',
  j: 'moutarde',
};

export const ALERGENOS_DE: Record<string, string> = {
  a: 'vegetarisch',
  b: 'gluten',
  c: 'milchprodukte',
  d: 'nüsse',
  e: 'eier',
  j: 'senf',
};

export const CARTA_COMIDA: SeccionCarta[] = [
  {
    id: 'empanadas',
    titulo: 'Empanadas',
    tituloEn: 'Empanadas',
    tituloIt: 'Empanadas',
    tituloFr: 'Empanadas',
    tituloDe: 'Empanadas',
    platos: [
      {
        nombre: 'Empanada frita de carne cortada a cuchillo',
        nombreEn: 'Fried empanada, hand-cut beef',
        nombreIt: 'Empanada fritta di manzo tagliato al coltello',
        nombreFr: 'Empanada frite au bœuf coupé au couteau',
        nombreDe: 'Frittierte Empanada mit handgeschnittenem Rindfleisch',
        precio: '3,4 €',
        alergenos: ['b', 'e'],
      },
      {
        nombre: 'Empanada frita de hongos, champiñones, mozzarella y queso azul',
        nombreEn: 'Fried empanada, wild mushroom, mozzarella & blue cheese',
        nombreIt: 'Empanada fritta ai funghi, champignon, mozzarella e gorgonzola',
        nombreFr: 'Empanada frite aux champignons, mozzarella et bleu',
        nombreDe: 'Frittierte Empanada mit Waldpilzen, Mozzarella und Blauschimmelkäse',
        precio: '3,4 €',
        alergenos: ['a', 'b', 'c'],
      },
      {
        nombre: 'Empanada de cerdo BBQ agridulce con salsa picante',
        nombreEn: 'Sweet & sour BBQ pork empanada, spicy sauce',
        nombreIt: 'Empanada di maiale BBQ agrodolce con salsa piccante',
        nombreFr: 'Empanada de porc BBQ aigre-douce, sauce épicée',
        nombreDe: 'Süß-saure BBQ-Schweinefleisch-Empanada mit scharfer Soße',
        precio: '3,4 €',
        alergenos: ['b'],
      },
    ],
  },
  {
    id: 'platitos',
    titulo: 'Platitos',
    tituloEn: 'Small plates',
    tituloIt: 'Piccoli piatti',
    tituloFr: 'Petites assiettes',
    tituloDe: 'Kleine Gerichte',
    platos: [
      {
        nombre: 'Buñuelos de acelga con mozzarella y alioli (4 ud.)',
        nombreEn: 'Chard fritters with mozzarella & alioli (4 pcs)',
        nombreIt: 'Frittelle di bietola con mozzarella e aioli (4 pz)',
        nombreFr: 'Beignets de blette, mozzarella et aïoli (4 pièces)',
        nombreDe: 'Mangold-Bällchen mit Mozzarella und Aioli (4 Stk.)',
        precio: '9 €',
        alergenos: ['a', 'b', 'c', 'e'],
      },
      {
        nombre: 'Berenjenas parmesana',
        nombreEn: 'Aubergine parmesana',
        nombreIt: 'Melanzane alla parmigiana',
        nombreFr: 'Aubergines à la parmesane',
        nombreDe: 'Auberginen Parmigiana',
        precio: '12 €',
        alergenos: ['a', 'c'],
      },
      {
        nombre: 'Provoleta con tomates secos y pesto',
        nombreEn: 'Grilled provolone, sun-dried tomatoes & pesto',
        nombreIt: 'Provoleta grigliata con pomodori secchi e pesto',
        nombreFr: 'Provoleta grillée, tomates séchées et pesto',
        nombreDe: 'Gegrillter Provolone mit getrockneten Tomaten und Pesto',
        precio: '14 €',
        alergenos: ['a', 'c', 'd'],
      },
      {
        nombre: 'Ñoquis con pesto, parmesano y cherry al horno',
        nombreEn: 'Gnocchi with pesto, parmesan & oven-roasted cherry tomatoes',
        nombreIt: 'Gnocchi con pesto, parmigiano e pomodorini al forno',
        nombreFr: 'Gnocchis au pesto, parmesan et tomates cerises rôties',
        nombreDe: 'Gnocchi mit Pesto, Parmesan und im Ofen gebackenen Kirschtomaten',
        precio: '15 €',
        alergenos: ['a', 'b', 'c', 'd'],
      },
      {
        nombre: 'Chorizo criollo con pan a la chapa y criolla',
        nombreEn: 'Criollo sausage, griddled bread & criolla salsa',
        nombreIt: 'Chorizo criollo con pane alla piastra e salsa criolla',
        nombreFr: 'Chorizo criollo, pain grillé et sauce criolla',
        nombreDe: 'Chorizo criollo mit geröstetem Brot und Criolla-Sauce',
        precio: '8,2 €',
        alergenos: ['b'],
      },
      {
        nombre: 'Huevo con morcilla vasca (dulce) y pimientos de piquillo',
        nombreEn: 'Egg with sweet Basque blood sausage & piquillo peppers',
        nombreIt: 'Uovo con sanguinaccio basco (dolce) e peperoni del piquillo',
        nombreFr: 'Œuf au boudin noir basque (doux) et poivrons del piquillo',
        nombreDe: 'Ei mit süßer baskischer Blutwurst und Piquillo-Paprika',
        precio: '10 €',
      },
      {
        nombre: 'Costilla madurada "Banderita" con chimi y criolla',
        nombreEn: "Aged short rib 'Banderita', chimichurri & criolla salsa",
        nombreIt: "Costine di manzo frollate 'Banderita' con chimichurri e salsa criolla",
        nombreFr: "Côtes de bœuf maturées 'Banderita', chimichurri et sauce criolla",
        nombreDe: "Gereiftes Rippenstück 'Banderita' mit Chimichurri und Criolla-Sauce",
        precio: '15 €',
      },
      {
        nombre: 'Mollejas de corazón y limón (200 g)',
        nombreEn: 'Grilled heart sweetbreads & lemon (200 g)',
        nombreIt: 'Animelle di cuore grigliate al limone (200 g)',
        nombreFr: 'Ris de cœur grillés au citron (200 g)',
        nombreDe: 'Gegrilltes Herzbries mit Zitrone (200 g)',
        precio: '17 €',
      },
    ],
  },
  {
    id: 'entrantes',
    titulo: 'Entrantes o para acompañar las carnes',
    tituloEn: 'Starters & sides',
    tituloIt: 'Antipasti e contorni',
    tituloFr: 'Entrées et accompagnements',
    tituloDe: 'Vorspeisen & Beilagen',
    platos: [
      {
        nombre: 'Ensalada Unión: tomate, olivas, cebolla, cilantro y pepino',
        nombreEn: 'Unión salad: tomato, olives, onion, cilantro & cucumber',
        nombreIt: 'Insalata Unión: pomodoro, olive, cipolla, coriandolo e cetriolo',
        nombreFr: 'Salade Unión : tomate, olives, oignon, coriandre et concombre',
        nombreDe: 'Unión-Salat: Tomate, Oliven, Zwiebel, Koriander und Gurke',
        precio: '9,5 €',
        alergenos: ['a', 'c'],
      },
      {
        nombre: 'Cogollos de lechuga a la plancha con parmesano y vinagreta de anchoas',
        nombreEn: 'Grilled lettuce hearts with parmesan & anchovy vinaigrette',
        nombreIt: 'Cuori di lattuga grigliati con parmigiano e vinaigrette di acciughe',
        nombreFr: 'Cœurs de laitue grillés, parmesan et vinaigrette aux anchois',
        nombreDe: 'Gegrillte Salatherzen mit Parmesan und Sardellen-Vinaigrette',
        precio: '6,5 €',
        alergenos: ['a', 'b', 'c', 'd', 'j'],
      },
      {
        nombre: 'Ensalada de rúcula, cheddar curado, cherry y aguacate',
        nombreEn: 'Arugula salad, aged cheddar, cherry tomato & avocado',
        nombreIt: 'Insalata di rucola, cheddar stagionato, pomodorini e avocado',
        nombreFr: 'Salade de roquette, cheddar affiné, tomates cerises et avocat',
        nombreDe: 'Rucolasalat mit gereiftem Cheddar, Kirschtomaten und Avocado',
        precio: '9,5 €',
        alergenos: ['a', 'c'],
      },
    ],
  },
  {
    id: 'carnes',
    titulo: 'Carnes',
    tituloEn: 'Grill',
    tituloIt: 'Alla griglia',
    tituloFr: 'Grillades',
    tituloDe: 'Vom Grill',
    platos: [
      {
        nombre: 'Milanesa vacuna napolitana, tomate, jamón york y mozzarella',
        nombreEn: 'Beef milanesa napolitana, tomato, ham & mozzarella',
        nombreIt: 'Milanesa di manzo alla napoletana, pomodoro, prosciutto cotto e mozzarella',
        nombreFr: 'Milanesa de bœuf napolitaine, tomate, jambon et mozzarella',
        nombreDe: 'Rinder-Milanesa napolitana mit Tomate, gekochtem Schinken und Mozzarella',
        descripcion: 'Con papas fritas',
        descripcionEn: 'Served with fries',
        descripcionIt: 'Con patatine fritte',
        descripcionFr: 'Servie avec frites',
        descripcionDe: 'Mit Pommes frites',
        precio: '23 €',
        alergenos: ['b', 'c', 'e'],
      },
      {
        nombre: 'Vacío vacuno del fino (Thin Flank, 300 g)',
        nombreEn: 'Flank steak (300 g)',
        nombreIt: 'Vacío di manzo (Flank Steak, 300 g)',
        nombreFr: 'Bavette de bœuf (300 g)',
        nombreDe: 'Vacío-Rindersteak (Flank Steak, 300 g)',
        descripcion: 'Con papas fritas',
        descripcionEn: 'Served with fries',
        descripcionIt: 'Con patatine fritte',
        descripcionFr: 'Servie avec frites',
        descripcionDe: 'Mit Pommes frites',
        precio: '23 €',
      },
      {
        nombre: 'Entraña vacuna vuelta y vuelta (Skirt steak, 300 g)',
        nombreEn: 'Skirt steak, seared both sides (300 g)',
        nombreIt: 'Entraña di manzo scottata su entrambi i lati (Skirt Steak, 300 g)',
        nombreFr: 'Entraña de bœuf saisie des deux côtés (Skirt Steak, 300 g)',
        nombreDe: 'Entraña-Rindersteak, beidseitig scharf gebraten (Skirt Steak, 300 g)',
        descripcion: 'Con papas fritas · nuestro plato estrella',
        descripcionEn: 'Served with fries · our signature cut',
        descripcionIt: 'Con patatine fritte · il nostro piatto forte',
        descripcionFr: 'Servie avec frites · notre plat signature',
        descripcionDe: 'Mit Pommes frites · unser Signature-Gericht',
        precio: '24 €',
      },
      {
        nombre: 'Picaña vacuna (Top sirloin cap, 300 g)',
        nombreEn: 'Picanha — top sirloin cap (300 g)',
        nombreIt: 'Picanha di manzo (Top Sirloin Cap, 300 g)',
        nombreFr: 'Picanha de bœuf (Top Sirloin Cap, 300 g)',
        nombreDe: 'Picanha-Rindersteak (Top Sirloin Cap, 300 g)',
        descripcion: 'Con papas fritas',
        descripcionEn: 'Served with fries',
        descripcionIt: 'Con patatine fritte',
        descripcionFr: 'Servie avec frites',
        descripcionDe: 'Mit Pommes frites',
        precio: '25 €',
      },
      {
        nombre: 'Bife de chorizo con hueso — Lomo bajo (Low loin, 500 g)',
        nombreEn: 'Bone-in sirloin steak (500 g)',
        nombreIt: 'Bife de chorizo con osso — Lombata (Low Loin, 500 g)',
        nombreFr: 'Bife de chorizo avec os — Faux-filet (Low Loin, 500 g)',
        nombreDe: 'Bife de chorizo mit Knochen — Lendenstück (Low Loin, 500 g)',
        descripcion: 'Con papas fritas',
        descripcionEn: 'Served with fries',
        descripcionIt: 'Con patatine fritte',
        descripcionFr: 'Servi avec frites',
        descripcionDe: 'Mit Pommes frites',
        precio: '28 €',
      },
    ],
  },
  {
    id: 'postres',
    titulo: 'Postres',
    tituloEn: 'Desserts',
    tituloIt: 'Dolci',
    tituloFr: 'Desserts',
    tituloDe: 'Desserts',
    platos: [
      {
        nombre: 'Chocotorta',
        nombreEn: 'Chocotorta',
        nombreIt: 'Chocotorta',
        nombreFr: 'Chocotorta',
        nombreDe: 'Chocotorta',
        precio: '6 €',
        alergenos: ['a', 'b', 'c'],
      },
      {
        nombre: 'El tiramisú de mamá',
        nombreEn: "Mom's tiramisu",
        nombreIt: 'Il tiramisù della mamma',
        nombreFr: 'Le tiramisu de maman',
        nombreDe: 'Mamas Tiramisu',
        precio: '7 €',
        alergenos: ['a', 'b', 'c', 'e'],
      },
      {
        nombre: 'El tiramisú "correcto" con 2 copas de cava',
        nombreEn: "The 'proper' tiramisu with 2 glasses of cava",
        nombreIt: "Il tiramisù 'giusto' con 2 calici di cava",
        nombreFr: "Le tiramisu « correct » avec 2 coupes de cava",
        nombreDe: "Das „richtige“ Tiramisu mit 2 Gläsern Cava",
        precio: '14 €',
        alergenos: ['a', 'b', 'c', 'e'],
      },
    ],
  },
];

export interface Vino {
  nombre: string;
  /** Un número = botella. "4 / 25 €" = copa 4 € / botella 25 €. */
  precio: string;
  uva?: string;
  region?: string;
}

export interface VinoSeccion {
  id: string;
  titulo: string;
  tituloEn: string;
  tituloIt: string;
  tituloFr: string;
  tituloDe: string;
  origen: 'Argentina' | 'España';
  vinos: Vino[];
}

export const VINOS: VinoSeccion[] = [
  {
    id: 'tintos-ar',
    titulo: 'Tintos argentinos',
    tituloEn: 'Argentine reds',
    tituloIt: 'Rossi argentini',
    tituloFr: 'Rouges argentins',
    tituloDe: 'Argentinische Rotweine',
    origen: 'Argentina',
    vinos: [
      { nombre: 'Saurus Malbec (Patagonia)', precio: '24 €', uva: 'Malbec', region: 'Patagonia' },
      { nombre: 'Gieco Malbec Single Vineyard (Mendoza)', precio: '4 / 25 €', uva: 'Malbec', region: 'Mendoza' },
      { nombre: 'Furlan Malbec Crianza (Mendoza)', precio: '26 €', uva: 'Malbec', region: 'Mendoza' },
      { nombre: 'Amalaya Malbec (Salta)', precio: '27 €', uva: 'Malbec', region: 'Salta' },
      { nombre: 'Saurus Select Pinot Noir (Patagonia)', precio: '29 €', uva: 'Pinot Noir', region: 'Patagonia' },
      { nombre: 'Domaine Bousquet Premium Malbec (Mendoza)', precio: '30 €', uva: 'Malbec', region: 'Mendoza' },
      { nombre: 'Furlan Cabernet Sauvignon Reserva (Mendoza)', precio: '30 €', uva: 'Cabernet Sauvignon', region: 'Mendoza' },
      { nombre: 'Gieco Cabernet Franc (Mendoza)', precio: '30 €', uva: 'Cabernet Franc', region: 'Mendoza' },
      { nombre: 'Salvaje Orgánico (Malbec)', precio: '34 €', uva: 'Malbec' },
    ],
  },
  {
    id: 'rosado-ar',
    titulo: 'Rosado argentino',
    tituloEn: 'Argentine rosé',
    tituloIt: 'Rosé argentino',
    tituloFr: 'Rosé argentin',
    tituloDe: 'Argentinischer Rosé',
    origen: 'Argentina',
    vinos: [{ nombre: 'Saurus Pinot Noir (Patagonia)', precio: '24 €', uva: 'Pinot Noir', region: 'Patagonia' }],
  },
  {
    id: 'blancos-ar',
    titulo: 'Blancos argentinos',
    tituloEn: 'Argentine whites',
    tituloIt: 'Bianchi argentini',
    tituloFr: 'Blancs argentins',
    tituloDe: 'Argentinische Weißweine',
    origen: 'Argentina',
    vinos: [
      { nombre: 'Furlan Torrontés-Semillón (Mendoza)', precio: '4 / 24 €', uva: 'Torrontés y Semillón', region: 'Mendoza' },
      { nombre: 'Saurus Chardonnay (Patagonia)', precio: '4 / 24 €', uva: 'Chardonnay', region: 'Patagonia' },
    ],
  },
  {
    id: 'tintos-es',
    titulo: 'Tintos españoles',
    tituloEn: 'Spanish reds',
    tituloIt: 'Rossi spagnoli',
    tituloFr: 'Rouges espagnols',
    tituloDe: 'Spanische Rotweine',
    origen: 'España',
    vinos: [
      { nombre: 'Balandro (Ribera del Duero)', precio: '23 €' },
      { nombre: 'Rioja Vega Crianza Tempranillo (Rioja)', precio: '24 €' },
    ],
  },
  {
    id: 'rosado-es',
    titulo: 'Rosado',
    tituloEn: 'Rosé',
    tituloIt: 'Rosé',
    tituloFr: 'Rosé',
    tituloDe: 'Rosé',
    origen: 'España',
    vinos: [{ nombre: 'Care Rosado Solidarity 2024', precio: '20 €' }],
  },
  {
    id: 'blancos-es',
    titulo: 'Blancos',
    tituloEn: 'Whites',
    tituloIt: 'Bianchi',
    tituloFr: 'Blancs',
    tituloDe: 'Weißweine',
    origen: 'España',
    vinos: [
      { nombre: 'Care, Garnacha y Chardonnay', precio: '22 €' },
      { nombre: 'Palacio de Bornos, Verdejo', precio: '4 / 23 €' },
      { nombre: 'Mytilus, Albariño (Rías Baixas)', precio: '22 €' },
    ],
  },
];

export interface ItemBebida {
  nombre: string;
  precio: string;
}

export const CERVEZAS: ItemBebida[] = [
  { nombre: 'Caña Turia Stark', precio: '2,3 €' },
  { nombre: 'Doble Turia Stark', precio: '3,2 €' },
  { nombre: 'Tanque Turia Stark', precio: '4,2 €' },
  { nombre: 'Turia Tostada', precio: '3,2 €' },
  { nombre: 'Turia 0,0%', precio: '3,2 €' },
  { nombre: 'Alhambra Reserva', precio: '3,4 €' },
  { nombre: 'Cerveza sin gluten', precio: '3,2 €' },
];

export const REFRESCOS_CAFE: ItemBebida[] = [
  { nombre: 'Refrescos', precio: '2,6 €' },
  { nombre: 'Agua', precio: '2,6 €' },
  { nombre: 'Agua con gas', precio: '2,9 €' },
  { nombre: 'Agua 1 L', precio: '5 €' },
  { nombre: 'Café illy', precio: '2 €' },
  { nombre: 'Carajillo', precio: '3 €' },
  { nombre: 'Bombón', precio: '2,5 €' },
  { nombre: 'Café con leche', precio: '2,5 €' },
];

export const COCTELES: ItemBebida[] = [
  { nombre: 'Fernet Branca argentino con Coca-Cola', precio: '10 €' },
  { nombre: 'Gin Tonic (Seagrams o Beefeater)', precio: '9 €' },
  { nombre: 'Aperol Spritz (Aperol, cava y soda)', precio: '9 €' },
  { nombre: 'Campari Orange (Campari y zumo de naranja)', precio: '8 €' },
  { nombre: 'Negroni (Campari, gin y vermut + rodaja de naranja)', precio: '10 €' },
  { nombre: 'Negroni Sbagliato (Campari, cava y vermut)', precio: '11 €' },
  { nombre: 'Agua de Valencia by Café de las Horas', precio: '10 €' },
  { nombre: 'Vermut (rodaja de limón y aceituna)', precio: '4 €' },
  { nombre: 'Tinto de verano (vino, limón y refresco de limón)', precio: '4,5 €' },
  { nombre: 'Whisky (Cutty, J&B, Ballantine\'s, Red)', precio: '8 €' },
  { nombre: 'Johnnie Walker Black Label · Jack Daniel\'s', precio: '10 €' },
];
