export type ClaudeImageType = {
  type: "base64";
  media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string;
};

export const getImageBase64 = async (
  image_url: string
): Promise<ClaudeImageType | null> => {
  try {
    const image_media_type = "image/jpeg";
    const image_array_buffer = await (await fetch(image_url)).arrayBuffer();
    const image_data = Buffer.from(image_array_buffer).toString("base64");

    return {
      type: "base64",
      media_type: image_media_type,
      data: image_data,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
