# Tessa AI - Voice-Enabled Personal Assistant

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![Vite](https://img.shields.io/badge/vite-6.1.0-646cff.svg)

Tessa is a futuristic, voice-enabled AI personal assistant built with React and powered by the Base44 platform. It features real-time speech recognition, natural language processing, and an immersive HUD-style interface with particle effects.

## ✨ Features

- 🎤 **Voice Interaction**: Real-time speech recognition and synthesis for natural conversations
- 🤖 **AI-Powered**: Leverages LLM integration through Base44 platform for intelligent responses
- 🎨 **Futuristic UI**: Cyberpunk-inspired interface with animated HUD, particle effects, and glassmorphism
- ⚙️ **Customizable**: Adjust voice settings (pitch, rate, volume), preferred voice, and personal preferences
- 💾 **Conversation Persistence**: Maintains conversation history across sessions
- 🔐 **Secure Authentication**: Base44 SDK integration with JWT-based authentication
- 📱 **Responsive Design**: Works across desktop and mobile devices

## 🏗️ Architecture

### Technology Stack

**Frontend**
- **React 18.2** - UI framework with hooks and context
- **Vite 6.1** - Build tool and dev server
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives

**State Management**
- **React Query (TanStack)** - Server state management and caching
- **React Context** - Client state and authentication

**APIs & Integrations**
- **Base44 SDK** - Backend platform for auth, agents, and entities
- **Web Speech API** - Native browser speech recognition and synthesis

### Project Structure

```
tessa-ai/
├── src/
│   ├── api/                  # API client configuration
│   │   └── base44Client.js   # Base44 SDK client setup
│   ├── components/           # React components
│   │   ├── tessa/           # Tessa-specific components
│   │   │   ├── HudCircle.jsx          # Animated HUD visualization
│   │   │   ├── ParticleBackground.jsx # 3D particle system
│   │   │   ├── SettingsPanel.jsx      # User preferences UI
│   │   │   └── TypingMessage.jsx      # Typing animation effect
│   │   └── ui/              # Reusable UI primitives (Radix)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and context providers
│   │   ├── AuthContext.jsx       # Authentication management
│   │   ├── app-params.js         # URL/storage parameter handling
│   │   ├── query-client.js       # React Query configuration
│   │   ├── utils.js              # Utility functions
│   │   ├── NavigationTracker.jsx # Route tracking
│   │   └── VisualEditAgent.jsx   # Base44 visual editor
│   ├── pages/               # Application pages
│   │   └── Tessa.jsx        # Main assistant interface
│   ├── App.jsx              # Root application component
│   ├── Layout.jsx           # Global layout wrapper
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── docs/                    # Documentation
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
└── eslint.config.js        # ESLint configuration
```

### Core Components

#### 1. Tessa Page (`src/pages/Tessa.jsx`)
Main interface managing:
- Speech recognition lifecycle
- Conversation state and history
- LLM integration for responses
- Voice synthesis with customizable settings
- User preferences persistence

#### 2. HUD Circle (`src/components/tessa/HudCircle.jsx`)
Visual feedback system:
- Animated concentric rings with rotation
- Status indicators (listening, speaking, idle)
- Pulsing core with dynamic colors
- Pure CSS animations for performance

#### 3. Settings Panel (`src/components/tessa/SettingsPanel.jsx`)
User customization interface:
- Voice selection and preview
- Speech rate, pitch, and volume controls
- Personal preferences (name, location, timezone)
- Persistent storage via Base44 entities

#### 4. Auth Context (`src/lib/AuthContext.jsx`)
Authentication management:
- JWT token handling
- User session management
- App public settings validation
- Error handling and redirects

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Base44 Account** - [Sign up at base44.com](https://base44.com)
- **Modern Browser** with Web Speech API support (Chrome, Edge, Safari)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/tessa-ai.git
   cd tessa-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_BASE44_APP_ID=your_app_id_here
   VITE_BASE44_FUNCTIONS_VERSION=prod
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser to `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory.

## 📖 Usage

### Initial Setup

1. **Launch Tessa**: Navigate to the application in your browser
2. **Grant Permissions**: Allow microphone access when prompted
3. **Authentication**: Log in with your Base44 credentials (if auth is enabled)
4. **Start Talking**: Tessa will greet you and begin listening

### Voice Interaction

- Tessa automatically starts listening after speaking
- Speak naturally - the app uses continuous speech recognition
- Responses are spoken back with text display
- Conversation history is maintained throughout the session

### Customizing Settings

1. Click the **Settings** icon (⚙️) in the top-right corner
2. Adjust voice parameters:
   - **Speech Rate**: 0.5x to 2.0x (how fast Tessa speaks)
   - **Pitch**: 0.5 to 2.0 (voice tone)
   - **Volume**: 0.0 to 1.0
   - **Voice**: Select from available system voices
3. Set personal preferences:
   - **Preferred Name**: How Tessa should address you
   - **Location**: For context-aware responses
   - **Timezone**: For time-based interactions
4. Click **Save Settings** to persist changes

## 🛠️ Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint (quiet mode) |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run typecheck` | Run TypeScript type checking |

### Code Style

- **ESLint**: Enforces code quality and consistency
- **Prettier**: (Recommended) Install as dev dependency for formatting
- **Naming Conventions**:
  - Components: PascalCase (e.g., `HudCircle.jsx`)
  - Files: camelCase for utilities, kebab-case for configs
  - Variables: camelCase
  - Constants: UPPER_SNAKE_CASE

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop and Test**
   - Add components in appropriate directories
   - Follow existing patterns and conventions
   - Test thoroughly in development mode

3. **Lint and Build**
   ```bash
   npm run lint:fix
   npm run build
   ```

4. **Submit Pull Request**
   - Clear description of changes
   - Link to related issues
   - Include screenshots for UI changes

## 🔒 Security

### Best Practices

- **Environment Variables**: Never commit `.env` files
- **Token Handling**: Tokens stored in localStorage with secure flags
- **API Security**: All requests go through Base44 SDK with authentication
- **Input Sanitization**: User inputs are sanitized before LLM processing

### Vulnerability Management

```bash
# Check for vulnerabilities
npm audit

# Auto-fix non-breaking issues
npm audit fix

# Review and fix all issues (may have breaking changes)
npm audit fix --force
```

## 🧪 Testing

*Note: Test infrastructure is planned for future releases*

Planned testing approach:
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright/Cypress for E2E
- **Accessibility**: axe-core for a11y compliance

## 📊 Performance

### Optimizations

- **Code Splitting**: Vite's automatic chunking
- **Lazy Loading**: React.lazy for route-based splitting (future)
- **Memoization**: React.memo and useMemo for expensive operations
- **CSS Animations**: GPU-accelerated transforms
- **Bundle Size**: ~500KB gzipped (with dependencies)

### Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | >= 88 | ✅ Full support |
| Edge | >= 88 | ✅ Full support |
| Safari | >= 14.1 | ✅ Full support |
| Firefox | >= 78 | ⚠️ Limited (no Web Speech API) |

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch
3. Make your changes following code style guidelines
4. Test thoroughly
5. Submit a pull request

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes.

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features and improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Base44 Platform** - Backend infrastructure and AI services
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Three.js** - 3D particle effects
- **Lucide Icons** - Beautiful icon set

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Krosebrook/tessa-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/tessa-ai/discussions)
- **Email**: support@base44.com

## 👥 Team

- **Lead Developer**: [@Krosebrook](https://github.com/Krosebrook)

---

**Built with ❤️ using React and the Base44 Platform**
