// Numeração ou marcador no início: "1- ", "2. ", "3) ", "- ", "• "
const NUMERACAO = /^(\d+\s*[-.)]?|[-•*])\s*/

// Emojis (✅ 💰 🏐...) e caracteres invisíveis que acompanham alguns deles
const EMOJIS = /[\p{Extended_Pictographic}\uFE0F\u200D]/gu

// Marcas de confirmação/recusa que não são emoji (✓ ✖)
const MARCAS = /[✅✔☑✓❌✖]/g

// Negrito, itálico e riscado do WhatsApp: *texto* _texto_ ~texto~
const FORMATACAO = /[*_~]/g

// Quem confirmou presença
const CONFIRMADO = /[✅✔☑✓]/

// Palavras que ficam minúsculas no meio do nome: "Maria da Silva"
const CONECTORES = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

function capitalizar(nome) {
  return nome
    .split(' ')
    .map((parte, i) => {
      if (i > 0 && CONECTORES.has(parte.toLowerCase())) return parte.toLowerCase()
      return parte.charAt(0).toUpperCase() + parte.slice(1)
    })
    .join(' ')
}

function limpar(linha) {
  return linha
    .replace(EMOJIS, '')
    .replace(MARCAS, '')
    .replace(FORMATACAO, '')
    .trim()
    .replace(NUMERACAO, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseLista(texto) {
  const linhas = texto.split('\n')

  // Se alguém marcou ✅, só os confirmados entram
  const temConfirmacao = linhas.some((linha) => CONFIRMADO.test(linha))

  const vistos = new Set()

  return linhas
    .filter((linha) => !temConfirmacao || CONFIRMADO.test(linha))
    .map(limpar)
    .filter((nome) => nome.length > 0)
    .map(capitalizar)
    .filter((nome) => {
      const chave = nome.toLowerCase()
      if (vistos.has(chave)) return false
      vistos.add(chave)
      return true
    })
}