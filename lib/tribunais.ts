export interface Tribunal {
  codigo: string
  nome: string
  url: string
  categoria: "Superior" | "Federal" | "Estadual" | "Trabalho" | "Eleitoral" | "Militar"
}

// Mapeamento: Segmento (1 dígito) + Código Tribunal (2 dígitos) = Chave de 3 dígitos
// Exemplo: Número 0000832-35.2018.4.01.3202
//          Segmento "4" + Tribunal "01" = Chave "401" = TRF1

export const tribunais: Record<string, Tribunal> = {
  // Segmento 4 - Justiça Federal
  "401": { codigo: "401", nome: "Tribunal Regional Federal da 1ª Região (TRF1)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search", categoria: "Federal" },
  "402": { codigo: "402", nome: "Tribunal Regional Federal da 2ª Região (TRF2)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf2/_search", categoria: "Federal" },
  "403": { codigo: "403", nome: "Tribunal Regional Federal da 3ª Região (TRF3)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf3/_search", categoria: "Federal" },
  "404": { codigo: "404", nome: "Tribunal Regional Federal da 4ª Região (TRF4)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf4/_search", categoria: "Federal" },
  "405": { codigo: "405", nome: "Tribunal Regional Federal da 5ª Região (TRF5)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf5/_search", categoria: "Federal" },
  "406": { codigo: "406", nome: "Tribunal Regional Federal da 6ª Região (TRF6)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf6/_search", categoria: "Federal" },

  // Segmento 5 - Justiça do Trabalho
  "501": { codigo: "501", nome: "Tribunal Regional do Trabalho da 1ª Região (TRT1)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt1/_search", categoria: "Trabalho" },
  "502": { codigo: "502", nome: "Tribunal Regional do Trabalho da 2ª Região (TRT2)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt2/_search", categoria: "Trabalho" },
  "503": { codigo: "503", nome: "Tribunal Regional do Trabalho da 3ª Região (TRT3)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt3/_search", categoria: "Trabalho" },
  "504": { codigo: "504", nome: "Tribunal Regional do Trabalho da 4ª Região (TRT4)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt4/_search", categoria: "Trabalho" },
  "505": { codigo: "505", nome: "Tribunal Regional do Trabalho da 5ª Região (TRT5)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt5/_search", categoria: "Trabalho" },
  "506": { codigo: "506", nome: "Tribunal Regional do Trabalho da 6ª Região (TRT6)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt6/_search", categoria: "Trabalho" },
  "507": { codigo: "507", nome: "Tribunal Regional do Trabalho da 7ª Região (TRT7)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt7/_search", categoria: "Trabalho" },
  "508": { codigo: "508", nome: "Tribunal Regional do Trabalho da 8ª Região (TRT8)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt8/_search", categoria: "Trabalho" },
  "509": { codigo: "509", nome: "Tribunal Regional do Trabalho da 9ª Região (TRT9)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt9/_search", categoria: "Trabalho" },
  "510": { codigo: "510", nome: "Tribunal Regional do Trabalho da 10ª Região (TRT10)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt10/_search", categoria: "Trabalho" },
  "511": { codigo: "511", nome: "Tribunal Regional do Trabalho da 11ª Região (TRT11)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt11/_search", categoria: "Trabalho" },
  "512": { codigo: "512", nome: "Tribunal Regional do Trabalho da 12ª Região (TRT12)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt12/_search", categoria: "Trabalho" },
  "513": { codigo: "513", nome: "Tribunal Regional do Trabalho da 13ª Região (TRT13)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt13/_search", categoria: "Trabalho" },
  "514": { codigo: "514", nome: "Tribunal Regional do Trabalho da 14ª Região (TRT14)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt14/_search", categoria: "Trabalho" },
  "515": { codigo: "515", nome: "Tribunal Regional do Trabalho da 15ª Região (TRT15)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt15/_search", categoria: "Trabalho" },
  "516": { codigo: "516", nome: "Tribunal Regional do Trabalho da 16ª Região (TRT16)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt16/_search", categoria: "Trabalho" },
  "517": { codigo: "517", nome: "Tribunal Regional do Trabalho da 17ª Região (TRT17)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt17/_search", categoria: "Trabalho" },
  "518": { codigo: "518", nome: "Tribunal Regional do Trabalho da 18ª Região (TRT18)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt18/_search", categoria: "Trabalho" },
  "519": { codigo: "519", nome: "Tribunal Regional do Trabalho da 19ª Região (TRT19)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt19/_search", categoria: "Trabalho" },
  "520": { codigo: "520", nome: "Tribunal Regional do Trabalho da 20ª Região (TRT20)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt20/_search", categoria: "Trabalho" },
  "521": { codigo: "521", nome: "Tribunal Regional do Trabalho da 21ª Região (TRT21)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt21/_search", categoria: "Trabalho" },
  "522": { codigo: "522", nome: "Tribunal Regional do Trabalho da 22ª Região (TRT22)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt22/_search", categoria: "Trabalho" },
  "523": { codigo: "523", nome: "Tribunal Regional do Trabalho da 23ª Região (TRT23)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt23/_search", categoria: "Trabalho" },
  "524": { codigo: "524", nome: "Tribunal Regional do Trabalho da 24ª Região (TRT24)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_trt24/_search", categoria: "Trabalho" },

  // Segmento 8 - Justiça Estadual
  "801": { codigo: "801", nome: "Tribunal de Justiça do Acre (TJAC)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjac/_search", categoria: "Estadual" },
  "802": { codigo: "802", nome: "Tribunal de Justiça de Alagoas (TJAL)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjal/_search", categoria: "Estadual" },
  "803": { codigo: "803", nome: "Tribunal de Justiça do Amapá (TJAP)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjap/_search", categoria: "Estadual" },
  "804": { codigo: "804", nome: "Tribunal de Justiça do Amazonas (TJAM)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjam/_search", categoria: "Estadual" },
  "805": { codigo: "805", nome: "Tribunal de Justiça da Bahia (TJBA)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search", categoria: "Estadual" },
  "806": { codigo: "806", nome: "Tribunal de Justiça do Ceará (TJCE)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjce/_search", categoria: "Estadual" },
  "807": { codigo: "807", nome: "Tribunal de Justiça do Distrito Federal e Territórios (TJDFT)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjdft/_search", categoria: "Estadual" },
  "808": { codigo: "808", nome: "Tribunal de Justiça do Espírito Santo (TJES)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjes/_search", categoria: "Estadual" },
  "809": { codigo: "809", nome: "Tribunal de Justiça de Goiás (TJGO)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjgo/_search", categoria: "Estadual" },
  "810": { codigo: "810", nome: "Tribunal de Justiça do Maranhão (TJMA)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjma/_search", categoria: "Estadual" },
  "811": { codigo: "811", nome: "Tribunal de Justiça de Mato Grosso (TJMT)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjmt/_search", categoria: "Estadual" },
  "812": { codigo: "812", nome: "Tribunal de Justiça de Mato Grosso do Sul (TJMS)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjms/_search", categoria: "Estadual" },
  "813": { codigo: "813", nome: "Tribunal de Justiça de Minas Gerais (TJMG)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjmg/_search", categoria: "Estadual" },
  "814": { codigo: "814", nome: "Tribunal de Justiça do Pará (TJPA)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjpa/_search", categoria: "Estadual" },
  "815": { codigo: "815", nome: "Tribunal de Justiça da Paraíba (TJPB)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjpb/_search", categoria: "Estadual" },
  "816": { codigo: "816", nome: "Tribunal de Justiça de Pernambuco (TJPE)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjpe/_search", categoria: "Estadual" },
  "817": { codigo: "817", nome: "Tribunal de Justiça do Piauí (TJPI)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjpi/_search", categoria: "Estadual" },
  "818": { codigo: "818", nome: "Tribunal de Justiça do Paraná (TJPR)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjpr/_search", categoria: "Estadual" },
  "819": { codigo: "819", nome: "Tribunal de Justiça do Rio de Janeiro (TJRJ)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjrj/_search", categoria: "Estadual" },
  "820": { codigo: "820", nome: "Tribunal de Justiça do Rio Grande do Norte (TJRN)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjrn/_search", categoria: "Estadual" },
  "821": { codigo: "821", nome: "Tribunal de Justiça de Rondônia (TJRO)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjro/_search", categoria: "Estadual" },
  "822": { codigo: "822", nome: "Tribunal de Justiça de Roraima (TJRR)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjrr/_search", categoria: "Estadual" },
  "823": { codigo: "823", nome: "Tribunal de Justiça do Rio Grande do Sul (TJRS)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjrs/_search", categoria: "Estadual" },
  "824": { codigo: "824", nome: "Tribunal de Justiça de Santa Catarina (TJSC)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjsc/_search", categoria: "Estadual" },
  "825": { codigo: "825", nome: "Tribunal de Justiça de Sergipe (TJSE)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjse/_search", categoria: "Estadual" },
  "826": { codigo: "826", nome: "Tribunal de Justiça de São Paulo (TJSP)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search", categoria: "Estadual" },
  "827": { codigo: "827", nome: "Tribunal de Justiça do Tocantins (TJTO)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjto/_search", categoria: "Estadual" },

  // Segmento 6 - Justiça Eleitoral
  "601": { codigo: "601", nome: "Tribunal Regional Eleitoral do Acre (TRE-AC)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-ac/_search", categoria: "Eleitoral" },
  "602": { codigo: "602", nome: "Tribunal Regional Eleitoral de Alagoas (TRE-AL)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-al/_search", categoria: "Eleitoral" },
  "603": { codigo: "603", nome: "Tribunal Regional Eleitoral do Amapá (TRE-AP)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-ap/_search", categoria: "Eleitoral" },
  "604": { codigo: "604", nome: "Tribunal Regional Eleitoral do Amazonas (TRE-AM)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-am/_search", categoria: "Eleitoral" },
  "605": { codigo: "605", nome: "Tribunal Regional Eleitoral da Bahia (TRE-BA)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-ba/_search", categoria: "Eleitoral" },
  "606": { codigo: "606", nome: "Tribunal Regional Eleitoral do Ceará (TRE-CE)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-ce/_search", categoria: "Eleitoral" },
  "607": { codigo: "607", nome: "Tribunal Regional Eleitoral do Distrito Federal (TRE-DF)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-dft/_search", categoria: "Eleitoral" },
  "608": { codigo: "608", nome: "Tribunal Regional Eleitoral do Espírito Santo (TRE-ES)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-es/_search", categoria: "Eleitoral" },
  "609": { codigo: "609", nome: "Tribunal Regional Eleitoral de Goiás (TRE-GO)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-go/_search", categoria: "Eleitoral" },
  "610": { codigo: "610", nome: "Tribunal Regional Eleitoral do Maranhão (TRE-MA)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-ma/_search", categoria: "Eleitoral" },
  "611": { codigo: "611", nome: "Tribunal Regional Eleitoral de Mato Grosso (TRE-MT)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-mt/_search", categoria: "Eleitoral" },
  "612": { codigo: "612", nome: "Tribunal Regional Eleitoral de Mato Grosso do Sul (TRE-MS)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-ms/_search", categoria: "Eleitoral" },
  "613": { codigo: "613", nome: "Tribunal Regional Eleitoral de Minas Gerais (TRE-MG)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-mg/_search", categoria: "Eleitoral" },
  "614": { codigo: "614", nome: "Tribunal Regional Eleitoral do Pará (TRE-PA)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-pa/_search", categoria: "Eleitoral" },
  "615": { codigo: "615", nome: "Tribunal Regional Eleitoral da Paraíba (TRE-PB)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-pb/_search", categoria: "Eleitoral" },
  "616": { codigo: "616", nome: "Tribunal Regional Eleitoral de Pernambuco (TRE-PE)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-pe/_search", categoria: "Eleitoral" },
  "617": { codigo: "617", nome: "Tribunal Regional Eleitoral do Piauí (TRE-PI)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-pi/_search", categoria: "Eleitoral" },
  "618": { codigo: "618", nome: "Tribunal Regional Eleitoral do Paraná (TRE-PR)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-pr/_search", categoria: "Eleitoral" },
  "619": { codigo: "619", nome: "Tribunal Regional Eleitoral do Rio de Janeiro (TRE-RJ)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-rj/_search", categoria: "Eleitoral" },
  "620": { codigo: "620", nome: "Tribunal Regional Eleitoral do Rio Grande do Norte (TRE-RN)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-rn/_search", categoria: "Eleitoral" },
  "621": { codigo: "621", nome: "Tribunal Regional Eleitoral de Rondônia (TRE-RO)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-ro/_search", categoria: "Eleitoral" },
  "622": { codigo: "622", nome: "Tribunal Regional Eleitoral de Roraima (TRE-RR)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-rr/_search", categoria: "Eleitoral" },
  "623": { codigo: "623", nome: "Tribunal Regional Eleitoral do Rio Grande do Sul (TRE-RS)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-rs/_search", categoria: "Eleitoral" },
  "624": { codigo: "624", nome: "Tribunal Regional Eleitoral de Santa Catarina (TRE-SC)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-sc/_search", categoria: "Eleitoral" },
  "625": { codigo: "625", nome: "Tribunal Regional Eleitoral de Sergipe (TRE-SE)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-se/_search", categoria: "Eleitoral" },
  "626": { codigo: "626", nome: "Tribunal Regional Eleitoral de São Paulo (TRE-SP)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-sp/_search", categoria: "Eleitoral" },
  "627": { codigo: "627", nome: "Tribunal Regional Eleitoral do Tocantins (TRE-TO)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tre-to/_search", categoria: "Eleitoral" },

  // Tribunais Superiores
  "300": { codigo: "300", nome: "Superior Tribunal de Justiça (STJ)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_stj/_search", categoria: "Superior" },
  "500": { codigo: "500", nome: "Tribunal Superior do Trabalho (TST)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tst/_search", categoria: "Superior" },
  "600": { codigo: "600", nome: "Tribunal Superior Eleitoral (TSE)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_tse/_search", categoria: "Superior" },
  "400": { codigo: "400", nome: "Superior Tribunal Militar (STM)", url: "https://api-publica.datajud.cnj.jus.br/api_publica_stm/_search", categoria: "Superior" },
}

