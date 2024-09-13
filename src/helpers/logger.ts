import { OutputChannel, window } from "vscode";
import { format } from "date-fns";

/**
 * Logger class
 */
export class Logger {
  private static instance: Logger;
  public static channel: OutputChannel | null = null;

  private constructor() {
    const displayName = "Better Stacking Contexts";
    Logger.channel = window.createOutputChannel(displayName);
  }

  /**
   * Get the instance of the Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log a message
   * @param message
   * @param type
   */
  public static info(
    message: string,
    type: "INFO" | "WARNING" | "ERROR" = "INFO",
  ): void {
    if (!Logger.channel) {
      Logger.getInstance();
    }

    Logger.channel?.appendLine(
      `["${type}" - ${format(new Date(), "HH:MM:ss")}]  ${message}`,
    );
  }

  /**
   * Log a warning message
   * @param message
   */
  public static warning(message: string): void {
    Logger.info(message, "WARNING");
  }

  /**
   * Log an error message
   * @param message
   */
  public static error(message: string): void {
    Logger.info(message, "ERROR");
  }
}
