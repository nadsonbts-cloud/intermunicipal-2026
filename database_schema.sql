-- PARTE 1: Limpeza do Banco Atual (Para Garantir Estrutura Perfeita)
DROP TABLE IF EXISTS public.gols CASCADE;
DROP TABLE IF EXISTS public.jogadores CASCADE;
DROP TABLE IF EXISTS public.partidas CASCADE;
DROP TABLE IF EXISTS public.equipes CASCADE;

-- PARTE 2: Criação Relacional Definitiva

CREATE TABLE public.equipes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  grupo text NOT NULL,
  escudo_url text
);

CREATE TABLE public.jogadores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  equipe_id uuid REFERENCES public.equipes(id) ON DELETE CASCADE,
  numero integer,
  posicao text
);

CREATE TABLE public.partidas (
  id text PRIMARY KEY,
  mandante_id uuid REFERENCES public.equipes(id) ON DELETE CASCADE,
  visitante_id uuid REFERENCES public.equipes(id) ON DELETE CASCADE,
  gols_mandante integer,
  gols_visitante integer,
  status text,
  fase integer,
  jogo_ida_volta integer,
  rodada integer,
  data text,
  cidade text,
  estadio text
);

CREATE TABLE public.gols (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partida_id text REFERENCES public.partidas(id) ON DELETE CASCADE,
  jogador_id uuid REFERENCES public.jogadores(id) ON DELETE CASCADE,
  minuto text,
  tipo text DEFAULT 'NORMAL'
);

-- Ativa o tempo real para TODAS as tabelas
alter publication supabase_realtime add table equipes;
alter publication supabase_realtime add table jogadores;
alter publication supabase_realtime add table partidas;
alter publication supabase_realtime add table gols;


-- PARTE 3: Populando as Equipes Oficiais (Sem Mocks)
INSERT INTO public.equipes (id, nome, grupo) VALUES
('b27ab2d6-0000-0000-0000-000000000001', 'Glória', 'GR-01'),
('b27ab2d6-0000-0000-0000-000000000002', 'Rodelas', 'GR-01'),
('b27ab2d6-0000-0000-0000-000000000003', 'Tucano', 'GR-01'),
('b27ab2d6-0000-0000-0000-000000000004', 'Paulo Afonso', 'GR-01'),

('b27ab2d6-0000-0000-0000-000000000005', 'Conde', 'GR-02'),
('b27ab2d6-0000-0000-0000-000000000006', 'Araçás', 'GR-02'),
('b27ab2d6-0000-0000-0000-000000000007', 'Crisópolis', 'GR-02'),
('b27ab2d6-0000-0000-0000-000000000008', 'Rio Real', 'GR-02'),

('b27ab2d6-0000-0000-0000-000000000009', 'Santaluz', 'GR-03'),
('b27ab2d6-0000-0000-0000-000000000010', 'Valente', 'GR-03'),
('b27ab2d6-0000-0000-0000-000000000011', 'Conceição do Coité', 'GR-03'),
('b27ab2d6-0000-0000-0000-000000000012', 'Ichu', 'GR-03'),

('b27ab2d6-0000-0000-0000-000000000013', 'Serrinha', 'GR-04'),
('b27ab2d6-0000-0000-0000-000000000014', 'Biritinga', 'GR-04'),
('b27ab2d6-0000-0000-0000-000000000015', 'Santa Bárbara', 'GR-04'),
('b27ab2d6-0000-0000-0000-000000000016', 'Barrocas', 'GR-04'),

('b27ab2d6-0000-0000-0000-000000000017', 'Miguel Calmon', 'GR-05'),
('b27ab2d6-0000-0000-0000-000000000018', 'Capim Grosso', 'GR-05'),
('b27ab2d6-0000-0000-0000-000000000019', 'Pé de Serra', 'GR-05'),
('b27ab2d6-0000-0000-0000-000000000020', 'Ipirá', 'GR-05'),

