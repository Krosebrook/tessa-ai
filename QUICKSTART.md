# Quick Start Guide

Get Tessa AI running locally in under 5 minutes.

## Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
- A Base44 account ([Sign up](https://base44.com))
- Modern browser (Chrome, Edge, or Safari)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Krosebrook/tessa-ai.git
cd tessa-ai
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 18 and related libraries
- TailwindCSS and UI components
- Base44 SDK
- Development tools (Vite, ESLint)

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Base44 credentials:

```env
VITE_BASE44_APP_ID=your_app_id_here
VITE_BASE44_FUNCTIONS_VERSION=prod
```

**Where to find your App ID:**
1. Log in to [Base44](https://base44.com)
2. Navigate to your Apps
3. Copy the App ID

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 5. Test Voice Features

1. **Allow microphone access** when prompted by your browser
2. **Wait for Tessa's greeting** - she'll say hello automatically
3. **Start talking** - Tessa will respond both visually and audibly
4. **Open settings** (⚙️ icon) to customize voice preferences

## Common Issues

### "Cannot access microphone"

**Solution**: 
- Check browser permissions (click the lock icon in address bar)
- HTTPS is required (works on localhost and HTTPS sites)
- Some browsers (Firefox) may have stricter requirements

### "Failed to load conversation"

**Solution**:
- Verify your `.env` file has correct `VITE_BASE44_APP_ID`
- Check your internet connection
- Ensure you're logged into Base44

### "Voice synthesis not working"

**Solution**:
- Check browser compatibility (Chrome/Edge work best)
- Ensure system volume is up
- Try selecting a different voice in settings

### Build errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Type check (JSDoc)
npm run typecheck
```

## Project Structure

```
tessa-ai/
├── src/
│   ├── pages/
│   │   └── Tessa.jsx          # Main assistant page
│   ├── components/
│   │   ├── tessa/             # Tessa-specific components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useTessaVoice.js
│   │   ├── useTessaConversation.js
│   │   └── useTessaSettings.js
│   ├── config/
│   │   └── tessa.config.js    # Configuration constants
│   ├── lib/                   # Utilities and context
│   ├── api/                   # API clients
│   └── App.jsx                # Root component
├── docs/                      # Documentation
├── .env.example               # Environment template
└── package.json               # Dependencies
```

## Next Steps

### For Users
- Explore voice settings (⚙️)
- Try different conversational queries
- Check out example conversations in README.md

### For Developers
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Check [ROADMAP.md](./ROADMAP.md) for planned features
- See [docs/agents.md](./docs/agents.md) for Base44 integration details

### For Contributors
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed instructions.

## Resources

- **Documentation**: [README.md](./README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Roadmap**: [ROADMAP.md](./ROADMAP.md)
- **Security**: [SECURITY.md](./SECURITY.md)
- **Issues**: [GitHub Issues](https://github.com/Krosebrook/tessa-ai/issues)

## Support

Need help?
- Check the [FAQ](https://github.com/Krosebrook/tessa-ai/wiki/FAQ) (coming soon)
- Open an [Issue](https://github.com/Krosebrook/tessa-ai/issues)
- Start a [Discussion](https://github.com/Krosebrook/tessa-ai/discussions)

---

**Ready to contribute?** See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
