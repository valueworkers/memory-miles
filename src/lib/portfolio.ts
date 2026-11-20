const assetUrls = import.meta.glob<string>(
  [
    '../assets/**/*.{jpg,jpeg,JPG,jfif,png,webp,avif}',
    '!../assets/Chapara/**',
    '!../assets/Devara Samaradhane/**',
  ],
  { eager: true, query: '?url', import: 'default' },
)

const CATEGORY_LABELS: Record<string, string> = {
  Wedding: 'Marriage',
  NamingCeremony: 'Naming ceremony',
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
}

const groupedAssets = new Map<string, { path: string; url: string }[]>()

for (const [path, url] of Object.entries(assetUrls)) {
  const assetPath = path.slice('../assets/'.length)
  const categorySeparator = assetPath.indexOf('/')
  if (categorySeparator < 1) continue
  const category = assetPath.slice(0, categorySeparator)

  const images = groupedAssets.get(category) ?? []
  images.push({ path, url })
  groupedAssets.set(category, images)
}

export const PORTFOLIO_CATEGORIES = Array.from(groupedAssets, ([name, images]) => ({
  name,
  label: CATEGORY_LABELS[name] ?? toLabel(name),
  slug: toSlug(name),
  images: images
    .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))
    .map(({ url }) => url),
})).sort((a, b) => {
  const featured = ['Wedding', 'Birthday', 'Sangeet', 'NamingCeremony']
  const aIndex = featured.indexOf(a.name)
  const bIndex = featured.indexOf(b.name)
  if (aIndex !== -1 || bIndex !== -1) {
    return (aIndex === -1 ? featured.length : aIndex) - (bIndex === -1 ? featured.length : bIndex)
  }
  return a.label.localeCompare(b.label)
})