('b27ab2d6-0000-0000-0000-000000000021', 'Amélia Rodrigues', 'GR-06'),
('b27ab2d6-0000-0000-0000-000000000022', 'Anguera', 'GR-06'),
('b27ab2d6-0000-0000-0000-000000000023', 'Santanópolis', 'GR-06'),
('b27ab2d6-0000-0000-0000-000000000024', 'Feira de Santana', 'GR-06'),

('b27ab2d6-0000-0000-0000-000000000025', 'Cabaceiras do Paraguaçu', 'GR-07'),
('b27ab2d6-0000-0000-0000-000000000026', 'São Félix', 'GR-07'),
('b27ab2d6-0000-0000-0000-000000000027', 'Cachoeira', 'GR-07'),
('b27ab2d6-0000-0000-0000-000000000028', 'Conceição da Feira', 'GR-07'),

('b27ab2d6-0000-0000-0000-000000000029', 'Alagoinhas', 'GR-08'),
('b27ab2d6-0000-0000-0000-000000000030', 'Catu', 'GR-08'),
('b27ab2d6-0000-0000-0000-000000000031', 'Pojuca', 'GR-08'),
('b27ab2d6-0000-0000-0000-000000000032', 'Lauro de Freitas', 'GR-08'),

('b27ab2d6-0000-0000-0000-000000000033', 'Maragojipe', 'GR-09'),
('b27ab2d6-0000-0000-0000-000000000034', 'Saubara', 'GR-09'),
('b27ab2d6-0000-0000-0000-000000000035', 'São Felipe', 'GR-09'),
('b27ab2d6-0000-0000-0000-000000000036', 'Simões Filho', 'GR-09'),

('b27ab2d6-0000-0000-0000-000000000037', 'Brejões', 'GR-10'),
('b27ab2d6-0000-0000-0000-000000000038', 'Santo Antônio de Jesus', 'GR-10'),
('b27ab2d6-0000-0000-0000-000000000039', 'Itatim', 'GR-10'),
('b27ab2d6-0000-0000-0000-000000000040', 'Castro Alves', 'GR-10'),

('b27ab2d6-0000-0000-0000-000000000041', 'Jaguaquara', 'GR-11'),
('b27ab2d6-0000-0000-0000-000000000042', 'Irajuba', 'GR-11'),
('b27ab2d6-0000-0000-0000-000000000043', 'Itiruçu', 'GR-11'),

('b27ab2d6-0000-0000-0000-000000000044', 'Ilhéus', 'GR-12'),
('b27ab2d6-0000-0000-0000-000000000045', 'Ibirapitanga', 'GR-12'),
('b27ab2d6-0000-0000-0000-000000000046', 'Aurelino Leal', 'GR-12'),
('b27ab2d6-0000-0000-0000-000000000047', 'Itabuna', 'GR-12'),

('b27ab2d6-0000-0000-0000-000000000048', 'Vitória da Conquista', 'GR-13'),
('b27ab2d6-0000-0000-0000-000000000049', 'Brumado', 'GR-13'),
('b27ab2d6-0000-0000-0000-000000000050', 'Poções', 'GR-13'),
('b27ab2d6-0000-0000-0000-000000000051', 'Contendas', 'GR-13'),

('b27ab2d6-0000-0000-0000-000000000052', 'Coaraci', 'GR-14'),
('b27ab2d6-0000-0000-0000-000000000053', 'Itapetinga', 'GR-14'),
('b27ab2d6-0000-0000-0000-000000000054', 'Caatiba', 'GR-14'),
('b27ab2d6-0000-0000-0000-000000000055', 'Barro Preto', 'GR-14'),

('b27ab2d6-0000-0000-0000-000000000056', 'Teixeira de Freitas', 'GR-15'),
('b27ab2d6-0000-0000-0000-000000000057', 'Itamaraju', 'GR-15'),
('b27ab2d6-0000-0000-0000-000000000058', 'Camacan', 'GR-15'),
('b27ab2d6-0000-0000-0000-000000000059', 'Santa Cruz da Vitória', 'GR-15');
