# Telegram GitHub Inline Bot

A professional Telegram inline bot for searching GitHub repositories. Built with TypeScript following SOLID principles and optimized for high-volume usage.

## Features

- **Inline Search**: Search GitHub repositories directly from any Telegram chat
- **Dual Search Modes**: 
  - User repositories: `@botname username`
  - Specific repository: `@botname username/reponame`
- **Professional Interface**: Clean, emoji-free responses
- **High Performance**: Caching and optimized API calls
- **Type Safety**: Built with TypeScript
- **Production Ready**: Graceful shutdown and error handling

## Architecture

The bot follows SOLID principles with a clean architecture:
```
src/
├── bot/ # Telegram bot handlers and commands
├── services/ # Business logic (GitHub API, parsing, responses)
├── types/ # TypeScript type definitions
├── config/ # Configuration management
├── logger/ # Logging utilities
└── app.ts # Application bootstrap
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kaurcev/telegram-github-inline-bot.git
cd telegram-github-inline-bot
```
2. Install dependencies:
```bash
npm install
```
3. Create environment file:
```bash
cp .env.example .env
```
4. Configure your bot token in ```.env```:
```
BOT_TOKEN=your_telegram_bot_token_here
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```
## Inline Usage

In any Telegram chat, type:

- ```@yourbotname microsoft``` - to see Microsoft's repositories    
- ```@yourbotname microsoft/vscode``` - to see specific repository

## Commands

- ```/start``` - Get bot usage instructions 
- ```/test``` - Test if bot is working

## API Features

**GitHub API Integration**: Direct repository lookup and search fallback    
**Intelligent Caching**: 5-minute cache for API responses   
**Error Handling**: Comprehensive error management with user-friendly messages  
**HTML Escaping**: Safe HTML rendering for repository descriptions

## Prodaction

### Building

```bash
npm run build
```

### Cleaning
```bash
npm run clean
```

## Configuration

The bot uses the following environment variables:
- ```BOT_TOKEN``` - Telegram Bot Token (required)

## Performance
- **Caching**: In-memory cache with 5-minute TTL  
- **Optimized Logging**: Minimal logging for production   
- **Error Resilience**: Graceful degradation on API failures  
- **Memory Efficient**: No memory leaks with proper cleanup
## Error Handling
The bot handles various error scenarios:
- GitHub API rate limiting    
- Network timeouts    
- Invalid user/repository names   
- Malformed HTML in descriptions  
## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

**License Conditions**:
- You may use this code commercially    
- You may modify and distribute the code  
- You must include the original copyright notice and license in all copies    
- You must give appropriate credit to the original author (Alexsandr Kaurcev) 
- You must provide a link to the original repository in any fork or derivative work

## Author
Alexsandr Kaurcev

## Support
For issues and feature requests, please use the GitHub Issues page.