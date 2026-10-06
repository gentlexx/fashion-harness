/** Apply the Fashion-only document identity and return a complete restoration callback. */
export function applyFashionDocumentBrand(document: Document): () => void {
  const previousTitle = document.title
  const icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  const previousIcon = icon?.getAttribute('href') ?? null
  const previousManifest = manifest?.getAttribute('href') ?? null

  document.title = 'Fashion Harness'
  icon?.setAttribute('href', '/fashion-favicon.svg')
  manifest?.setAttribute('href', '/fashion-manifest.webmanifest')

  return () => {
    document.title = previousTitle
    if (icon !== null) {
      if (previousIcon === null) icon.removeAttribute('href')
      else icon.setAttribute('href', previousIcon)
    }
    if (manifest !== null) {
      if (previousManifest === null) manifest.removeAttribute('href')
      else manifest.setAttribute('href', previousManifest)
    }
  }
}
