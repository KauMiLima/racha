// Cada time ganha a cor de um colete
export const COLETES = [
  { nome: 'Laranja', cor: 'var(--laranja)', emoji: '🟧' },
  { nome: 'Azul', cor: 'var(--azul)', emoji: '🟦' },
  { nome: 'Verde', cor: 'var(--verde)', emoji: '🟩' },
  { nome: 'Amarelo', cor: 'var(--amarelo)', emoji: '🟨' },
]

export const coleteDo = (i) => COLETES[i % COLETES.length]
