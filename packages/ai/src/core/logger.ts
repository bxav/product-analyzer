export interface Logger {
  log(message: string): void;
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  startSpinner(message: string): void;
  updateSpinner(message: string): void;
  stopSpinner(successMessage?: string): void;
}
