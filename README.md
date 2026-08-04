# Kerala State Holiday Alert (14 Districts)

A beautiful, free, production-ready dashboard that automatically detects when any of the 14 District Collectors in Kerala announce an educational institution holiday. It maps directly into RSS feeds connected to their Official social media properties.

## Features

- **All-Kerala Dashboard**: Mobile-optimized CSS Grid showcasing the status of all 14 districts across Kerala (TVM to KSD).
- **Intelligent Sorting**: Automated script detects holidays in Malayalam & English keywords (`അവധി`, `സ്ഥാപനങ്ങൾക്ക്`, etc.) and immediately surfaces affected districts to the top of the GUI natively in Red.
- **Fully Automated**: Uses a free GitHub Actions cron job running every 15 minutes.
- **Zero Cost Architecture**: Uses local statically generated JSON stores via Vercel / GitHub Pages.

## Districts and Environment Mappings
The system supports 14 explicit RSS URLs, permitting you to dynamically route different social pages over time. The codes correspond to the standard Kerala district nomenclature.

- `TVM_RSS_URL` => Thiruvananthapuram (@Dist_Admin_Tvm)
- `KLM_RSS_URL` => Kollam (@dckollam)
- `PTA_RSS_URL` => Pathanamthitta
- `ALP_RSS_URL` => Alappuzha
- `KTM_RSS_URL` => Kottayam
- `IDK_RSS_URL` => Idukki
- `EKM_RSS_URL` => Ernakulam (@ernakulamdc)
- `TCR_RSS_URL` => Thrissur
- `PKD_RSS_URL` => Palakkad
- `MLP_RSS_URL` => Malappuram
- `KKD_RSS_URL` => Kozhikode
- `WYD_RSS_URL` => Wayanad
- `KNR_RSS_URL` => Kannur
- `KSD_RSS_URL` => Kasaragod

## Setup Instructions

### 1. Identify Target RSS Feeds
Navigate to a free bridge (like RSS.app, Nitter, openRSS, RSSHub, etc.) and generate feeds mapping to the Collector Facebook/X sites.

### 2. Enter GitHub Secrets
1. Go to your repository **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
2. Add secrets correlating to the districts you wish to monitor (e.g. create a secret named `EKM_RSS_URL` and paste the URL.
*Note: Any district missing a URL will harmlessly display "Awaiting RSS Configuration" on the dashboard.*

### 3. Ensure Commit Permissions
So that the automated background fetch script can update your Dashboard UI:
1. Navigate to **Settings** -> **Actions** -> **General*.
2. Scroll to **Workflow permissions**.
3. Activate the radio dot on **Read and write permissions** and save.

## Deploy the User Interface
Simply connect `mahirmobin/check-holiday` into **Vercel** via their dashboard. It will auto-detect Next.js and successfully host your front-end. The GitHub Action will organically provide its data.
