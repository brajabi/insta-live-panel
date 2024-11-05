# Instagram Live Panel

A simple yet powerful web-based control panel for managing Instagram live streams using FFmpeg. Built with Bun and Elysia.js.

## Features

- 🎥 Start and stop live streams with a user-friendly interface
- 🔄 Real-time stream status monitoring
- 🎮 Easy-to-use control panel
- ⚡ Fast performance with Bun runtime
- 🛠️ FFmpeg integration for reliable stream processing

## Prerequisites

- [Bun](https://bun.sh) installed on your system
- FFmpeg installed and available in your system PATH
- RTMP server (like nginx-rtmp) for stream handling

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/insta-live-panel.git
cd insta-live-panel
```

2. Install dependencies:

```bash
bun install
```

## Usage

1. Start the development server:

```bash
bun run dev
```

2. Open `http://localhost:3000/admin` in your browser to access the control panel

3. Configure your streams:
   - Input Stream URL: Your RTMP source stream URL
   - Output Stream URL: Your destination RTMP URL
   - Stream Title: A name to identify your stream

## API Endpoints

- `GET /admin` - Web-based control panel interface
- `GET /start-ffmpeg` - Start a new FFmpeg stream process
- `GET /stop-ffmpeg` - Stop an active stream process
- `GET /active-processes` - List all currently active streams

## Development

To modify the project:

1. Make your changes in `src/index.ts`
2. The server will automatically reload thanks to Bun's hot reloading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
