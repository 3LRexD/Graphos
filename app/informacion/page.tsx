// app/informacion/page.tsx
import Link from 'next/link';

export default function Informacion() {
  return (
    <main className="info-container">
      <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', fontSize: '2.5rem', fontWeight: 300 }}>Fundamentos de Grafos</h2>
      <p style={{ textAlign: 'center', marginBottom: '3rem', color: '#888', fontWeight: 300 }}>
        Aprende los conceptos básicos antes de pasar a la práctica visual.
      </p>

      {/* Grid de Tarjetas de Teoría */}
      <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div className="card">
          <h3>¿Qué es un grafo?</h3>
          <p>Un grafo es una estructura de datos matemática abstracta utilizada para modelar relaciones entre objetos. A diferencia de los arreglos o las listas enlazadas que son lineales, los grafos son estructuras no lineales que permiten representar redes complejas de la vida real.</p>
        </div>
        
        <div className="card">
          <h3>Componentes Principales</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--accent-color)' }}>Vértices (Nodos):</strong> Son las entidades fundamentales u objetos, como ciudades en un mapa, personas en una red, o computadoras en Internet.</li>
            <li><strong style={{ color: 'var(--accent-color)' }}>Aristas (Edges):</strong> Son las líneas o enlaces que conectan dos nodos, representando la relación, el costo o el camino entre ellos.</li>
          </ul>
        </div>

        {/* Nueva sección: Fundamentos y Aplicaciones */}
        <div className="card">
          <h3>Fundamentos y Aplicaciones</h3>
          <p style={{ marginBottom: '1rem' }}>Los grafos son la base de muchas tecnologías que usamos a diario. Sus aplicaciones principales incluyen:</p>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li><strong>Redes Sociales:</strong> Algoritmos de recomendación de amigos (Facebook, LinkedIn).</li>
            <li><strong>Navegación GPS:</strong> Cálculo de la ruta más corta o rápida (Google Maps, Waze).</li>
            <li><strong>Internet:</strong> Enrutamiento de paquetes de datos entre servidores.</li>
            <li><strong>Logística:</strong> Optimización de flujos de transporte y cadenas de suministro.</li>
          </ul>
        </div>
      </div>

      {/* Sección del Video Explicativo */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Aprende más: Introducción a la Teoría de Grafos</h3>
        <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Un recurso audiovisual para reforzar los conceptos matemáticos y computacionales.</p>
        
        {/* Contenedor responsivo para el iframe de YouTube */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            /* Puedes cambiar el link de "src" por el ID de cualquier otro video de YouTube */
            src="https://www.youtube.com/embed/F5Xjpg0-NhM"
            title="Video explicativo de grafos" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        </div>
      </div>

      {/* Sección de Referencias Bibliográficas */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Referencias Bibliográficas</h3>
        <ul style={{ listStyleType: 'circle', paddingLeft: '1.5rem', color: '#AAA' }}>
          <li style={{ marginBottom: '0.5rem' }}>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). <em>Introduction to Algorithms</em> (3rd ed.). MIT Press.</li>
          <li style={{ marginBottom: '0.5rem' }}>Sedgewick, R., & Wayne, K. (2011). <em>Algorithms</em> (4th ed.). Addison-Wesley Professional.</li>
          <li>Apuntes y material de estudio de la cátedra de Estructuras de Datos - Universidad de Ciencias de la Computación.</li>
        </ul>
      </div>

      {/* Botones de Navegación */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '3rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link href="/" className="btn-main" style={{ backgroundColor: 'transparent', borderColor: '#444', color: '#E0E0E0' }}>
          ← Volver al Inicio
        </Link>
        <Link href="/editor" className="btn-main">
          Ir al Editor Visual :)
        </Link>
      </div>
    </main>
  );
}