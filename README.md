# BookTopia - Kalam Knowledge Club Reading Challenge

A modern, responsive web application for hosting the month-long BookTopia reading challenge event.

![BookTopia](assets/logo.svg)

## 📚 Overview

BookTopia is a web-based reading challenge platform designed for the Kalam Knowledge Club. Students can:

- Sign up and create their profile
- Log daily reading progress
- Track streaks and statistics
- Compete on the leaderboard
- Win exciting rewards

## 🚀 Quick Start

### Prerequisites

- A [Supabase](https://supabase.com) account (free tier works great!)
- A web server or local development server (VS Code Live Server, etc.)
- (Optional) Google Cloud Console account for OAuth

### 1. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. Go to **SQL Editor** and run the following SQL to create the database schema:

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    register_number TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading logs table
CREATE TABLE public.reading_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    pages_read INTEGER NOT NULL CHECK (pages_read > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for reading_logs
CREATE POLICY "Users can view all reading logs"
    ON public.reading_logs FOR SELECT USING (true);

CREATE POLICY "Users can insert own reading logs"
    ON public.reading_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading logs"
    ON public.reading_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading logs"
    ON public.reading_logs FOR DELETE USING (auth.uid() = user_id);
```

3. Create a storage bucket for avatars:
   - Go to **Storage** in your Supabase dashboard
   - Click **New bucket**
   - Name it `avatars`
   - Check **Public bucket**
   - Click **Create bucket**

4. Add storage policies (go to bucket settings > Policies):

```sql
-- Avatar images are publicly accessible
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

### 2. Configure the Application

1. Copy your Supabase credentials from **Settings > API**:
   - Project URL
   - anon/public key

2. Open `js/supabase-config.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 3. Set Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
6. In Supabase, go to **Authentication > Providers > Google**
7. Enable Google and add your Client ID and Secret

### 4. Run Locally

You can use any HTTP server. Here are some options:

**VS Code Live Server:**
- Install the "Live Server" extension
- Right-click `index.html` > Open with Live Server

**Python:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx serve
```

## 📁 Project Structure

```
booktopia/
├── index.html          # Homepage
├── signup.html         # Sign up page
├── signin.html         # Sign in page
├── dashboard.html      # User dashboard
├── profile-setup.html  # Profile completion (OAuth)
├── css/
│   └── styles.css      # Complete design system
├── js/
│   ├── supabase-config.js  # Supabase client setup
│   ├── auth.js             # Authentication logic
│   ├── dashboard.js        # Dashboard functionality
│   ├── reading-log.js      # Reading log CRUD
│   └── utils.js            # Utility functions
├── assets/
│   ├── logo.svg            # Club logo
│   └── default-avatar.svg  # Default avatar
└── README.md           # This file
```

## 🎯 Features

### User Authentication
- Email & password sign up/sign in
- Google OAuth integration
- Email verification
- Password reset
- Persistent sessions

### Reading Log System
- Log pages read daily
- Flexible logging (today + past 3 days)
- Edit and delete entries
- Duplicate prevention
- Future date blocking

### Progress Tracking
- Total pages read
- Days logged
- Average pages per day
- Reading streaks
- Monthly progress ring

### Leaderboard
- Real-time rankings
- Current month stats
- User highlighting
- Top 10 display

### UI/UX
- Dark mode design
- Glassmorphism effects
- Smooth animations
- Mobile responsive
- Toast notifications

## 🏆 Rewards System

| Place | Rewards |
|-------|---------|
| 🥇 1st | Premium book collection + Certificate + Merchandise |
| 🥈 2nd | Bestseller bundle + Certificate + T-shirt |
| 🥉 3rd | Curated reading list + Certificate + Stickers |
| 🏅 All | Digital certificate + Membership perks + Activity points |

## 🔧 Configuration Options

### Environment Variables

The application uses these configurable values in `js/supabase-config.js`:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |

### Customization

- **Colors:** Edit CSS variables in `css/styles.css` (`:root` section)
- **Branding:** Replace `assets/logo.svg` with your logo
- **Tips:** Edit `readingTips` array in `js/utils.js`
- **Days Back Limit:** Change `daysBack` parameter in date validation

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

This project is made for Kalam Knowledge Club. For suggestions or issues, contact the club coordinators.

## 📄 License

© 2026 Kalam Knowledge Club. All rights reserved.

---

Made with ❤️ for book lovers.
