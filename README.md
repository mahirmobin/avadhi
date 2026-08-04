# Ernakulam Holiday Alert

A complete, free, production-ready web application that automatically detects when the Ernakulam District Collector announces a holiday for educational institutions.

## Features

- **Live Dashboard**: A fast, responsive UI built with Next.js and Tailwind CSS (Kerala-inspired deep green and gold theme).
- **Fully Automated**: Uses GitHub Actions to run a cron job every 15 minutes to check for updates.
- **Zero Cost**: Hosted on Vercel/GitHub Pages (Free Tier), automation via GitHub Actions (Free), and data via a free RSS bridge.
- **Telegram Notifications**: Supports optional immediate push notifications to a Telegram channel/chat.

## Tech Stack

- **Frontend**: Next.js (App Router, Static Export), Tailwind CSS
- **Automation / Backend**: Node.js Script (with `rss-parser`), GitHub Actions
- **Database**: Flat JSON file (`public/status.json`)

## Setup Instructions

### 1. Fork and Clone the Repository
Fork this GitHub repository to your own account, then clone it to your local machine.

### 2. Configure RSS Feed
Since the official X API is paid, you can use a free RSS bridge:
1. Visit [rss.app](https://rss.app/) or a public RSSHub instance.
2. Create a feed for `https://twitter.com/ernakulamdc`.
3. Copy the `.xml` feed link.

### 3. Add GitHub Secrets
Navigate to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
Add the following secrets:
- `RSS_URL`: (Required) The RSS feed URL you got from step 2.
- `TELEGRAM_BOT_TOKEN`: (Optional) Your Telegram bot token (from BotFather).
- `TELEGRAM_CHAT_ID`: (Optional) The Chat ID for your Telegram group/channel.

### 4. Enable Workflow Write Permissions
So that the GitHub Action can update the `status.json` file in the repo:
1. Go to **Settings** -> **Actions** -> **General*.
2. Scroll to **Workflow permissions**.
3. Select **Read and write permissions** and save.

### 5. Deployment

**Vercel (Recommended)**
1. Sign up for a free [Vercel](https://vercel.com/) account.
2. Import this GitHub repository.
3. Vercel automatically detects Next.js. Leave the build settings as default and hit **Deploy**.

**GitHub Pages**
1. In your `next.config.ts`, `output: 'export'` is already present.
2. Enable GitHub Pages in your repo settings pointing to the `gh-pages` branch, or via GitHub Actions.

### 6. Local Development
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the app.
