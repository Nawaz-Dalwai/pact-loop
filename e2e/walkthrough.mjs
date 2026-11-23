/**
 * End-to-end walkthrough: runs the whole scripted demo in headless Chrome, counts the visitor's
 * clicks, and fails on any page or console error. Optionally saves a screenshot at each key screen.
 *
 *   npm run dev                       # or: npm run build && npm run preview
 *   npm run e2e                       # sample-documents path, every tool connected
 *   SKIP_DOCS=1 npm run e2e           # skip documents; Pact proposes the profile from your deals
 *   TOOLS=email npm run e2e           # connect only email, skip the other five (any comma list works)
 *   NAME="Dana Kim" COMPANY=Northwind npm run e2e   # play the founder yourself (default: Priya at Tracelane)
 *
 * Env: BASE (app URL), CHROME_PATH (Chrome or Chromium binary), SHOTS (folder for screenshots), DPR.
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE ?? 'http://localhost:5173/'
const SKIP_DOCS = Boolean(process.env.SKIP_DOCS)
const TOOLS = (process.env.TOOLS ?? 'email,calendar,calls,slack,billing,product').split(',')
const SHOTS = process.env.SHOTS
const NAME = process.env.NAME ?? ''
const COMPANY = process.env.COMPANY ?? ''
const FIRST = (NAME.trim() || 'Priya Raman').split(/\s+/)[0]
const COMPANY_SHOWN = COMPANY.trim() || 'Tracelane'
const CHROME_PATH =
  process.env.CHROME_PATH ??
  (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome')
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: Number(process.env.DPR ?? 1) })
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const waitText = (t, timeout = 30000) => page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, t)
/** every click the visitor makes, by workflow */
const clicks = { setup: 0, turn1: 0, turn2: 0 }
let phase = 'setup'
async function click(t, timeout = 30000) {
  await page.waitForFunction(
    (t) => [...document.querySelectorAll('button,a,[role=option]')].some((b) => b.innerText.trim().includes(t) && !b.disabled),
    { timeout },
    t,
  )
  await page.evaluate((t) => {
    const el = [...document.querySelectorAll('button,a,[role=option]')].find((b) => b.innerText.trim().includes(t) && !b.disabled)
    el.scrollIntoView({ block: 'center' })
    el.click()
  }, t)
  clicks[phase] += 1
}
const shot = async (n) => {
  if (!SHOTS) return
  await wait(350)
  const style = await page.addStyleTag({ content: '[data-sonner-toaster]{visibility:hidden!important}' })
  await page.screenshot({ path: `${SHOTS}/${n}.png` })
  await style.evaluate((el) => el.remove())
}
const log = (s) => console.log(new Date().toISOString().slice(11, 19), s)
log(`tools: ${TOOLS.join(', ')}`)
const started = Date.now()

await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.goto(BASE, { waitUntil: 'networkidle0' })

// ---------- landing ----------
await waitText('Start the interactive demo')
if (NAME) await page.type('#founder-name', NAME)
if (COMPANY) await page.type('#founder-company', COMPANY)
await shot('00-landing')
// the start button isn't one of the founder's decisions, so it isn't counted
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Start the interactive demo')).click())

// ---------- workflow 1 · onboard ----------
await waitText(`Welcome, ${FIRST}`)
// skip the tools not in TOOLS (optional clicks), then connect the rest in one go
for (const [id, name] of [['calendar', 'Calendar'], ['calls', 'Calls'], ['slack', 'Slack'], ['billing', 'Billing'], ['product', 'Product analytics']]) {
  if (TOOLS.includes(id)) continue
  await page.evaluate((name) => {
    const li = [...document.querySelectorAll('li')].find((l) => l.querySelector('p')?.innerText.startsWith(name))
    ;[...li.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Skip').click()
  }, name)
  clicks.setup += 1
}
await click('Connect')
await waitText('Accounts found', 40000)
await shot('01-connect')
log('connect ok')

if (SKIP_DOCS) {
  await click("Skip, I'll answer")
} else {
  await click('Use sample documents')
  await waitText("Here's the profile they point to", 40000)
  await shot('02-docs-read')
}
await waitText("Add anything the data can't see", 40000)
await click('On-call team of 5+')
await shot('03-profile')
await click('Confirm profile')
log('learn ok')

await click('$1M new ARR')
await waitText('29 new customers', 40000)
await click('Agree plan', 40000)
await waitText(`Hi ${FIRST}`)
log('plan ok')

// ---------- workflow 2 · find and win ----------
phase = 'turn1'
await shot('04-signal')
await click('Open what Pact prepared')
await waitText('Type my edit', 40000)
// the note is signed by the founder, and cites their company
await page.waitForFunction((f) => document.body.innerText.includes(`\n${f}\n`), { timeout: 20000 }, FIRST)
await waitText(`41% with ${COMPANY_SHOWN}`)
await shot('05-draft')
await click('Type my edit')
await waitText('Ready to approve', 10000)
await click('Approve & send')
await waitText('A day later', 20000)
await shot('06-a-day-later')
await click('Grant autonomy')
await waitText('Run log')
await shot('07-autonomy')
await click('Skip two weeks')
log('turn 1 ok')

// ---------- workflow 3 · deliver and grow ----------
phase = 'turn2'
await waitText('Open what Pact found')
await shot('08-risk-signal')
await click('Open what Pact found')
await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.innerText.includes('Approve & send') && !b.disabled), { timeout: 40000 })
await shot('09-checkin')
await click('Approve & send')
await click('Bring in an expert')
await waitText('Plan to $1M in new ARR')
await click('Skip to pilot end')
await waitText('You ran the whole loop')
await shot('10-finish')
await click('Approve & send')
await waitText('Expansion quote sent')
log('turn 2 ok')

const total = clicks.setup + clicks.turn1 + clicks.turn2
log(`clicks: ${total} (onboard ${clicks.setup}, find and win ${clicks.turn1}, deliver and grow ${clicks.turn2}) in ${Math.round((Date.now() - started) / 1000)}s`)

// ---------- getting lost, and optional depth ----------
await page.goto(BASE + '#/accounts', { waitUntil: 'networkidle0' })
await waitText('Showing 8 of 48')
await page.goto(BASE + '#/accounts/halcyon/brief', { waitUntil: 'networkidle0' })
await waitText('Discovery questions')
await page.goto(BASE + '#/accounts/quillstack/promises', { waitUntil: 'networkidle0' })
await waitText('Weekly check-in with Ana')
await page.goto(BASE + '#/queue', { waitUntil: 'networkidle0' })
await click('Reviewed')
await shot('11-reviewed')

await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Walkthrough passed (${FIRST} at ${COMPANY_SHOWN}; ${SKIP_DOCS ? 'no documents' : 'sample documents'}; tools: ${TOOLS.join(', ')}), no errors.`)
