const CHAVE_NOTAS = 'times-balanceados:notas'
const CHAVE_REGRAS = 'times-balanceados:regras'
const CHAVE_LEVANTADORES = 'times-balanceados:levantadores'
const CHAVE_MULHERES = 'times-balanceados:mulheres'

function carregar(chave, padrao) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? padrao
  } catch {
    return padrao
  }
}

function salvar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor))
}

export const carregarNotas = () => carregar(CHAVE_NOTAS, {})
export const salvarNotas = (notas) => salvar(CHAVE_NOTAS, notas)

export const carregarRegras = () => carregar(CHAVE_REGRAS, [])
export const salvarRegras = (regras) => salvar(CHAVE_REGRAS, regras)

export const carregarLevantadores = () => carregar(CHAVE_LEVANTADORES, [])
export const salvarLevantadores = (lista) => salvar(CHAVE_LEVANTADORES, lista)

export const carregarMulheres = () => carregar(CHAVE_MULHERES, [])
export const salvarMulheres = (lista) => salvar(CHAVE_MULHERES, lista)