import { useNavigate } from 'react-router'
import { Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiTiles } from '@/components/shared/record'
import { HealthBadge, StatusBadge } from '@/components/shared/pills'
import { accountsFor } from '@/data/accounts'
import { useDemo } from '@/store'

/** /accounts — the live record: every account built from email, calls and product usage. */
export default function AccountsPage() {
  const step = useDemo((s) => s.step)
  const navigate = useNavigate()
  const accounts = accountsFor(step)
  const count = (s: string) => accounts.filter((a) => a.status === s).length

  return (
    <>
      <PageHeader icon={Building2} crumbs={[{ label: 'Accounts' }]} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1040px] space-y-6 px-6 pb-16 pt-8">
          <div>
            <h1 className="text-2xl font-medium">Accounts</h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              One live record per account, built from every email, call, meeting and product event. Showing {accounts.length} of 48.
            </p>
          </div>
          <KpiTiles
            items={[
              { label: 'Customers', value: count('Customer') },
              { label: 'Live pilots', value: count('Pilot') },
              { label: 'Prospects', value: count('Prospect') + count('New signal') + count('Meeting booked') },
              { label: 'Promises tracked', value: 11 },
            ]}
          />
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-[13px]">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="h-9 px-3 text-left font-normal">Account</th>
                  <th className="px-3 text-left font-normal">Industry</th>
                  <th className="px-3 text-left font-normal">Status</th>
                  <th className="px-3 text-left font-normal">Health</th>
                  <th className="px-3 text-right font-normal">Value</th>
                  <th className="px-3 text-right font-normal">Last touch</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} onClick={() => navigate(`/accounts/${a.id}`)} className="cursor-pointer border-b last:border-0 hover:bg-table-background-hover">
                    <td className="h-11 px-3">
                      <span className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-md bg-neutral-100 text-xs font-semibold text-neutral-600">{a.name[0]}</span>
                        <span className="font-medium">{a.name}</span>
                        <span className="text-xs text-muted-foreground">{a.domain}</span>
                      </span>
                    </td>
                    <td className="px-3 text-muted-foreground">{a.industry}</td>
                    <td className="px-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-3">{a.health ? <HealthBadge health={a.health} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    <td className="px-3 text-right tabular-nums">{a.arr ?? '—'}</td>
                    <td className="px-3 text-right text-xs text-muted-foreground">{a.lastTouch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
