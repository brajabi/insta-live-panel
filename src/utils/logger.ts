import { IS_PROD } from "@/config";

const sentAlert = new Map<string, { sentAt: number }>();
/**
 * Logs and captures in sentry
 *
 * const log = Log.scope("message");
 * log.error()
 *
 */
export class Log {
  private scope: string = "general";
  static scope = (scope: string) => new Log(scope);

  constructor(scope: string) {
    this.scope = scope || "error";
  }

  public fatal(
    message: string = "",
    error?: Error | unknown,
    metaData?: Record<string, unknown>
  ) {
    console.error(`${this.scope}: ${message}, ${error}`, metaData);

    // don't send if it's dev
    if (!IS_PROD) return;

    try {
      // Sentry.captureException(error ?? message, {
      //   tags: { scope: this.scope },
      //   extra: { message, metaData },
      // });

      // check last time sent
      const lastEvent = sentAlert.get(message);
      const fiveMinLater = new Date().getTime() - 5 * 60 * 1000;
      if (lastEvent && lastEvent?.sentAt > fiveMinLater) return;

      //TODO::send sms
      sentAlert.set(message, {
        sentAt: new Date().getTime(),
      });
    } catch (error) {
      console.log("sentry error", error);
    }
  }
  public error(
    message: string = "",
    error?: Error | unknown,
    metaData?: Record<string, unknown>
  ) {
    console.error(`${this.scope}: ${message}, ${error}`, metaData);

    if (!IS_PROD) return;

    try {
      // Sentry.captureException(error ?? message, {
      //   tags: { scope: this.scope },
      //   extra: { message, metaData },
      // });
    } catch (error) {
      console.log("sentry error", error);
    }
  }

  public warn(
    message: string,
    error?: Error | unknown,
    metaData?: Record<string, unknown>
  ) {
    console.warn(`${this.scope}: ${message}, ${error}`, metaData);

    if (!IS_PROD) return;

    try {
      // Sentry.captureException(error, {
      //   tags: { scope: this.scope },
      //   extra: { message, metaData },
      // });
    } catch (error) {
      console.log("sentry error", error);
    }
  }

  public debug(message: string, metaData?: Record<string, unknown>) {
    console.info(`${this.scope}: ${message}`, metaData);

    if (!IS_PROD) return;

    // Sentry.captureException(message, {
    //   tags: { scope: this.scope },
    //   extra: { message, metaData },
    //   level: "debug",
    // });
  }

  static error(
    message: string = "",
    error?: Error | unknown,
    metaData?: Record<string, unknown>
  ) {
    console.error(`${message}, ${error}`, metaData);
    try {
      // Sentry.captureException(error ?? message, {
      //   extra: { message, metaData },
      // });
    } catch (error) {
      console.log("sentry error", error);
    }
  }
}
