import { useId } from 'react'

// Símbolo do Racha: uma bola "rachada" na diagonal, em duas cores de colete
export function Simbolo({ tamanho = 40 }) {
  const id = useId()
  return (
    <svg
      className="simbolo"
      viewBox="0 0 48 48"
      width={tamanho}
      height={tamanho}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${id}a`}>
          <polygon points="0,0 48,0 0,48" />
        </clipPath>
        <clipPath id={`${id}b`}>
          <polygon points="48,0 48,48 0,48" />
        </clipPath>
      </defs>
      <g transform="translate(-1.8 -1.8)">
        <circle cx="24" cy="24" r="20" fill="var(--laranja)" clipPath={`url(#${id}a)`} />
      </g>
      <g transform="translate(1.8 1.8)">
        <circle cx="24" cy="24" r="20" fill="var(--azul)" clipPath={`url(#${id}b)`} />
      </g>
    </svg>
  )
}

// Símbolo + nome
export function Marca({ tamanho = 34 }) {
  return (
    <span className="marca">
      <Simbolo tamanho={tamanho} />
      <span className="marca-nome">racha</span>
    </span>
  )
}
