import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10
);

export const getNId = () => {
  return nanoid();
};
