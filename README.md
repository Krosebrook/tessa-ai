# Tessa AI - Personal Voice Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF.svg)](https://vitejs.dev/)

> **Tessa** is an intelligent, voice-activated personal assistant built with React and powered by Base44 AI platform. Featuring real-time speech recognition, natural language processing, and a beautiful futuristic UI.

## 🌟 Features

- **🎤 Voice Recognition**: Continuous speech recognition using Web Speech API
- **🔊 Text-to-Speech**: Natural voice synthesis with customizable voice settings
- **💬 Conversational AI**: Context-aware responses powered by LLM integration
- **🎨 Beautiful UI**: Futuristic particle-based interface with animated HUD
- **⚙️ Customizable**: Adjustable voice pitch, rate, volume, and preferred voice
- **💾 Persistent Conversations**: Conversation history saved and restored
- **🔐 Authentication**: Secure user authentication via Base44 platform
- **📱 Responsive**: Works across desktop and mobile devices

## 🏗️ Architecture

### Technology Stack

- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 6.1
- **Styling**: TailwindCSS 3.4 with custom animations
- **UI Components**: Radix UI primitives with custom theming
- **State Management**: React Context API + TanStack Query
- **Routing**: React Router v6
- **AI/Backend**: Base44 SDK for agents, entities, and LLM integrations
- **Speech**: Web Speech API (SpeechRecognition & SpeechSynthesis)

### Core Components

```
src/
├── api/                  # API client configuration
│   └── base44Client.js  # Base44 SDK initialization
├── components/
│   ├── tessa/           # Tessa-specific components
│   │   ├── HudCircle.jsx          # Animated status display
│   │   ├── ParticleBackground.jsx # Visual effects
│   │   ├── SettingsPanel.jsx      # User preferences
│   │   └── TypingMessage.jsx      # Animated message display
│   └── ui/              # Reusable UI components (49 components)
├── lib/                 # Utilities and context providers
│   ├── AuthContext.jsx  # Authentication state management
│   ├── app-params.js    # Application parameter handling
│   └── query-client.js  # TanStack Query configuration
├── pages/
│   └── Tessa.jsx        # Main assistant page
├── App.jsx              # Root application component
└── main.jsx             # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ and npm/yarn
- **Base44 Account**: Sign up at [base44.com](https://base44.com)
- **Modern Browser**: Chrome, Edge, or Safari (for Web Speech API)

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

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (default Vite port)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BASE44_APP_ID` | Your Base44 application ID | Yes |
| `VITE_BASE44_FUNCTIONS_VERSION` | Functions version (prod/dev) | Yes |
| `BASE44_LEGACY_SDK_IMPORTS` | Enable legacy SDK imports | No |

## 🎯 Usage

### Basic Interaction

1. **Launch the application** - Tessa will greet you automatically
2. **Click the HUD circle or wait** - Tessa will start listening
3. **Speak your request** - Use natural language
4. **Tessa responds** - Both visually and audibly
5. **Continue the conversation** - Context is maintained

### Settings Configuration

Click the **Settings** icon (⚙️) in the top-right to customize:

- **Preferred Name**: How Tessa addresses you
- **Location**: Your location for context-aware responses
- **Voice Selection**: Choose from available system voices
- **Speech Rate**: Adjust speaking speed (0.5x - 2.0x)
- **Pitch**: Modify voice pitch (0.5 - 2.0)
- **Volume**: Control output volume (0 - 1.0)

### Example Conversations

```
User: "What's the weather like today?"
Tessa: "I'd be happy to help! However, I need your location..."

User: "Tell me a joke"
Tessa: "Why did the AI go to school? To improve its learning!"

User: "Set a reminder for tomorrow"
Tessa: "I'll help you with that. What time tomorrow?"
```

## 🔧 Development

### Available Scripts

```bash
# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check (uses JSDoc types)
npm run typecheck
```

### Code Style

This project follows:
- **ESLint** with React and React Hooks plugins
- **Unused imports** detection and removal
- **JSDoc** for type annotations
- **Prettier-compatible** formatting (via ESLint)

### Adding New Components

1. Create component in appropriate directory
2. Use existing UI components from `components/ui/`
3. Follow React hooks best practices
4. Add JSDoc comments for complex functions
5. Run linter before committing

## 🧪 Testing

*Testing framework setup is planned for future releases.*

```bash
# Run tests (coming soon)
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Building for Production

```bash
# Create optimized production build
npm run build

# Output will be in dist/ directory
# Deploy the contents of dist/ to your hosting provider
```

### Deployment Options

- **Vercel**: Zero-config deployment (`vercel deploy`)
- **Netlify**: Drag-and-drop or CLI (`netlify deploy`)
- **GitHub Pages**: Via GitHub Actions
- **Self-hosted**: Serve `dist/` with any static file server

## 🔒 Security

### Best Practices Implemented

- ✅ Environment variables for sensitive data
- ✅ Token-based authentication with Base44
- ✅ No credentials stored in code
- ✅ HTTPS required for production
- ✅ Input sanitization for user messages
- ✅ Secure token handling via SDK

### Reporting Vulnerabilities

Please report security vulnerabilities to the maintainers directly. Do not open public issues for security concerns.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Write clear, descriptive commit messages
- Follow existing code style and conventions
- Add JSDoc comments for new functions
- Update documentation for new features
- Test your changes thoroughly
- Keep PRs focused and atomic

## 📋 Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed plans.

### Short-term (v0.1 - MVP)
- ✅ Voice recognition and synthesis
- ✅ Basic conversational AI
- ✅ User preferences and settings
- 🔄 Comprehensive testing suite
- 📋 CI/CD pipeline

### Mid-term (v0.5)
- 📋 Multi-language support
- 📋 Advanced context management
- 📋 Integration with external APIs
- 📋 Mobile app (React Native)
- 📋 Voice command shortcuts

### Long-term (v1.0+)
- 📋 Custom wake word detection
- 📋 Emotion detection in voice
- 📋 Multi-user support
- 📋 Plugin/extension system
- 📋 Advanced analytics dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Project Maintainer**: [@Krosebrook](https://github.com/Krosebrook)

## 🙏 Acknowledgments

- **Base44** - For the powerful AI platform and SDK
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For utility-first styling
- **Web Speech API** - For speech recognition and synthesis
- **React Community** - For excellent tools and libraries

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/Krosebrook/tessa-ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/Krosebrook/tessa-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/tessa-ai/discussions)

---

**Made with ❤️ and AI**
