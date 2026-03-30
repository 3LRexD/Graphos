// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="hero">
      <div className="logo-container">
        <Image 
          src="/logo-UCB.png" 
          alt="Logo Universidad" 
          width={450} 
          height={450} 
          className="logo-img"
          priority 
        />
      </div>

      <h1>GRAFOS Y ALGORITMOS</h1>
      
      {/* Nombres en línea, seguidos y con un estilo sutil */}
      <p style={{ 
        color: "#888", 
        fontSize: "14px", 
        textAlign: "center", 
        maxWidth: "600px", 
        lineHeight: "1.8",
        margin: "10px auto 30px auto" // Centrado y con espacio solo arriba y abajo
      }}>
        <strong style={{ color: "#fff" }}>Ian Coaquira • Regina Maldonado • Josue Nina • Jose Rodriguez • Karen Vargas • Joseph Cortez</strong> 
      </p>
      
      <Link href="/informacion" className="btn-main">
        Comenzar Exploración
      </Link>
    </main>
  );
}