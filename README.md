# ISECO - Independent Students Electoral Committee

Official digital election platform for the **College of Health Sciences Students Association (COHSSA)** at Al-Hikmah University, Ilorin, Nigeria.

![ISECO Platform](https://iseco.lovable.app/og-image.png)

## 🗳️ Overview

ISECO is a comprehensive election management system that handles the complete election lifecycle:

- **Voter Registration** with matric verification and biometric authentication
- **Candidate Applications** with multi-step wizard and admin review
- **Secure Voting** with WebAuthn and OTP authentication
- **Live Results** with real-time charts and statistics
- **Admin Dashboard** for complete election management

## ✨ Key Features

### For Voters
- 📝 Register with matric number verification
- 🔐 Biometric-first login (WebAuthn) with OTP fallback
- ✅ Step-by-step voting for all positions
- 📊 View live election results

### For Candidates
- 📋 Multi-step application wizard
- ✍️ Rich manifesto editor
- 📈 Track application status

### For Administrators
- 📊 Dashboard with statistics and charts
- 👥 Student, voter, and candidate management
- ⏱️ Election timeline control
- 🎛️ Live voting controls
- 📰 Editorial and content management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/iseco.git
cd iseco

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Shadcn/UI | Component Library |
| Supabase | Backend & Auth |
| Recharts | Data Visualization |
| WebAuthn | Biometric Auth |

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn components
│   ├── admin/         # Admin-specific components
│   ├── aspirant/      # Candidate application components
│   └── HomePage/      # Homepage components
├── pages/             # Route pages
│   ├── admin/         # Admin pages
│   └── aspirant/      # Aspirant pages
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
└── integrations/      # Third-party integrations
```

## 🔒 Security

- **Row Level Security (RLS)** on all database tables
- **Role-based access control** with separate roles table
- **Biometric authentication** via WebAuthn
- **Anonymous vote recording** for ballot secrecy
- **Input validation** with Zod schemas

## 📖 Documentation

For detailed documentation, see:
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Complete technical documentation
- [USER_FLOWS_DOCUMENTATION.md](./USER_FLOWS_DOCUMENTATION.md) - User flow diagrams
- [SETUP_ADMIN.md](./SETUP_ADMIN.md) - Admin setup guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed for Al-Hikmah University COHSSA.

## 📞 Support

For support, contact the Electoral Committee:
- Email: iseco@alhikmah.edu.ng
- Visit the Support page in the application

---

**Built with ❤️ by ISECO Team**

*Ensuring Free, Fair, and Transparent Elections*