export function obterTribunalPorCodigo(codigoTribunal: string): Tribunal | null {
  return tribunais[codigoTribunal] || null
}

export function obterUrlTribunal(numeroProcesso: string): string {
  // Remove caracteres especiais
  const numeroLimpo = numeroProcesso.replace(/\D/g, "")
  
  if (numeroLimpo.length !== 20) {
    return "https://datajud.cnj.jus.br/api_publica_teste/_search"
  }
  
  // Estrutura: NNNNNNN-DD.AAAA.J.TR.OOOO
  // Posição 13: Segmento (J)
  // Posições 14-15: Tribunal (TR)
  const segmento = numeroLimpo.charAt(13)
  const codigoTribunal = numeroLimpo.slice(14, 16)
  
  // Chave combinada: segmento + código
  const chave = segmento + codigoTribunal
  const tribunal = obterTribunalPorCodigo(chave)
  
  return tribunal?.url || "https://datajud.cnj.jus.br/api_publica_teste/_search"
}

export function obterNomeTribunal(numeroProcesso: string): string {
  const numeroLimpo = numeroProcesso.replace(/\D/g, "")
  
  if (numeroLimpo.length !== 20) {
    return "Tribunal não identificado"
  }
  
  const segmento = numeroLimpo.charAt(13)
  const codigoTribunal = numeroLimpo.slice(14, 16)
  const chave = segmento + codigoTribunal
  const tribunal = obterTribunalPorCodigo(chave)
  
  return tribunal?.nome || "Tribunal não identificado"
}
