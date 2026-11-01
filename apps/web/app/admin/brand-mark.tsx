type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg className={className} viewBox="0 0 26 32" width="26" height="32" aria-hidden="true" shapeRendering="geometricPrecision">
      <path d="M1 32V13A12 12 0 0 1 25 13V32" fill="none" stroke="#5b715e" strokeWidth="2" />
      <path d="M13.6 7.8C15.1 9.5 16.5 11.8 16.9 13.6 17.25 15 16.8 16.1 15.9 16.5 15.2 16.8 14.6 16.55 14.2 16.15 13.85 15.8 13.7 15.2 13.9 14.75 13.5 15.3 13.05 16.2 12.75 17.05 12.1 16.2 11.2 14.8 11.35 13.2 11.5 11.4 12.3 9.2 13.6 7.8Z" fill="#5b715e" />
      <path d="M12.85 16.95H13.2L13.05 18.5H12.7Z" fill="#5b715e" />
      <path d="M10.55 31.35Q10.55 32 11.35 32H15Q15.8 32 15.8 31.35V19.45C15.8 19.05 16.2 18.65 16.1 18.25 15.95 17.85 15.4 17.75 15.1 18.1 14.8 18.45 14.45 18.7 14.1 18.3 13.75 17.9 13.45 17.7 13.1 18.05 12.75 17.7 12.4 17.95 12.05 18.4 11.7 18.85 11.3 18.5 11 18.1 10.65 17.7 10.05 17.95 10.05 18.4 10.05 18.85 10.5 19.1 10.55 19.45V31.35Z" fill="#5b715e" />
    </svg>
  )
}
