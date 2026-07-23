// Carta real de Unión Carnes y Vinos, transcripta de cartaunion2.pdf
// (versión vigente jul-2026). Precios en euros. Los códigos de alérgenos
// siguen la leyenda impresa en la carta física — ver ALERGENOS abajo.

export interface Plato {
  nombre: string;
  nombreEn?: string;
  descripcion?: string;
  descripcionEn?: string;
  precio: string;
  alergenos?: string[];
}

export interface SeccionCarta {
  id: string;
  titulo: string;
  tituloEn: string;
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

export const CARTA_COMIDA: SeccionCarta[] = [
  {
    id: 'empanadas',
    titulo: 'Empanadas',
    tituloEn: 'Empanadas',
    platos: [
      {
        nombre: 'Empanada frita de carne cortada a cuchillo',
        nombreEn: 'Fried empanada, hand-cut beef',
        precio: '3,3 €',
        alergenos: ['b', 'e'],
      },
      {
        nombre: 'Empanada frita de hongos, champiñones, mozzarella y queso azul',
        nombreEn: 'Fried empanada, wild mushroom, mozzarella & blue cheese',
        precio: '3,3 €',
        alergenos: ['a', 'b', 'c'],
      },
      {
        nombre: 'Empanada de cerdo BBQ agridulce con salsa picante',
        nombreEn: 'Sweet & sour BBQ pork empanada, spicy sauce',
        precio: '3,3 €',
        alergenos: ['b'],
      },
    ],
  },
  {
    id: 'platitos',
    titulo: 'Platitos',
    tituloEn: 'Small plates',
    platos: [
      {
        nombre: 'Alcauciles con tacos de jamón y queso parmesano',
        nombreEn: 'Artichokes with ham and parmesan',
        precio: '9 €',
        alergenos: ['c'],
      },
      {
        nombre: 'Berenjenas en escabeche con queso de cabra',
        nombreEn: 'Pickled aubergine with goat cheese',
        precio: '9 €',
        alergenos: ['a', 'c'],
      },
      {
        nombre: 'Buñuelos de acelga con mozzarella y alioli (4 ud.)',
        nombreEn: 'Chard fritters with mozzarella & alioli (4 pcs)',
        precio: '8 €',
        alergenos: ['a', 'b', 'c', 'e'],
      },
      {
        nombre: 'Provoleta con tomate y pesto',
        nombreEn: 'Grilled provolone, tomato & pesto',
        precio: '13 €',
        alergenos: ['a', 'c', 'd'],
      },
      {
        nombre: 'Ñoquis con burrata, albahaca y cherry salteados',
        nombreEn: 'Gnocchi with burrata, basil & sautéed cherry tomato',
        precio: '15 €',
        alergenos: ['a', 'b', 'c', 'd'],
      },
      {
        nombre: 'Chorizo criollo con pan a la chapa y criolla',
        nombreEn: 'Criollo sausage, griddled bread & criolla salsa',
        precio: '8,2 €',
        alergenos: ['b'],
      },
      {
        nombre: 'Mollejas gruesas y limón (200 g)',
        nombreEn: 'Grilled sweetbreads & lemon (200 g)',
        precio: '16 €',
      },
      {
        nombre: 'Bocadillo choripán con tomate, lechuga, cebolla y mayo de chimichurri',
        nombreEn: 'Choripán sandwich, tomato, lettuce, onion & chimichurri mayo',
        precio: '10 €',
        alergenos: ['b', 'c', 'd', 'e'],
      },
    ],
  },
  {
    id: 'entrantes',
    titulo: 'Entrantes o para acompañar las carnes',
    tituloEn: 'Starters & sides',
    platos: [
      {
        nombre: 'Ensalada Unión: tomate, olivas, cebolla, cilantro y pepino',
        nombreEn: 'Unión salad: tomato, olives, onion, cilantro & cucumber',
        precio: '9,5 €',
        alergenos: ['a', 'c'],
      },
      {
        nombre: 'Cogollos a la plancha, sweet chili, cebolla frita y cacahuetes',
        nombreEn: 'Grilled lettuce hearts, sweet chili, fried onion & peanuts',
        precio: '6,5 €',
        alergenos: ['a', 'b', 'c', 'd', 'j'],
      },
      {
        nombre: 'Ensalada de rúcula, cheddar curado, cherry y palta',
        nombreEn: 'Arugula salad, aged cheddar, cherry tomato & avocado',
        precio: '9,5 €',
        alergenos: ['a', 'c'],
      },
    ],
  },
  {
    id: 'carnes',
    titulo: 'Carnes',
    tituloEn: 'Grill',
    platos: [
      {
        nombre: 'Milanesa vacuna napolitana, tomate, jamón york y mozzarella',
        nombreEn: 'Beef milanesa napolitana, tomato, ham & mozzarella',
        descripcion: 'Con papas fritas',
        descripcionEn: 'Served with fries',
        precio: '23 €',
        alergenos: ['b', 'c', 'e'],
      },
      {
        nombre: 'Vacío vacuno del fino (Thin Flank, 300 g)',
        nombreEn: 'Flank steak (300 g)',
        descripcion: 'Con papas fritas',
        descripcionEn: 'Served with fries',
        precio: '23 €',
      },
      {
        nombre: 'Entraña vacuna vuelta y vuelta (Skirt steak, 300 g)',
        nombreEn: 'Skirt steak, seared both sides (300 g)',
        descripcion: 'Con papas fritas · nuestro plato estrella',
        descripcionEn: 'Served with fries · our signature cut',
        precio: '23 €',
      },
      {
        nombre: 'Bife de chorizo — Lomo bajo (Striploin, 400 g)',
        nombreEn: 'Striploin steak (400 g)',
        descripcion: 'Con papas fritas',
        descripcionEn: 'Served with fries',
        precio: '27 €',
      },
    ],
  },
  {
    id: 'postres',
    titulo: 'Postres',
    tituloEn: 'Desserts',
    platos: [
      {
        nombre: 'Panqueque con dulce de leche',
        nombreEn: 'Crepe with dulce de leche',
        precio: '6 €',
        alergenos: ['a', 'b', 'c', 'e'],
      },
      {
        nombre: 'Chocotorta',
        nombreEn: 'Chocotorta',
        precio: '6 €',
        alergenos: ['a', 'b', 'c'],
      },
      {
        nombre: 'El tiramisú de mamá',
        nombreEn: "Mom's tiramisu",
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
  origen: 'Argentina' | 'España';
  vinos: { nombre: string; precio: string }[];
}

export const VINOS: VinoSeccion[] = [
  {
    id: 'tintos-ar',
    titulo: 'Tintos argentinos',
    tituloEn: 'Argentine reds',
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
    origen: 'Argentina',
    vinos: [{ nombre: 'Saurus Pinot Noir (Patagonia)', precio: '23 €' }],
  },
  {
    id: 'blancos-ar',
    titulo: 'Blancos argentinos',
    tituloEn: 'Argentine whites',
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
    origen: 'España',
    vinos: [{ nombre: 'Care Rosado Solidarity 2024', precio: '3 / 20 €' }],
  },
  {
    id: 'blancos-es',
    titulo: 'Blancos',
    tituloEn: 'Whites',
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
