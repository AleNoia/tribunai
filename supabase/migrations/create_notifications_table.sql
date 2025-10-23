-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_process_id UUID NOT NULL REFERENCES public.user_processes(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  
  -- Dados da notificação
  tipo VARCHAR(50) NOT NULL DEFAULT 'nova_movimentacao', -- 'nova_movimentacao', 'atualizacao', 'alerta'
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  
  -- Dados da movimentação (opcional)
  movimento_data TIMESTAMPTZ,
  movimento_nome TEXT,
  movimento_complementos JSONB,
  
  -- Metadados
  lida BOOLEAN NOT NULL DEFAULT false,
  lida_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Índices compostos para performance
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_process_id FOREIGN KEY (user_process_id) REFERENCES public.user_processes(id) ON DELETE CASCADE,
  CONSTRAINT fk_process_id FOREIGN KEY (process_id) REFERENCES public.processes(id) ON DELETE CASCADE
);

-- Índices para otimização de queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_process_id ON public.notifications(user_process_id);
CREATE INDEX idx_notifications_lida ON public.notifications(lida);
CREATE INDEX idx_notifications_criado_em ON public.notifications(criado_em DESC);
CREATE INDEX idx_notifications_user_lida ON public.notifications(user_id, lida);

-- RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode ver apenas suas próprias notificações
CREATE POLICY "Usuários podem ver suas notificações"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuário pode atualizar (marcar como lida) suas notificações
CREATE POLICY "Usuários podem atualizar suas notificações"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Sistema pode inserir notificações (via service role)
CREATE POLICY "Sistema pode criar notificações"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Política: Usuário pode deletar suas notificações
CREATE POLICY "Usuários podem deletar suas notificações"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE public.notifications IS 'Armazena notificações de novas movimentações processuais';
COMMENT ON COLUMN public.notifications.tipo IS 'Tipo de notificação: nova_movimentacao, atualizacao, alerta';
COMMENT ON COLUMN public.notifications.lida IS 'Indica se a notificação foi lida pelo usuário';

