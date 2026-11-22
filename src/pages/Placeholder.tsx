import { Hammer } from 'lucide-react'
import { useLocation } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/record'
import { allNavItems } from '@/components/layout/nav'

/** Screens still to be built in a later phase. */
export default function Placeholder() {
  const { pathname } = useLocation()
  const section = '/' + (pathname.split('/')[1] ?? '')
  const label = allNavItems.find((n) => n.to === section)?.label ?? 'This screen'
  return (
    <>
      <PageHeader crumbs={[{ label }]} />
      <EmptyState icon={Hammer} title={`${label} is coming in the next build phase`} hint="Setup and Home are ready. The rest of the loop is next." />
    </>
  )
}
