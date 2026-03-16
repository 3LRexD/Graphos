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

      {/* ── NUEVA SECCIÓN: Algoritmo de Johnson ── */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'var(--primary-color)' }}>Algoritmo de Johnson (Caminos más cortos)</h3>
        <p style={{ marginBottom: '1rem' }}>
          El <strong>Algoritmo de Johnson</strong> es un método avanzado para encontrar los caminos más cortos entre todos los pares de vértices en un grafo dirigido y disperso. Su característica más brillante es que <strong>permite aristas con pesos negativos</strong>, algo que el clásico algoritmo de Dijkstra no puede manejar por sí solo.
        </p>
        
        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#E0E0E0' }}>¿Cómo funciona? (La Magia de la Reponderación)</h4>
        <p style={{ marginBottom: '1rem' }}>
          Johnson resuelve el problema de los pesos negativos transformando el grafo original mediante un proceso de reponderación, combinando dos algoritmos clásicos:
        </p>
        
        <ol style={{ paddingLeft: '1.5rem', color: '#AAA', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '0.8rem' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Nodo Virtual:</strong> Se añade un nodo temporal $q$ conectado a todos los demás vértices originales con un peso de $0$.
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Bellman-Ford:</strong> Se ejecuta el algoritmo de Bellman-Ford partiendo desde $q$ para calcular una función de "potencial" $h(v)$ para cada vértice $v$. Si se detecta un ciclo de peso negativo, el problema no tiene solución y se aborta.
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Reponderación:</strong> Se recalculan los pesos de todas las aristas originales para garantizar que sean no-negativas (positivas o cero) utilizando esta fórmula matemática:
            <div style={{ textAlign: 'center', margin: '1rem 0', color: '#00e5ff', fontSize: '1.1rem' }}>
              $w'(u, v) = w(u, v) + h(u) - h(v)$
            </div>
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Dijkstra Múltiple:</strong> Con todos los pesos $w'$ ya positivos, se elimina el nodo temporal $q$ y se ejecuta el algoritmo de Dijkstra desde <em>cada</em> vértice del grafo para encontrar las rutas.
          </li>
          <li>
            <strong style={{ color: 'var(--accent-color)' }}>Restauración:</strong> Finalmente, se deshace la fórmula matemática para devolverle al usuario las distancias reales originales.
          </li>
        </ol>
      </div>

      {/* ── NUEVA SECCIÓN: Método CPM / PERT ── */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'var(--primary-color)' }}>Método CPM / PERT (Ruta Crítica)</h3>
        <p style={{ marginBottom: '1rem' }}>
          El <strong>Método de la Ruta Crítica (CPM - Critical Path Method)</strong> es un algoritmo utilizado para planificar, programar y controlar proyectos complejos. Modela un proyecto como una red de tareas interconectadas para determinar el tiempo mínimo necesario para completarlo.
        </p>

        [Image of PERT chart critical path]

        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#E0E0E0' }}>Conceptos Clave y Fórmulas</h4>
        <p style={{ marginBottom: '1rem' }}>
          Para encontrar la ruta crítica, el algoritmo realiza dos recorridos por el grafo (uno hacia adelante y otro hacia atrás) para calcular tres valores fundamentales:
        </p>
        
        <ul style={{ paddingLeft: '1.5rem', color: '#AAA', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '0.8rem' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Tiempo Temprano (TE):</strong> Es lo más pronto que puede comenzar una actividad. Se calcula recorriendo el grafo de inicio a fin. Si un nodo recibe múltiples flechas, el TE es el valor <strong>máximo</strong> de las sumas de las rutas anteriores.
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Tiempo Tardío (TL):</strong> Es lo más tarde que puede comenzar una actividad sin retrasar la duración total del proyecto. Se calcula recorriendo el grafo de fin a inicio. Si de un nodo salen múltiples flechas, el TL es el valor <strong>mínimo</strong> de las restas de las rutas posteriores.
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Holgura (Slack/Float):</strong> Es el tiempo que una actividad puede retrasarse sin afectar la fecha final del proyecto. Su fórmula matemática es:
            <div style={{ textAlign: 'center', margin: '1rem 0', color: '#00e5ff', fontSize: '1.1rem' }}>
              $H = TL - TE$
            </div>
          </li>
          <li>
            <strong style={{ color: 'var(--accent-color)' }}>La Ruta Crítica:</strong> Es el camino (o caminos) desde el nodo inicial hasta el nodo final donde todas las actividades tienen una holgura igual a cero ($H = 0$). Estas tareas no admiten ningún retraso; si una se atrasa, todo el proyecto se atrasa. En nuestro editor, esta ruta se resalta en color rojo.
          </li>
        </ul>
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