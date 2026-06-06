import React from 'react'

/* Index Aligner logo mark — used in headers and footer across both pages. */
export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle className="ring" cx="16" cy="16" r="13" strokeWidth="2.6"></circle>
      <circle className="ring" cx="16" cy="16" r="7.5" strokeWidth="2.6" opacity="0.45"></circle>
      <circle cx="16" cy="16" r="3.2" fill="currentColor"></circle>
    </svg>
  )
}

/* Arrow used in landing CTAs. */
export const ArrowRight = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14M13 6l6 6-6 6"></path>
  </svg>
)
