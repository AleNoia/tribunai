# Tribunais Suportados - DataJud CNJ

Este sistema suporta consulta em **todos os tribunais brasileiros** cadastrados na API Pública do DataJud.

## 🔍 Detecção Automática

O sistema identifica automaticamente o tribunal correto através do código presente nos dígitos **15-16** do número CNJ.

**Exemplo:**

- Número: `0000000-01.2024.8.26.0001`
- Código do Tribunal: `26` (posições 15-16)
- Tribunal: **Tribunal de Justiça de São Paulo (TJSP)**

## 📋 Categorias de Tribunais

### 🏛️ Tribunais Superiores (Código: 01-07)

| Código | Tribunal                      | Endpoint        |
| ------ | ----------------------------- | --------------- |
| 01     | Supremo Tribunal Federal      | api_publica_stf |
| 02     | Conselho Nacional de Justiça  | api_publica_cnj |
| 03     | Superior Tribunal de Justiça  | api_publica_stj |
| 04     | Justiça Militar da União      | api_publica_stm |
| 05     | Tribunal Superior do Trabalho | api_publica_tst |
| 06     | Superior Tribunal Eleitoral   | api_publica_tse |
| 07     | Superior Tribunal Militar     | api_publica_stm |

### ⚖️ Justiça Federal (Código: 10-15)

| Código | Tribunal         | Endpoint         |
| ------ | ---------------- | ---------------- |
| 10     | TRF da 1ª Região | api_publica_trf1 |
| 11     | TRF da 2ª Região | api_publica_trf2 |
| 12     | TRF da 3ª Região | api_publica_trf3 |
| 13     | TRF da 4ª Região | api_publica_trf4 |
| 14     | TRF da 5ª Região | api_publica_trf5 |
| 15     | TRF da 6ª Região | api_publica_trf6 |

### 🏛️ Justiça Estadual (Código: 16-42)

| Código | Tribunal                  | UF  | Endpoint          |
| ------ | ------------------------- | --- | ----------------- |
| 16     | TJ do Acre                | AC  | api_publica_tjac  |
| 17     | TJ de Alagoas             | AL  | api_publica_tjal  |
| 18     | TJ do Amapá               | AP  | api_publica_tjap  |
| 19     | TJ do Amazonas            | AM  | api_publica_tjam  |
| 20     | TJ da Bahia               | BA  | api_publica_tjba  |
| 21     | TJ do Ceará               | CE  | api_publica_tjce  |
| 22     | TJ do DF e Territórios    | DF  | api_publica_tjdft |
| 23     | TJ do Espírito Santo      | ES  | api_publica_tjes  |
| 24     | TJ de Goiás               | GO  | api_publica_tjgo  |
| 25     | TJ do Maranhão            | MA  | api_publica_tjma  |
| 26     | TJ de Mato Grosso         | MT  | api_publica_tjmt  |
| 27     | TJ de Mato Grosso do Sul  | MS  | api_publica_tjms  |
| 28     | TJ de Minas Gerais        | MG  | api_publica_tjmg  |
| 29     | TJ do Pará                | PA  | api_publica_tjpa  |
| 30     | TJ da Paraíba             | PB  | api_publica_tjpb  |
| 31     | TJ de Pernambuco          | PE  | api_publica_tjpe  |
| 32     | TJ do Piauí               | PI  | api_publica_tjpi  |
| 33     | TJ do Paraná              | PR  | api_publica_tjpr  |
| 34     | TJ do Rio de Janeiro      | RJ  | api_publica_tjrj  |
| 35     | TJ do Rio Grande do Norte | RN  | api_publica_tjrn  |
| 36     | TJ do Rio Grande do Sul   | RS  | api_publica_tjrs  |
| 37     | TJ de Rondônia            | RO  | api_publica_tjro  |
| 38     | TJ de Roraima             | RR  | api_publica_tjrr  |
| 39     | TJ de Santa Catarina      | SC  | api_publica_tjsc  |
| 40     | TJ de Sergipe             | SE  | api_publica_tjse  |
| 41     | TJ de São Paulo           | SP  | api_publica_tjsp  |
| 42     | TJ do Tocantins           | TO  | api_publica_tjto  |

### 👔 Justiça do Trabalho (Código: 50-73)

| Código | Tribunal          | Região | Endpoint          |
| ------ | ----------------- | ------ | ----------------- |
| 50     | TRT da 1ª Região  | RJ     | api_publica_trt1  |
| 51     | TRT da 2ª Região  | SP     | api_publica_trt2  |
| 52     | TRT da 3ª Região  | MG     | api_publica_trt3  |
| 53     | TRT da 4ª Região  | RS     | api_publica_trt4  |
| 54     | TRT da 5ª Região  | BA     | api_publica_trt5  |
| 55     | TRT da 6ª Região  | PE     | api_publica_trt6  |
| 56     | TRT da 7ª Região  | CE     | api_publica_trt7  |
| 57     | TRT da 8ª Região  | PA/AP  | api_publica_trt8  |
| 58     | TRT da 9ª Região  | PR     | api_publica_trt9  |
| 59     | TRT da 10ª Região | DF/TO  | api_publica_trt10 |
| 60     | TRT da 11ª Região | AM/RR  | api_publica_trt11 |
| 61     | TRT da 12ª Região | SC     | api_publica_trt12 |
| 62     | TRT da 13ª Região | PB     | api_publica_trt13 |
| 63     | TRT da 14ª Região | RO/AC  | api_publica_trt14 |
| 64     | TRT da 15ª Região | SP     | api_publica_trt15 |
| 65     | TRT da 16ª Região | MA     | api_publica_trt16 |
| 66     | TRT da 17ª Região | ES     | api_publica_trt17 |
| 67     | TRT da 18ª Região | GO     | api_publica_trt18 |
| 68     | TRT da 19ª Região | AL     | api_publica_trt19 |
| 69     | TRT da 20ª Região | SE     | api_publica_trt20 |
| 70     | TRT da 21ª Região | RN     | api_publica_trt21 |
| 71     | TRT da 22ª Região | PI     | api_publica_trt22 |
| 72     | TRT da 23ª Região | MT     | api_publica_trt23 |
| 73     | TRT da 24ª Região | MS     | api_publica_trt24 |

### 🗳️ Justiça Eleitoral (Código: 80-99, 00)

Todos os TREs dos estados brasileiros estão mapeados no sistema.

### ⚔️ Justiça Militar Estadual

Tribunais de Justiça Militar de MG, RS e SP estão disponíveis.

## 🔧 Como funciona

O sistema utiliza o arquivo `lib/tribunais.ts` que contém um mapeamento completo de todos os códigos de tribunais para suas respectivas URLs na API do DataJud.

```typescript
// Exemplo de uso interno
import { obterUrlTribunal, obterNomeTribunal } from "@/lib/tribunais";

// Detecta o tribunal automaticamente
const url = obterUrlTribunal("0000000-01.2024.8.26.0001");
// Retorna: https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search

const nome = obterNomeTribunal("0000000-01.2024.8.26.0001");
// Retorna: Tribunal de Justiça de São Paulo
```

## 📝 Nota Importante

Se o código do tribunal não for encontrado no mapeamento, o sistema utiliza a URL de teste padrão:

```
https://datajud.cnj.jus.br/api_publica_teste/_search
```

## 🔄 Atualização

A lista de tribunais é mantida conforme a documentação oficial do DataJud/CNJ. Para adicionar ou atualizar tribunais, edite o arquivo `lib/tribunais.ts`.
