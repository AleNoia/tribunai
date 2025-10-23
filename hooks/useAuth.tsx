"use client";

import {
  useEffect,
  useState,
  ReactNode,
  createContext,
  useContext,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  mounted: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  mounted: false,
  refreshSession: async () => {},
});

// Cliente Supabase FORA do componente para ser estável
const supabase = createClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Função para forçar refresh da sessão
  const refreshSession = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logger.error("Erro ao refresh sessão", {
          action: "auth_refresh_session_error",
          metadata: { error: error.message },
        });
        setUser(null);
        return;
      }

      setUser(session?.user ?? null);

      logger.info("Sessão refreshed", {
        action: "auth_session_refreshed",
        userId: session?.user?.id,
      });
    } catch (error) {
      logger.error("Erro ao refresh sessão", {
        action: "auth_refresh_session_exception",
        metadata: {
          error: error instanceof Error ? error.message : "unknown",
        },
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Recuperar sessão existente ao montar
    const initializeAuth = async () => {
      try {
        // Verificar sessão atual
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.error("Erro ao recuperar sessão", {
            action: "auth_get_session_error",
            metadata: { error: error.message },
          });
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          logger.info("Sessão recuperada", {
            action: "auth_session_recovered",
            userId: session.user.id,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        logger.error("Erro ao inicializar auth", {
          action: "auth_init_error",
          metadata: {
            error: error instanceof Error ? error.message : "unknown",
          },
        });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Inscrever-se para mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info("Auth state changed", {
        action: "auth_state_change",
        metadata: { event, userId: session?.user?.id },
      });

      setUser(session?.user ?? null);
      setLoading(false);

      // Renovar token automaticamente
      if (event === "TOKEN_REFRESHED") {
        logger.info("Token renovado automaticamente", {
          action: "auth_token_refreshed",
          userId: session?.user?.id,
        });
      }

      // Tratar sessão expirada
      if (event === "SIGNED_OUT") {
        logger.info("Usuário deslogado", {
          action: "auth_signed_out",
        });
        setUser(null);
      }
    });

    // Limpar a inscrição quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = { user, loading, mounted, refreshSession };
  const Provider = AuthContext.Provider;

  return <Provider value={value}>{children}</Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
