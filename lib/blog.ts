interface Post {
  slug: string
  title: string
  description: string
  date: string
  keywords: string[]
  cta: { text: string; href: string }
}

export const posts: Post[] = [
  {
    slug: 'how-to-estimate-quarterly-taxes-w2-side-business',
    title: 'How to Estimate Quarterly Taxes With a W-2 and Side Business',
    description:
      'Learn how to calculate your quarterly estimated tax payments when you have both W-2 income and self-employment income from an LLC or side business.',
    date: '2026-03-29',
    keywords: ['estimating quarterly taxes', 'quarterly tax calculator', 'quarterly tax payment', 'safe harbor tax'],
    cta: {
      text: 'Calculate your quarterly payment',
      href: '/calculators/quarterly-estimates',
    },
  },
  {
    slug: 'self-employment-tax-rate-explained',
    title: '2026 Self-Employment Tax Rate: What It Is and How to Calculate It',
    description:
      'The self-employment tax rate is 15.3%, but you don\u2019t pay that on all your income. Here\u2019s how SE tax actually works when you have a W-2 job and a side business.',
    date: '2026-03-29',
    keywords: ['self employment tax rate', 'se tax calculator', 'self employment tax calculator', '15.3 percent tax'],
    cta: {
      text: 'See your real SE tax amount',
      href: '/calculators/write-off',
    },
  },
  {
    slug: 'simplified-vs-actual-home-office-deduction',
    title: 'Simplified vs. Actual Home Office Deduction: Which Saves You More?',
    description:
      'Compare the simplified method ($5/sq ft, max $1,500) vs. actual expenses to find which home office deduction method saves you the most on taxes.',
    date: '2026-03-29',
    keywords: [
      'home office deduction calculator',
      'simplified home office deduction',
      'actual home office deduction',
      'home office tax deduction',
    ],
    cta: {
      text: 'Compare both methods with your numbers',
      href: '/calculators/home-office',
    },
  },
]
