import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agente de Voz con IA | Transport AI",
  description:
    "Descubre cómo un asistente de voz con inteligencia artificial puede atender consultas, orientar a tus clientes y facilitar solicitudes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
