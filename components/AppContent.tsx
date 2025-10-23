"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mounted, user, loading } = useAuth();

  // Páginas que não requerem autenticação
  const isAuthPage =
    pathname === "/" ||
    pathname?.startsWith("/entrar") ||
    pathname?.startsWith("/cadastrar") ||
    pathname?.startsWith("/recuperar-senha") ||
    pathname?.startsWith("/redefinir-senha") ||
    pathname?.startsWith("/sucesso") ||
    pathname?.startsWith("/email-confirmado") ||
    pathname?.startsWith("/auth/");

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (mounted && !user && !isAuthPage && !loading) {
      router.push("/entrar");
    }
  }, [mounted, user, isAuthPage, loading]);

  // NOTA: router removido das dependências para evitar loops

  // Loading enquanto não está montado
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Páginas de autenticação (públicas)
  if (isAuthPage) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Páginas protegidas - mostrar loading enquanto verifica auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se autenticado, renderizar página protegida
  return <>{children}</>;
}
