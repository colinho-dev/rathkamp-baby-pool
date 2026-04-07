# 🍼 Rachel's Baby Pool

A beautiful baby pool web app for Rachel, Joey, and Junior — built with React + Next.js, ready to deploy on Vercel.

---

## 📁 What's in this package

```
rachel-baby-pool/
├── src/
│   └── BabyPool.jsx        ← The main app component (all UI lives here)
├── pages/
│   ├── _app.jsx            ← Next.js app wrapper
│   ├── globals.css         ← Base styles
│   └── index.jsx           ← Home page (renders BabyPool)
├── package.json            ← Project dependencies
└── README.md               ← You're reading it!
```

---

## 🚀 Quick Start (Run Locally)

**Prerequisites:** Node.js 18+ installed ([nodejs.org](https://nodejs.org))

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

> **Note:** In local/prototype mode, guesses are saved to your browser's `localStorage`. This means each device sees only its own guesses. See the Supabase section below to enable shared storage.

---

## ☁️ Deploy to Vercel (Prototype — No Shared DB)

This gets the app live in ~2 minutes. Guesses won't be shared across devices yet, but it's great for testing the look and feel.

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Click **Deploy** — Vercel auto-detects Next.js, no config needed
5. Your app will be live at `your-project.vercel.app` 🎉

---

## 🗄️ Add Shared Storage with Supabase (~15 min)

Right now guesses are stored in `localStorage` (per-browser only). To make everyone's guesses visible to all visitors, you need a shared database. **Supabase** is the easiest option — free tier is plenty for a baby pool.

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **New Project**, give it a name like `rachel-baby-pool`
3. Wait ~1 minute for it to provision

### Step 2 — Create the `guesses` table

In your Supabase project, go to **SQL Editor** and run:

```sql
create table guesses (
  id          bigint generated always as identity primary key,
  name        text not null,
  date        text not null,
  time        text not null,
  weight      text not null,
  length      text,
  name_guess  text,
  message     text,
  submitted_at timestamptz default now()
);

-- Allow anyone to read and insert (no auth needed for a baby pool)
alter table guesses enable row level security;

create policy "Anyone can read guesses"
  on guesses for select using (true);

create policy "Anyone can insert guesses"
  on guesses for insert with check (true);

create policy "Anyone can delete guesses"
  on guesses for delete using (true);
```

### Step 3 — Get your Supabase credentials

In your Supabase project go to **Settings → API** and copy:
- **Project URL** (looks like `https://xxxx.supabase.co`)
- **anon/public key** (long string starting with `eyJ...`)

### Step 4 — Add environment variables to Vercel

In your Vercel project → **Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...your-anon-key...
```

### Step 5 — Install the Supabase client

```bash
npm install @supabase/supabase-js
```

### Step 6 — Update BabyPool.jsx

Replace the `localStorage` logic in `src/BabyPool.jsx` with Supabase calls.

**At the top of the file, add:**
```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**Replace the `useEffect` that loads guesses:**
```js
useEffect(() => {
  async function load() {
    const { data } = await supabase
      .from('guesses')
      .select('*')
      .order('submitted_at', { ascending: true });
    if (data) setGuesses(data);
  }
  load();
}, []);
```

**Replace the `handleSubmit` save logic:**
```js
const { data, error } = await supabase
  .from('guesses')
  .insert([{
    name: form.name,
    date: form.date,
    time: form.time,
    weight: form.weight,
    length: form.length,
    name_guess: form.nameGuess,
    message: form.message,
  }])
  .select();

if (data) setGuesses(prev => [...prev, data[0]]);
```

**Replace the `delGuess` function:**
```js
async function delGuess(id) {
  await supabase.from('guesses').delete().eq('id', id);
  setGuesses(prev => prev.filter(g => g.id !== id));
}
```

**Remove the `persist()` function** — you no longer need it.

### Step 7 — Redeploy

Push your changes to GitHub. Vercel will auto-redeploy. Done! 🎉

---

## 🔐 Admin Panel

The admin panel is protected by a password. The default is:

```
rachel2025
```

To change it, search for `rachel2025` in `src/BabyPool.jsx` and replace with your preferred password.

---

## 🎨 Customization Tips

| What you want to change | Where to find it |
|---|---|
| Mom/dad names, due date | Admin panel in the app UI |
| App title / header text | `BabyPool.jsx` → hero section |
| Admin password | `BabyPool.jsx` → search `rachel2025` |
| Color scheme | `BabyPool.jsx` → CSS variables / inline color values |
| Confetti colors | `CONFETTI_COLORS` array at top of `BabyPool.jsx` |

---

## 🛟 Need Help?

- **Next.js docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel docs:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase docs:** [supabase.com/docs](https://supabase.com/docs)

---

*Made with love for Rachel, Joey, and Junior 💙*
