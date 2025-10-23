-- ========================================
-- CRIAÇÃO DAS TABELAS DE PROCESSOS
-- ========================================

-- Tabela: processes
-- Armazena dados globais dos processos (compartilhados entre usuários)
CREATE TABLE IF NOT EXISTS processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text UNIQUE NOT NULL,
  tribunal text NOT NULL,
  partes jsonb DEFAULT '{}'::jsonb,
  ultima_movimentacao jsonb,
  atualizado_em timestamp with time zone DEFAULT now(),
  
  -- Índices para melhor performance
  CONSTRAINT processes_numero_key UNIQUE (numero)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_processes_numero ON processes(numero);
CREATE INDEX IF NOT EXISTS idx_processes_tribunal ON processes(tribunal);
CREATE INDEX IF NOT EXISTS idx_processes_atualizado_em ON processes(atualizado_em DESC);

-- Tabela: user_processes
-- Vincula usuários aos processos que acompanham (relação many-to-many)
CREATE TABLE IF NOT EXISTS user_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  process_id uuid REFERENCES processes(id) ON DELETE CASCADE NOT NULL,
  apelido text,
  notificar boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  
  -- Garantir que um usuário não possa adicionar o mesmo processo duas vezes
  CONSTRAINT user_processes_unique_user_process UNIQUE(user_id, process_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_processes_user_id ON user_processes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_processes_process_id ON user_processes(process_id);
CREATE INDEX IF NOT EXISTS idx_user_processes_atualizado_em ON user_processes(atualizado_em DESC);

-- ========================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_processes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS RLS PARA processes
-- ========================================

-- Permitir SELECT de qualquer processo (para buscar dados globais)
CREATE POLICY "users_select_processes" ON processes
  FOR SELECT TO authenticated 
  USING (true);

-- Permitir INSERT apenas para usuários autenticados
CREATE POLICY "users_insert_processes" ON processes
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- ========================================
-- POLÍTICAS RLS PARA user_processes
-- ========================================

-- Permitir SELECT dos próprios processos
CREATE POLICY "users_select_own_processes" ON user_processes
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

-- Permitir INSERT dos próprios processos
CREATE POLICY "users_insert_own_processes" ON user_processes
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE dos próprios processos
CREATE POLICY "users_update_own_processes" ON user_processes
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Permitir DELETE dos próprios processos
CREATE POLICY "users_delete_own_processes" ON user_processes
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- ========================================
-- FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente atualizado_em
CREATE TRIGGER update_user_processes_updated_at
  BEFORE UPDATE ON user_processes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON TABLE processes IS 'Tabela global de processos jurídicos (compartilhada entre usuários)';
COMMENT ON TABLE user_processes IS 'Tabela de vínculo entre usuários e processos que eles acompanham';

COMMENT ON COLUMN processes.numero IS 'Número único do processo no formato NNNNNNN-DD.AAAA.J.TR.OOOO';
COMMENT ON COLUMN processes.tribunal IS 'Sigla do tribunal (ex: TJ-SP, TRF-3, STJ)';
COMMENT ON COLUMN processes.partes IS 'JSONB com informações das partes do processo';
COMMENT ON COLUMN processes.ultima_movimentacao IS 'JSONB com data e descrição da última movimentação';

COMMENT ON COLUMN user_processes.user_id IS 'UUID do usuário no Supabase Auth';
COMMENT ON COLUMN user_processes.process_id IS 'UUID do processo na tabela processes';
COMMENT ON COLUMN user_processes.apelido IS 'Nome personalizado para o processo (opcional)';
COMMENT ON COLUMN user_processes.notificar IS 'Se o usuário deseja receber notificações sobre este processo';

