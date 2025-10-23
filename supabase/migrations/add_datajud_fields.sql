-- ========================================
-- ADICIONAR CAMPOS DO DATAJUD À TABELA PROCESSES
-- ========================================

-- Adicionar campos para armazenar dados completos do DataJud
ALTER TABLE processes 
ADD COLUMN IF NOT EXISTS classe jsonb,
ADD COLUMN IF NOT EXISTS sistema jsonb,
ADD COLUMN IF NOT EXISTS formato jsonb,
ADD COLUMN IF NOT EXISTS data_ajuizamento timestamp with time zone,
ADD COLUMN IF NOT EXISTS grau text,
ADD COLUMN IF NOT EXISTS orgao_julgador jsonb,
ADD COLUMN IF NOT EXISTS assuntos jsonb,
ADD COLUMN IF NOT EXISTS movimentos jsonb;

-- Comentários explicativos
COMMENT ON COLUMN processes.classe IS 'JSONB com código e nome da classe processual (ex: {"codigo": 1, "nome": "Procedimento Comum"})';
COMMENT ON COLUMN processes.sistema IS 'JSONB com código e nome do sistema (ex: {"codigo": 1, "nome": "PJe"})';
COMMENT ON COLUMN processes.formato IS 'JSONB com código e nome do formato (ex: {"codigo": 1, "nome": "Eletrônico"})';
COMMENT ON COLUMN processes.data_ajuizamento IS 'Data de ajuizamento do processo';
COMMENT ON COLUMN processes.grau IS 'Grau da instância (ex: "G1", "G2")';
COMMENT ON COLUMN processes.orgao_julgador IS 'JSONB com código e nome do órgão julgador';
COMMENT ON COLUMN processes.assuntos IS 'JSONB array com os assuntos do processo';
COMMENT ON COLUMN processes.movimentos IS 'JSONB array com todas as movimentações do processo';

