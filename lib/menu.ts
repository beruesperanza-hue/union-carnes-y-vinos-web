// Carta real de Unión Carnes y Vinos, transcripta de cartaunion2.pdf
// (versión vigente jul-2026). Precios en euros. Los códigos de alérgenos
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
        precio: '3,3 €',
        alergenos: ['b', 'e'],
      },
      {
        nombre: 'Empanada frita de hongos, champiñones, mozzarella y queso azul',
        nombreEn: 'Fried empanada, wild mushroom, mozzarella & blue cheese',
        nombreIt: 'Empanada fritta ai funghi, champignon, mozzarella e gorgonzola',
        nombreFr: 'Empanada frite aux champignons, mozzarella et bleu',
        nombreDe: 'Frittierte Empanada mit Waldpilzen, Mozzarella und Blauschimmelkäse',
        precio: '3,3 €',
        alergenos: ['a', 'b', 'c'],
      },
      {
        nombre: 'Empanada de cerdo BBQ agridulce con salsa picante',
        nombreEn: 'Sweet & sour BBQ pork empanada, spicy sauce',
        nombreIt: 'Empanada di maiale BBQ agrodolce con salsa piccante',
        nombreFr: 'Empanada de porc BBQ aigre-douce, sauce épicée',
        nombreDe: 'Süß-saure BBQ-Schweinefleisch-Empanada mit scharfer Soße',
        precio: '3,3 €',
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
        nombre: 'Alcauciles con tacos de jamón y queso parmesano',
        nombreEn: 'Artichokes with ham and parmesan',
        nombreIt: 'Carciofi con dadini di prosciutto e parmigiano',
        nombreFr: 'Artichauts, dés de jambon et parmesan',
        nombreDe: 'Artischocken mit Schinkenwürfeln und Parmesan',
        precio: '9 €',
        alergenos: ['c'],
      },
      {
        nombre: 'Berenjenas en escabeche con queso de cabra',
        nombreEn: 'Pickled aubergine with goat cheese',
        nombreIt: 'Melanzane marinate con formaggio di capra',
        nombreFr: 'Aubergines marinées, fromage de chèvre',
        nombreDe: 'Eingelegte Auberginen mit Ziegenkäse',
        precio: '9 €',
        alergenos: ['a', 'c'],
      },
      {
        nombre: 'Buñuelos de acelga con mozzarella y alioli (4 ud.)',
        nombreEn: 'Chard fritters with mozzarella & alioli (4 pcs)',
        nombreIt: 'Frittelle di bietola con mozzarella e aioli (4 pz)',
        nombreFr: 'Beignets de blette, mozzarella et aïoli (4 pièces)',
        nombreDe: 'Mangold-Bällchen mit Mozzarella und Aioli (4 Stk.)',
        precio: '8 €',
        alergenos: ['a', 'b', 'c', 'e'],
      },
      {
        nombre: 'Provoleta con tomate y pesto',
        nombreEn: 'Grilled provolone, tomato & pesto',
        nombreIt: 'Provoleta grigliata con pomodoro e pesto',
        nombreFr: 'Provoleta grillée, tomate et pesto',
        nombreDe: 'Gegrillter Provolone mit Tomate und Pesto',
        precio: '13 €',
        alergenos: ['a', 'c', 'd'],
      },
      {
        nombre: 'Ñoquis con burrata, albahaca y cherry salteados',
        nombreEn: 'Gnocchi with burrata, basil & sautéed cherry tomato',
        nombreIt: 'Gnocchi con burrata, basilico e pomodorini saltati',
        nombreFr: 'Gnocchis, burrata, basilic et tomates cerises sautées',
        nombreDe: 'Gnocchi mit Burrata, Basilikum und gebratenen Kirschtomaten',
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
        nombre: 'Mollejas gruesas y limón (200 g)',
        nombreEn: 'Grilled sweetbreads & lemon (200 g)',
        nombreIt: 'Animelle grigliate al limone (200 g)',
        nombreFr: 'Ris de veau grillés au citron (200 g)',
        nombreDe: 'Gegrilltes Kalbsbries mit Zitrone (200 g)',
        precio: '16 €',
      },
      {
        nombre: 'Bocadillo choripán con tomate, lechuga, cebolla y mayo de chimichurri',
        nombreEn: 'Choripán sandwich, tomato, lettuce, onion & chimichurri mayo',
        nombreIt: 'Panino choripán con pomodoro, lattuga, cipolla e maionese al chimichurri',
        nombreFr: 'Sandwich choripán, tomate, laitue, oignon et mayonnaise au chimichurri',
        nombreDe: 'Choripán-Sandwich mit Tomate, Salat, Zwiebel und Chimichurri-Mayo',
        precio: '10 €',
        alergenos: ['b', 'c', 'd', 'e'],
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
        nombre: 'Cogollos a la plancha, sweet chili, cebolla frita y cacahuetes',
        nombreEn: 'Grilled lettuce hearts, sweet chili, fried onion & peanuts',
        nombreIt: 'Cuori di lattuga grigliati, sweet chili, cipolla fritta e arachidi',
        nombreFr: 'Cœurs de laitue grillés, sauce sweet chili, oignons frits et cacahuètes',
        nombreDe: 'Gegrillte Salatherzen mit Sweet-Chili, Röstzwiebeln und Erdnüssen',
        precio: '6,5 €',
        alergenos: ['a', 'b', 'c', 'd', 'j'],
      },
      {
        nombre: 'Ensalada de rúcula, cheddar curado, cherry y palta',
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
        precio: '23 €',
      },
      {
        nombre: 'Bife de chorizo — Lomo bajo (Striploin, 400 g)',
        nombreEn: 'Striploin steak (400 g)',
        nombreIt: 'Bife de chorizo — Controfiletto (Striploin, 400 g)',
        nombreFr: 'Bife de chorizo — Faux-filet (Striploin, 400 g)',
        nombreDe: 'Bife de chorizo — Roastbeef (Striploin, 400 g)',
        descripcion: 'Con papas fritas',
        descripcionEn: 'Served with fries',
        descripcionIt: 'Con patatine fritte',
        descripcionFr: 'Servi avec frites',
        descripcionDe: 'Mit Pommes frites',
        precio: '27 €',
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
        nombre: 'Panqueque con dulce de leche',
        nombreEn: 'Crepe with dulce de leche',
        nombreIt: 'Crêpe con dulce de leche',
        nombreFr: 'Crêpe au dulce de leche',
        nombreDe: 'Pfannkuchen mit Dulce de Leche',
        precio: '6 €',
        alergenos: ['a', 'b', 'c', 'e'],
      },
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
    ],
  },
];

