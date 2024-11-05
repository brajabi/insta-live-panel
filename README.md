# Instagram Live Panel

A simple yet powerful web-based control panel for managing Instagram live streams using FFmpeg. Built with Bun and Elysia.js.

## Features

- 🎥 Start and stop live streams with a user-friendly interface
- 🔄 Real-time stream status monitoring
- 🎮 Easy-to-use control panel
- ⚡ Fast performance with Bun runtime
- 🛠️ FFmpeg integration for reliable stream processing
- 🔄 Support for multiple simultaneous streams
- 🎬 Video rotation support (90° clockwise)
- 📊 Stream status monitoring with video details (resolution, FPS, codec)
- 🎯 RTMP server included with node-media-server

## Prerequisites

- [Bun](https://bun.sh) installed on your system
- FFmpeg installed and available in your system PATH
- Node.js and npm (for node-media-server)

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

2. Open `http://localhost:3000` in your browser to access the control panel

3. Configure your streams:
   - Select an input stream from the available RTMP sources
   - Set your output RTMP URL
   - Add a stream title for identification
   - Optionally enable 90° rotation for vertical video

## API Endpoints

- `GET /` - Web-based control panel interface
- `POST /start-ffmpeg` - Start a new FFmpeg stream process
- `GET /stop-ffmpeg` - Stop an active stream process
- `GET /active-processes` - List all currently active streams
- `GET /streams` - List available input RTMP streams

## RTMP Server

The application includes a built-in RTMP server running on:

- RTMP: port 1935 (for stream ingestion)
- HTTP: port 8000 (for API and monitoring)

## Development

To modify the project:

1. Make your changes in `src/index.ts`
2. The server will automatically reload thanks to Bun's hot reloading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
