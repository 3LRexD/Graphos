// app/layout.tsx
import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Grafos y Algoritmos',
  description: 'Plataforma educativa sobre grafos',
}

// Tipamos las propiedades (props) del componente
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <header>
          <div className="logo-area">
            <span> Analisis de algoritmos c:</span>
          </div>
          <nav>
            <Link href="/">Inicio</Link>
            <Link href="/informacion">Teoría</Link>
            <Link href="/editor">Editor Interactivo</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}