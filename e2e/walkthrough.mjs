/**
 * End-to-end walkthrough: runs the whole scripted demo in headless Chrome and fails on any
 * page or console error. Optionally saves a screenshot at each key screen.
 *
 *   npm run dev                       # or: npm run build && npm run preview
 *   npm run e2e                       # upload-documents path
 *   SKIP_DOCS=1 npm run e2e           # skip documents, answer the questions instead
 *
 * Env: BASE (app URL), CHROME_PATH (Chrome or Chromium binary), SHOTS (folder for screenshots), DPR.
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE ?? 'http://localhost:5173/'
const SKIP_DOCS = Boolean(process.env.SKIP_DOCS)
const SHOTS = process.env.SHOTS
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
}
const shot = async (n) => {
  if (!SHOTS) return
  await wait(350)
  const style = await page.addStyleTag({ content: '[data-sonner-toaster]{visibility:hidden!important}' })
  await page.screenshot({ path: `${SHOTS}/${n}.png` })
  await style.evaluate((el) => el.remove())
}
const log = (s) => console.log(new Date().toISOString().slice(11, 19), s)

await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.goto(BASE, { waitUntil: 'networkidle0' })

// ---------- setup ----------
await waitText('Welcome, Priya')
for (let i = 0; i < 5; i++) {
  await click('Connect')
  await wait(1050)
}
await waitText('Accounts found')
await shot('01-connect')
await click('Continue')
log('connect ok')

if (SKIP_DOCS) {
  await click("Skip, I'll answer questions")
  await click("Yes, that's right")
  await click('Dev tools')
  await click('Fintech')
  await click('Confirm segments')
  await waitText('Last one')
  await wait(1500)
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('li')].filter((li) => li.innerText.includes("I'm strong"))
    rows.forEach((li, i) => [...li.querySelectorAll('button')][i % 2].click())
  })
  await click('Confirm')
} else {
  await click('Choose files')
  await click('Select all')
  await shot('02-upload-picker')
  await click('Upload 6 files')
  await waitText('Is that still right?', 40000)
  await wait(1200)
  await page.evaluate(() => document.querySelector('.overflow-y-auto')?.scrollTo(0, 0))
  await shot('03-docs-read')
  await click("Yes, that's right")
  await waitText("I've selected those two")
  await click('Confirm segments')
  await waitText('Adjust anything, then confirm')
  await click('Confirm')
}
await click('Continue to your plan')
log('learn ok')
await click('Agree plan', 40000)
await waitText('Hi Priya')
log('plan ok')

// ---------- Turn 1 ----------
await click('Notifications')
await click('Open account')
await waitText('Pact drafted a first note')
await shot('04-account-research')
await click('Pact drafted a first note')
await waitText('First note to Maya Okafor')
await shot('05-queue-evidence')
await click('Open draft')
await waitText('Type my edit', 40000)
await shot('06-draft-long-opener')
await click('Type my edit')
await waitText('Ready to approve', 10000)
await shot('07-draft-approve')
await click('Approve & send')
await waitText('Hi Priya')
log('decide ok')
await click('Skip a day')
await waitText('On deck')
await click('View call brief')
await waitText('Discovery questions')
await shot('08-call-brief')
await click('Done reviewing')
await waitText('Pact learned: you prefer short openers')
await shot('09-learned')
await click('Got it')
await waitText('Let Pact send first notes on its own?')
await click('Choose a cap')
await click('$50 a month')
await shot('10-autonomy-offer')
await click('Grant autonomy')
await waitText('Run log')
await shot('11-autonomy-page')
log('turn 1 ok')

// ---------- Turn 2 ----------
await click('Skip two weeks')
await waitText('Hi Priya')
await click('Notifications')
await click('Open account')
await waitText('Pact flagged a renewal risk')
await shot('12-promises')
await click('Pact flagged a renewal risk')
await waitText('Renewal risk: Quillstack pilot')
await shot('13-queue-risk')
await click('Open check-in')
await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.innerText.includes('Approve & send') && !b.disabled), { timeout: 40000 })
await click('Approve & send')
await click('Bring in an expert')
await click('Renewal terms and pricing')
await shot('14-expert')
await click('Request expert')
await waitText('Plan to $1M ARR')
log('turn 2 ok')
await click('Skip to pilot end')
await waitText('You ran the whole loop')
await wait(900)
await shot('15-finish')
await page.evaluate(() => document.querySelector('main .overflow-y-auto')?.scrollTo(0, 700))
await shot('16-plan-learned')
log('done')

// extra browsing checks
await page.goto(BASE + '#/accounts', { waitUntil: 'networkidle0' })
await waitText('Showing 8 of 48')
await shot('17-accounts')
await page.goto(BASE + '#/accounts/halcyon/timeline', { waitUntil: 'networkidle0' })
await click('Read full text')
await shot('18-timeline')
await page.goto(BASE + '#/queue', { waitUntil: 'networkidle0' })
await click('Reviewed')
await shot('19-reviewed')

await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Walkthrough passed (${SKIP_DOCS ? 'answered questions' : 'uploaded documents'}), no errors.`)
