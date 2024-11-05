import { Elysia, t } from "elysia";
import html from "@elysiajs/html";

// Store active FFmpeg processes
const activeProcesses: Map<string, any> = new Map();

const app = new Elysia()
  .use(html())
  .get(
    "/start-ffmpeg",
    async ({ query }) => {
      try {
        const { fromStream, title, toStream } = query as {
          fromStream: string;
          title: string;
          toStream: string;
        };
        const processId = Math.random().toString(36).substring(7);

        console.log(
          `Stream ${title} started with process id ${processId} from ${fromStream} to ${toStream}`
        );

        const ffmpegProcess = Bun.spawn([
          "ffmpeg",
          "-i",
          fromStream,
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-b:v",
          "2500k",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-vf",
          "transpose=1",
          "-f",
          "flv",
          "-flvflags",
          "no_duration_filesize",
          toStream,
        ]);

        // Store the process with its ID and title
        activeProcesses.set(processId, { process: ffmpegProcess, title });

        return {
          success: true,
          processId,
          message: "FFmpeg process started",
        };
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Failed to start process",
        };
      }
    },
    {
      query: t.Object({
        fromStream: t.String(),
        title: t.String(),
        toStream: t.String(),
      }),
    }
  )
  .get(
    "/stop-ffmpeg",
    async ({ query }) => {
      try {
        const { processId } = query as { processId: string };

        if (!activeProcesses.has(processId)) {
          return {
            success: false,
            message: "Process not found",
          };
        }

        const process = activeProcesses.get(processId);

        // Kill the FFmpeg process
        process?.process?.kill();

        // Remove from active processes
        activeProcesses.delete(processId);

        return {
          success: true,
          message: "FFmpeg process stopped",
        };
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Failed to stop process",
        };
      }
    },
    {
      query: t.Object({
        processId: t.String(),
      }),
    }
  )
  .get("/active-processes", () => {
    return {
      processes: Array.from(activeProcesses.entries()).map(([id, data]) => ({
        id,
        title: data.title,
      })),
    };
  })
  .get("/admin", () => {
    return `<!DOCTYPE html>
      <html>
        <head>
          <title>Stream Control Panel</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 1000px;
              margin: 2rem auto;
              padding: 0 1rem;
              background-color: #f5f5f5;
            }
            .stream-controls {
              margin: 1rem 0;
              padding: 1.5rem;
              border-radius: 8px;
              background: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            button {
              margin: 0.5rem;
              padding: 0.7rem 1.2rem;
              border: none;
              border-radius: 4px;
              background-color: #4CAF50;
              color: white;
              cursor: pointer;
              transition: background-color 0.3s;
            }
            button:hover {
              background-color: #45a049;
            }
            button.stop-btn {
              background-color: #f44336;
            }
            button.stop-btn:hover {
              background-color: #da190b;
            }
            .form-group {
              margin-bottom: 1rem;
            }
            input {
              width: 100%;
              padding: 0.5rem;
              margin: 0.5rem 0;
              border: 1px solid #ddd;
              border-radius: 4px;
              box-sizing: border-box;
            }
            label {
              font-weight: bold;
              color: #333;
            }
            h1, h2 {
              color: #2c3e50;
            }
          </style>
        </head>
        <body>
          <h1>Stream Control Panel</h1>
          
          <div class="stream-controls">
            <h2>Start New Stream</h2>
            <form id="startForm" onsubmit="return false;">
              <div class="form-group">
                <label for="fromStream">Input Stream URL:</label>
                <input type="text" id="fromStream" placeholder="rtmp://localhost/live/cam" value="rtmp://localhost/live/cam" required>
              </div>
              <div class="form-group">
                <label for="toStream">Output Stream URL:</label>
                <input type="text" id="toStream" placeholder="rtmp://localhost/live/cam2" value="rtmp://localhost/live/cam2" required>
              </div>
              <div class="form-group">
                <label for="title">Stream Title:</label>
                <input type="text" id="title" placeholder="Instagram Live 1" value="Instagram Live 1" required>
              </div>
              <button onclick="startStream()">Start Stream</button>
            </form>
          </div>

          <div id="activeStreams">
            <h2>Active Streams</h2>
            <div id="streamsList"></div>
          </div>

          <script>
            async function startStream() {
              const fromStream = document.getElementById('fromStream').value;
              const toStream = document.getElementById('toStream').value;
              const title = document.getElementById('title').value;
              const response = await fetch(\`/start-ffmpeg?fromStream=\${encodeURIComponent(fromStream)}&toStream=\${encodeURIComponent(toStream)}&title=\${encodeURIComponent(title)}\`);
              const data = await response.json();
              if (data.success) {
                document.getElementById('startForm').reset();
                updateStreamsList();
              }
            }

            async function stopStream(processId) {
              const response = await fetch(\`/stop-ffmpeg?processId=\${processId}\`);
              const data = await response.json();
              if (data.success) {
                updateStreamsList();
              }
            }

            async function updateStreamsList() {
              const response = await fetch('/active-processes');
              const data = await response.json();
              const streamsList = document.getElementById('streamsList');
              
              streamsList.innerHTML = data.processes.length ? 
                data.processes.map(process => \`
                  <div class="stream-controls">
                    <strong>\${process.title}</strong><br>
                    <small>Process ID: \${process.id}</small>
                    <button class="stop-btn" onclick="stopStream('\${process.id}')">Stop Stream</button>
                  </div>
                \`).join('') :
                '<p>No active streams</p>';
            }

            // Initial load of streams
            updateStreamsList();
            // Update every 5 seconds
            setInterval(updateStreamsList, 5000);
          </script>
        </body>
      </html>
    `;
  })
  .listen(3000);

console.log(
  `Hoshi 🤓 Server is running on: http://${app.server?.hostname}:${app.server?.port}`
);
