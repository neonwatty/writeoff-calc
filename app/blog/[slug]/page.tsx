import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { posts } from '@/lib/blog'
import { SITE_URL } from '@/lib/site-config'

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description },
    keywords: post.keywords,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) notFound()

  let Content: React.ComponentType
  try {
    const mod = await import(`@/content/${slug}.mdx`)
    Content = mod.default
  } catch {
    notFound()
  }

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Write-Off Calculator',
      url: SITE_URL,
    },
  })

  return (
    <main className="blog-page">
      <BreadcrumbSchema
        items={[
          { name: 'Blog', href: '/blog' },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />
      <article className="blog-article">
        <Link href="/blog" className="blog-back">
          &larr; All posts
        </Link>
        <time dateTime={post.date}>
          {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
        <Content />
        <div className="blog-cta">
          <Link href={post.cta.href} className="blog-cta-button">
            {post.cta.text} &rarr;
          </Link>
        </div>
      </article>
      {/* JSON-LD is statically generated from trusted post metadata, not user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  )
}
