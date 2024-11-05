import { PutObjectCommand } from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";
import { nanoid } from "nanoid";
import sharp from "sharp";

import { IS_PROD, CF_BUCKET } from "@/config";
import { Log } from "./logger";
import { s3 } from "@/s3";
import { db } from "@/db";

export const photoUploader = async ({
  file,
  userId,
}: {
  file: File;
  userId: string;
}) => {
  // Prepare address
  const fileName = file.name;
  const arrayBuffer = await file.arrayBuffer();
  const fileBody = Buffer.from(arrayBuffer);
  const fileBody2 = new Uint8Array(arrayBuffer);
  const fileMeta = await fileTypeFromBuffer(fileBody2);
  const fileExt = fileMeta?.ext || fileName.split(".").pop();

  // Create random name for image
  const randomFileName = nanoid(48);

  // Create Dir to save image
  let folder = IS_PROD ? "files" : "files-dev";
  const objectFolder = `${folder}/${userId}`;
  let objectAddress = `${objectFolder}/${randomFileName}.${fileExt}`;
  const realMimeType = fileMeta?.mime || file.type;

  // make thumbnail & upload photo
  const result = await uploadPhoto({
    fileBody: fileBody,
    objectAddress: objectAddress,
    objectFolder: objectFolder,
    randomFileName: randomFileName,
    mimeType: realMimeType,
    userId: userId,
    fileName: fileName,
  });

  return {
    ...result,
    objectAddress,
  };
};

type ThumbnailType = {
  kind: "s";
  object: string;
  w: number | null;
  h: number | null;
};

const uploadPhoto = async ({
  fileBody,
  objectAddress,
  objectFolder,
  randomFileName,
  mimeType,
  userId,
  fileName,
}: {
  fileBody: Buffer;
  objectAddress: string;
  objectFolder: string;
  randomFileName: string;
  mimeType: string;
  userId: string;
  fileName: string;
}) => {
  let sharpImage = sharp(fileBody);
  // Get metadata
  const metadata = await sharpImage.metadata();
  if (!metadata.width || !metadata.height) {
    Log.scope("photoUploader").error("Can't get image metadata");
    throw new Error("Can't get image metadata");
  }
  const w = metadata.width;
  const h = metadata.height;
  const extension = String(metadata.format);
  const fileSize = fileBody.byteLength;

  let mainDocBody: Buffer = fileBody;

  // Convert if HEIF,avif
  if (["avif", "tiff", "heif"].includes(extension)) {
    mainDocBody = await sharp(fileBody)
      .webp({ quality: 100 })
      .withMetadata()
      .toBuffer();
    objectAddress = `${objectFolder}/${randomFileName}.webp`;
  }

  let thumbnails: ThumbnailType[] = [];
  let thumbnailsForUpload = [];

  // Get thumbnails
  const smallThumbnailObject = `${objectFolder}/${randomFileName}_s.webp`;
  const thumbnailBuffer = await sharpImage
    .webp({ quality: 95 })
    .resize(320)
    .withMetadata()
    .toBuffer();

  //calcs height for 320
  const h320 = w && h ? Math.round((320 / w) * h) : null;

  thumbnailsForUpload.push({
    object: smallThumbnailObject,
    buffer: thumbnailBuffer,
  });
  thumbnails.push({
    kind: "s",
    w: 320,
    h: h320,
    object: smallThumbnailObject,
  });

  const photoCommand = new PutObjectCommand({
    Bucket: CF_BUCKET,
    Body: mainDocBody,
    Key: objectAddress,
    ContentType: mimeType,
    ACL: "public-read",
  });

  // upload thumbnail command
  const thumbnailCommand = new PutObjectCommand({
    Bucket: CF_BUCKET,
    Body: thumbnailBuffer,
    Key: smallThumbnailObject,
    ContentType: "image/webp",
    ACL: "public-read",
  });

  const [doc, mainPhotoUpload, ...list] = await Promise.all([
    db.doc.create({
      data: {
        name: fileName,
        filename: fileName,
        objectAddress: objectAddress,
        thumbnails: thumbnails,
        size: fileSize || 0,
        createdAt: new Date(),
        type: "photo",
        w: w,
        h: h,
        userId: userId,
      },
    }),
    s3.send(photoCommand),
    s3.send(thumbnailCommand),
  ]);

  return {
    fileId: doc.id,
    photo: {
      object: objectAddress,
      w,
      h,
      size: fileSize,
    },
  };
};
