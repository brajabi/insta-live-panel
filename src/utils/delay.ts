/** Returns a Promise to wait */
export const delay = (
  /** Time to wait in milliseconds */
  timeMs: number,
) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
