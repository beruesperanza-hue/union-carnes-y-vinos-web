import Image from 'next/image';

const postres = [
  {
    id: 1,
    nombre: 'Chocotorta',
    porciones: [
      { cantidad: 8, precio: 24 },
      { cantidad: 14, precio: 32 }
    ],
    imagen: '/postres-1.png'
  },
  {
    id: 2,
    nombre: 'Tiramisú',
    porciones: [
      { cantidad: 8, precio: 30 },
      { cantidad: 14, precio: 36 }
    ],
    imagen: '/postres-2.png'
  }
];

export default function Postres() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Título */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tu Postre para Encargar
          </h2>
          <p className="text-lg text-gray-600">
            Postres especiales para celebraciones y cumpleaños
          </p>
        </div>

        {/* Grid de postres */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {postres.map((postre) => (
            <div key={postre.id} className="group">
              {/* Imagen */}
              <div className="relative w-full h-96 md:h-80 overflow-hidden rounded-lg shadow-lg mb-6 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={postre.imagen}
                  alt={postre.nombre}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={85}
                />
              </div>

              {/* Contenido */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {postre.nombre}
                </h3>

                {/* Opciones de porciones */}
                <div className="space-y-3">
                  {postre.porciones.map((opcion, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-700">
                        {opcion.cantidad} porciones
                      </span>
                      <span className="text-xl font-bold text-amber-600">
                        €{opcion.precio}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Botón de WhatsApp */}
                <a
                  href={`https://wa.me/34?text=Hola, me gustaría encargar ${postre.nombre}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>Encargar por WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Nota informativa */}
        <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <p className="text-gray-700">
            <span className="font-semibold">📦 Información importante:</span> Puedes encargar tus postres especiales para cumpleaños y celebraciones.
            Contáctanos con 48 horas de anticipación para asegurar disponibilidad.
            Aceptamos personalizaciones y sabores especiales.
          </p>
        </div>
      </div>
    </section>
  );
}