export interface VinoSeccion {
  id: string;
  titulo: string;
  tituloEn: string;
  tituloIt: string;
  tituloFr: string;
  tituloDe: string;
  origen: 'Argentina' | 'España';
  vinos: { nombre: string; precio: string }[];
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
      { nombre: 'Amalaya Malbec (Salta)', precio: '24 €' },
      { nombre: 'Saurus Malbec (Patagonia)', precio: '4 / 23 €' },
      { nombre: 'Domaine Bousquet Premium Malbec (Mendoza)', precio: '28 €' },
      { nombre: 'Verum Tinto Pinot Noir (Patagonia)', precio: '23 €' },
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
    vinos: [{ nombre: 'Saurus Pinot Noir (Patagonia)', precio: '23 €' }],
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
      { nombre: 'La Puerta Torrontés (Salta)', precio: '22 €' },
      { nombre: 'Saurus Chardonnay (Patagonia)', precio: '3,5 / 22 €' },
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
      { nombre: 'Balandro (Ribera del Duero)', precio: '22 €' },
      { nombre: 'Senda Tinto 2022, Garnacha (La Mancha)', precio: '21 €' },
      { nombre: 'Rioja Vega Crianza Tempranillo (Rioja)', precio: '4 / 24 €' },
      { nombre: 'Hontza Tinto Selección 2020, 75% Tempranillo / 25% Garnacha (Rioja)', precio: '28 €' },
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
    vinos: [{ nombre: 'Care Rosado Solidarity 2024', precio: '3 / 20 €' }],
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
      { nombre: 'Flor de Ahillas (Valencia)', precio: '20 €' },
      { nombre: 'Palacio de Bornos, Verdejo (Valencia)', precio: '3,5 / 21 €' },
      { nombre: 'Mytilus, Albariño (Rías Baixas)', precio: '22 €' },
      { nombre: 'Care Blend, Garnacha y Chardonnay', precio: '3 / 18 €' },
      { nombre: 'La Cerrada Blanco, Godello', precio: '24 €' },
    ],
  },
];

export const COCTELES = [
  { nombre: 'Fernet Branca argentino con Coca-Cola', precio: '10 €' },
  { nombre: 'Gin Tonic (Seagrams o Beefeater)', precio: '9 €' },
  { nombre: 'Aperol Spritz (Aperol, cava y soda)', precio: '9 €' },
  { nombre: 'Campari Orange (Campari y zumo de naranja)', precio: '8 €' },
  { nombre: 'Negroni (Campari, gin y vermut)', precio: '10 €' },
  { nombre: 'Negroni Sbagliato (Campari, cava y vermut)', precio: '11 €' },
  { nombre: 'Old Fashioned (bourbon, azúcar, angostura, twist de naranja)', precio: '12 €' },
  { nombre: 'Agua de Valencia by Café de las Horas', precio: '10 €' },
  { nombre: 'Bloody Mary (con o sin alcohol)', precio: '7 / 9 €' },
  { nombre: 'Vermut (rodaja de naranja y aceituna)', precio: '4 €' },
  { nombre: 'Tinto de verano', precio: '4,5 €' },
];
