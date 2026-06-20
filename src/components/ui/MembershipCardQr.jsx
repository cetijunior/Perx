import { useId } from 'react'
import { cn } from '@/lib/utils'

/** QR panel rendered as SVG frame with embedded image */
export function MembershipCardQr({ qrDataUrl, alt, className }) {
  const uid = useId().replace(/:/g, '')
  const clipId = `perx-qr-clip-${uid}`

  return (
    <svg
      viewBox="0 0 248 248"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('block h-auto w-full max-w-[248px]', className)}
      role="img"
      aria-label={alt}
    >
      <rect width="248" height="248" rx="14" fill="#ffffff" />
      <rect x="1" y="1" width="246" height="246" rx="13" fill="none" stroke="rgb(var(--surface-line))" strokeWidth="1" />
      {qrDataUrl ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x="14" y="14" width="220" height="220" rx="8" />
            </clipPath>
          </defs>
          <image
            href={qrDataUrl}
            x="14"
            y="14"
            width="220"
            height="220"
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid meet"
          />
        </>
      ) : (
        <g opacity="0.35">
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => (
              <rect
                key={`${row}-${col}`}
                x={14 + col * 27.5}
                y={14 + row * 27.5}
                width={18}
                height={18}
                rx="2"
                fill="#181715"
                opacity={(row + col) % 2 === 0 ? 1 : 0.35}
              />
            )),
          )}
        </g>
      )}
    </svg>
  )
}
