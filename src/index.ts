import { Elysia, t } from "elysia";
import html from "@elysiajs/html";

// Store active FFmpeg processes
const activeProcesses: Map<string, any> = new Map();

const app = new Elysia()
  .use(html())
  .post(
    "/start-ffmpeg",
    async ({ body }) => {
      try {
        const { fromStream, title, toStream, rotate } = body;
        const processId = Math.random().toString(36).substring(7);

        console.log(
          `Stream ${title} started with process id ${processId} from ${fromStream} to ${toStream}`
        );

        if (rotate) {
          const ffmpegProcess = Bun.spawn(
            [
              "/usr/local/bin/ffmpeg",
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
            ],
            {
              stdout: "ignore",
              stderr: "ignore",
            }
          );

          // Store the process with its ID and title
          activeProcesses.set(processId, { process: ffmpegProcess, title });
        } else {
          // do ffmpeg -i rtmp://localhost/live/cam1 -c copy -f flv rtmp://destination-server/app/stream-key
          const ffmpegProcess = Bun.spawn(
            ["ffmpeg", "-i", fromStream, "-c", "copy", "-f", "flv", toStream],
            {
              stdout: "ignore",
              stderr: "ignore",
            }
          );

          // Store the process with its ID and title
          activeProcesses.set(processId, { process: ffmpegProcess, title });
        }

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
      body: t.Object({
        fromStream: t.String(),
        title: t.String(),
        toStream: t.String(),
        rotate: t.Optional(t.Boolean()),
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
  .get("/streams", async () => {
    try {
      const streams = await fetch("http://localhost:8000/api/streams");
      const data = (await streams.json()) as any;

      // Extract RTMP streams from the nested structure
      const rtmpStreams = [];
      if (data.live) {
        for (const inputStream of Object.entries(data.live)) {
          const app = inputStream[0] as string;
          const streamInfo = inputStream[1] as any;

          rtmpStreams.push({
            name: app,
            url: `rtmp://localhost/live/${app}`,
            videoSize: `${streamInfo.publisher.video.width}x${streamInfo.publisher.video.height}`,
            fps: streamInfo.publisher.video.fps,
            codec: streamInfo.publisher.video.codec,
          });
        }
      }

      return {
        streams: rtmpStreams,
      };
    } catch (error) {
      console.error(error);
      return {
        streams: [],
      };
    }
  })
  .get("/", () => {
    return `<!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>پنل کنترل استریم</title>
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
            select {
              width: 100%;
              padding: 0.5rem;
              margin: 0.5rem 0;
              border: 1px solid #ddd;
              border-radius: 4px;
              box-sizing: border-box;
            }
            .ltr {
              direction: ltr;
            }
          </style>
        </head>
        <body>
          <h1>پنل کنترل استریم</h1>
          
          <div class="stream-controls">
            <h2>شروع استریم جدید</h2>
            <form id="startForm" onsubmit="return false;">
              <div class="form-group">
                <label for="fromStream">آدرس استریم ورودی:</label>
                <select id="fromStream" required class="ltr">
                  <option value="">در حال بارگذاری استریم‌ها...</option>
                </select>
              </div>
              <div class="form-group">
                <label for="toStream">آدرس استریم خروجی:</label>
                <input type="text" id="toStream" placeholder="rtmp://localhost/live/cam2" value="rtmp://localhost/live/cam2" required class="ltr">
              </div>
              <div class="form-group">
                <label for="title">عنوان استریم:</label>
                <input type="text" id="title" placeholder="لایو اینستاگرام ۱" value="لایو اینستاگرام ۱" required>
              </div>
              <div style="display: flex; align-items: center; width: 500px;">
                <label style="display: flex; align-items: center; justify-content: flex-start; width: 500px;">
                  چرخش ویدیو ۹۰ درجه در جهت عقربه‌های ساعت:
                 <input type="checkbox" id="rotate"> 
                </label>
              </div>
              <button onclick="startStream()">شروع استریم</button>
            </form>
          </div>

          <div id="activeStreams">
            <h2>استریم‌های فعال</h2>
            <div id="streamsList"></div>
          </div>

          <script>
            async function loadStreams() {
              try {
                const response = await fetch('/streams');
                const data = await response.json();
                console.log(data);
                const select = document.getElementById('fromStream');
                select.innerHTML = data.streams.map(stream => 
                  \`<option value="\${stream.url}">\${stream.name} - \${stream.videoSize} - \${stream.fps}fps - \${stream.codec}</option>\`
                ).join('');
              } catch (error) {
                console.error('Failed to load streams:', error);
                const select = document.getElementById('fromStream');
                select.innerHTML = '<option value="">Failed to load streams</option>';
              }
            }

            async function startStream() {
              const fromStream = document.getElementById('fromStream').value;
              const toStream = document.getElementById('toStream').value;
              const title = document.getElementById('title').value;
              const rotate = document.getElementById('rotate').checked;
              const response = await fetch('/start-ffmpeg', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  fromStream,
                  toStream,
                  title,
                  rotate
                })
              });
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
                    <small>شناسه فرآیند: \${process.id}</small>
                    <button class="stop-btn" onclick="stopStream('\${process.id}')">توقف استریم</button>
                  </div>
                \`).join('') :
                '<p>هیچ استریم فعالی وجود ندارد</p>';
            }

            // Initial load of streams and active streams
            loadStreams();
            updateStreamsList();
            
            // Update both streams and active streams every 5 seconds
            setInterval(() => {
              loadStreams();
              updateStreamsList();
            }, 5000);
          </script>
        </body>
      </html>
    `;
  })
  .listen(3000);

console.log(
  `Hoshi 🤓 Server is running on: http://${app.server?.hostname}:${app.server?.port}`
);

import NodeMediaServer from "node-media-server";

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: "*",
    mediaroot: "./media",
  },
};

var nms = new NodeMediaServer(config);
nms.run();
