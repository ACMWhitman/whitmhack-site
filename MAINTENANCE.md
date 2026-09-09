# Maintaining the WhitmHack Website

This file is for whoever takes care of the site after it's built. It
covers two things: how to put the site online for free, and exactly
where to go to fix the placeholder text before launch.

You do not need to be a programmer to follow most of this. If a step
does need real code changes, it says so clearly.

## Part 1: Putting the site online, for free

The site is a set of plain files (HTML, CSS, and JavaScript) once it's
built. It does not need a database or a server running all the time. That
means it can be hosted for free on several services made exactly for
this kind of site.

We recommend **Vercel**. It's free for a project like this, it works well
with Vite (the tool this site is built with), and it updates the live
site automatically every time new code is pushed to GitHub.

### Step by step with Vercel

1. Make sure the project is on GitHub. If it isn't yet, create a new
   repository on GitHub and push the `whitmhack-site` folder to it. If
   you're not sure how, search "push existing project to GitHub" or ask
   whoever set up the repository.
2. Go to [vercel.com](https://vercel.com) and sign up. You can sign up
   with your GitHub account, which makes the next steps faster.
3. Click "Add New Project."
4. Pick the WhitmHack repository from the list. Vercel will scan it and
   should automatically detect it's a Vite project.
5. Check that the settings show:
   - Build command: `npm run build`
   - Output directory: `dist`
   
   If Vercel filled these in for you already, you don't need to change
   anything.
6. Click "Deploy." Wait a minute or two. You'll get a live web address
   like `whitmhack-site.vercel.app`.
7. From now on, every time someone pushes new code to the `main` branch
   on GitHub, Vercel rebuilds and updates the live site by itself. You
   don't need to do this step again.

### Using your own domain name

If Whitman College or the organizers have a domain (like
`whitmhack.org`), you can point it at the Vercel site for free too.
Inside your Vercel project, go to Settings, then Domains, and follow the
instructions there. Vercel will give you a couple of DNS records to add
at wherever the domain was purchased (GoDaddy, Namecheap, Google
Domains, and so on). This part usually takes a few minutes to set up and
up to a day to fully take effect.

### If you'd rather not use Vercel

Two other free options work the same way, connect to GitHub, same build
command (`npm run build`), same output folder (`dist`):

- **Netlify** ([netlify.com](https://netlify.com)), very similar setup
  to Vercel.
- **GitHub Pages**, built directly into GitHub, free, but takes a bit
  more manual setup since it wasn't built specifically for tools like
  Vite. Only worth it if you specifically want to avoid a third-party
  service.

Any of the three will work fine for this project. Vercel is just the
easiest to get started with.

### Before you deploy for real

Run the test suite one more time and make sure everything passes:

```bash
npm install
npm run test
npm run build
```

If all three commands finish without errors, the site is safe to deploy.
The automated checks on GitHub (in the Actions tab of the repository) run
these same steps on every push, so you can also just check there instead
of running them yourself.

## Part 2: Where the site's text lives

Almost everything you can read on the site (headlines, descriptions,
FAQ answers, the countdown date) comes from one file:

**`src/data/siteContent.js`**

You do not need to touch any other file to update text. Open this one
file, find the part you want to change, edit the text between the quote
marks, save, and the website updates itself the next time it's built.

Most of the copy is now the real thing, sourced from the ACM Whitman
Hackathon Exec Summary, Budget Proposal, and D-Day Timeline docs — not
placeholder Lorem Ipsum anymore. A handful of specifics genuinely aren't
locked in yet by those docs; every one of those is marked with a comment
starting with the word `TBD`. If you open the file in any code editor and
search for `TBD`, it will jump you to every spot that still needs a real
answer from the organizers. Here's what each one is.

### Hero section (the very top of the page)

- **`ctaHref`**: the link the "Register Now" button points to. It's set
  to `#register`, which just scrolls down to the footer for now. Once
  there's a real signup form (Devpost for Teams, a Google Form, etc.),
  put that link here instead.
- **`targetDate`**: the exact date and time the countdown clock counts
  down to. Currently set to the kickoff time from the D-Day Timeline
  (2:30 PM PT, October 9, 2026). Double-check this the moment the date
  or time changes even slightly — a wrong value here means a wrong
  countdown on the live site.

### Tracks & Prizes section (`tracksSection`)

WhitmHack doesn't run fixed tracks like a typical hackathon — companies
pitch their own challenges the day of, and prize money comes from a
shared pool per participating company ($1,800–$2,400 each, per the
Budget Proposal) rather than one fixed dollar amount per track. That's
why most `prize` fields here say `'TBD'`: the actual company names,
challenge prompts, and per-award amounts depend on which sponsors
confirm. Update each `prize` field once that's locked in.

### Schedule section (`scheduleSection`)

The two days here (Friday kickoff through Saturday awards) come straight
from the D-Day Timeline. If the timeline shifts, update the `time` and
`title` fields for the affected events — the `id` values don't need to
stay in sync with anything else, so you're free to add, remove, or
reorder events in the list.

### FAQ section (`faqSection`)

One answer is still genuinely open: **`what-to-bring`** — the planning
docs don't specify this yet, so it just says "Details TBD." Fill it in
once organizers confirm (laptop, charger, student ID, etc. — whatever
ends up being expected).

### Organizers & Team section (`organizersSection`)

The five names and roles here are the real current team. The photo next
to each name isn't a real photo yet though — it's a generated circle
with the person's initials on a flat brand color (alternating Whitman
Yellow and white), built automatically from whatever `name` you put in. Getting real photos wired in is a code
change, not just a content edit, so flag that to whoever's maintaining
the code once real headshots are ready. Adding or removing a team
member is a content-only change (edit the array, same as any other list
on this site).

### Footer section (`footerSection`)

- **`resources`**, the CS Resources links: now point to the real Whitman
  College pages (CS Department, Academic Advising, Career and Community
  Engagement Center). Editable label/URL fields for these — including
  add/remove — are in the admin dashboard's Footer section, or edit the
  array directly here.
- **`social`**: still placeholder — replace `#` with the real Instagram,
  Discord, and GitHub links once those accounts exist. Also editable from
  the admin dashboard.

There's one more small piece of placeholder text outside this data file:

**`src/components/FooterSection.jsx`, line 20**

This is the one sentence under "Ready to hack?" near the Register button
at the bottom of the page. It's a normal line of code, not inside the
data file, and it's still filler text — it's easy to find and edit the
same way, just open the file, find that sentence between the quote
marks, and replace it.

### A quick way to check you got everything

From the project folder, run:

```bash
grep -rn "TBD" src/data/siteContent.js
```

This lists every spot still waiting on a real answer from organizers.
Once a value is confirmed, remove the `TBD` comment above it too, so
this search stays useful for finding anything you might have missed.

## A note on the countdown date

The countdown clock on the homepage reads directly from the `targetDate`
value described above. If that date is ever in the past, the clock will
just show "WhitmHack is live!" instead of counting down. Double check
this value any time the event date changes, even by a day.
