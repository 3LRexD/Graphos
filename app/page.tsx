// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="hero">
      
      {/* Sección fija del Logo */}
      <div className="logo-container">
        {/* El atributo src="/logo.png" buscará automáticamente
          el archivo "logo.png" dentro de la carpeta "public".
        */}
        <Image 
          src="/logo-UCB.png" 
          alt="Logo Universidad" 
          width={450} 
          height={450} 
          className="logo-img"
          priority // Esto le dice a Next.js que cargue esta imagen rápido porque es importante
        />
      </div>

      <h1>GRAFOS Y ALGORITMOS</h1>
      <p>Ian Coaquira Uriarte.</p>
      
      <Link href="/informacion" className="btn-main">
        Comenzar Exploración
      </Link>
    </main>
  );
}