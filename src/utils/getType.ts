export const getType = (file: File) => {
  if (photoMimes.has(file.type)) {
    return "photo";
  } else if (videoMimes.has(file.type)) {
    return "video";
  } else if (audioMimes.has(file.type)) {
    return "audio";
  } else {
    return "file";
  }
};

const photoMimes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  //apple & av format support
  "image/heif",
  "image/heic",
  "image/heifs",
  "image/heics",
  "image/avif",
  "image/avci",
  "image/avcs",
]);

const videoMimes = new Set([
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/webm",
]);

const audioMimes = new Set(["audio/mpeg", "audio/ogg", "audio/wav"]);
