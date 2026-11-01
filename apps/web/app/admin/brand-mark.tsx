type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg className={className} viewBox="0 0 26 32" width="26" height="32" aria-hidden="true" shapeRendering="geometricPrecision">
      <path d="M1 32V13A12 12 0 0 1 25 13V32" fill="none" stroke="#5b715e" strokeWidth="2" />
      <path d="M13.6 10C15.1 11.7 16.5 14 16.9 15.8 17.25 17.2 16.8 18.3 15.9 18.7 15.2 19 14.6 18.75 14.2 18.35 13.85 18 13.7 17.4 13.9 16.95 13.5 17.5 13.05 18.4 12.75 19.25 12.1 18.4 11.2 17 11.35 15.4 11.5 13.6 12.3 11.4 13.6 10Z" fill="#5b715e" />
      <path d="M12.85 19.15H13.2L13.05 20.7H12.7Z" fill="#5b715e" />
      <path d="M10.55 31.35Q10.55 32 11.35 32H15Q15.8 32 15.8 31.35V21.65C15.8 21.25 16.2 20.85 16.1 20.45 15.95 20.05 15.4 19.95 15.1 20.3 14.8 20.65 14.45 20.9 14.1 20.5 13.75 20.1 13.45 19.9 13.1 20.25 12.75 19.9 12.4 20.15 12.05 20.6 11.7 21.05 11.3 20.7 11 20.3 10.65 19.9 10.05 20.15 10.05 20.6 10.05 21.05 10.5 21.3 10.55 21.65V31.35Z" fill="#5b715e" />
    </svg>
  )
}
