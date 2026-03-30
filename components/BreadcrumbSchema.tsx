import { SITE_URL } from '@/lib/site-config'

interface BreadcrumbItem {
  name: string
  href: string
}

export default function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  // JSON-LD is built from trusted static props passed by page components, not user input
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  })

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
}
