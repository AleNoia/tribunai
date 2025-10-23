import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack desabilitado devido a bug com caracteres acentuados no caminho
  // (OneDrive/Área de Trabalho)
  // Usar Webpack até o bug ser corrigido
};

export default nextConfig;
