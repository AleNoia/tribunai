import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

// Cliente Admin do Supabase com permissões elevadas
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Funções auxiliares
export async function initializeUserProgress(userId: string) {
  try {
    // Criar progresso inicial vazio
    // Adaptar conforme necessidade do projeto
    const tables = ["videos_progress", "matters_progress", "subjects_progress"];

    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).insert({
        user_id: userId,
        created_at: new Date().toISOString(),
      });

      if (error && !error.message.includes("duplicate")) {
        console.error(`Erro ao inicializar ${table}:`, error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao inicializar progresso:", error);
    return { success: false, error };
  }
}


