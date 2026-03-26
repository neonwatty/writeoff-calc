import NavBar from '@/components/NavBar'

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  )
}
