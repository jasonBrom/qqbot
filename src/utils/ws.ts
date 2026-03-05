/**
 * WebSocket 兼容层：优先使用 Node.js 全局 WebSocket（undici）。
 * 目标：避免依赖外部 ws 包，降低插件安装对 npm 的要求。
 */

type WsEvent = "open" | "message" | "close" | "error";

type MessageHandler = (data: unknown) => void | Promise<void>;
type OpenHandler = () => void | Promise<void>;
type CloseHandler = (code: number, reason: string) => void | Promise<void>;
type ErrorHandler = (err: Error) => void | Promise<void>;

export default class QQBotWebSocket {
  private readonly inner: any;

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string) {
    const WSImpl = (globalThis as any).WebSocket;
    if (!WSImpl) {
      throw new Error("Global WebSocket is unavailable in this runtime. Please use Node.js >= 20.");
    }
    this.inner = new WSImpl(url);
  }

  on(event: "open", handler: OpenHandler): void;
  on(event: "message", handler: MessageHandler): void;
  on(event: "close", handler: CloseHandler): void;
  on(event: "error", handler: ErrorHandler): void;
  on(event: WsEvent, handler: OpenHandler | MessageHandler | CloseHandler | ErrorHandler): void {
    if (event === "open") {
      this.inner.addEventListener("open", () => {
        void (handler as OpenHandler)();
      });
      return;
    }

    if (event === "message") {
      this.inner.addEventListener("message", (evt: { data?: unknown }) => {
        const data = evt?.data;
        void (handler as MessageHandler)(typeof data === "string" ? data : String(data ?? ""));
      });
      return;
    }

    if (event === "close") {
      this.inner.addEventListener("close", (evt: { code?: number; reason?: string }) => {
        void (handler as CloseHandler)(evt?.code ?? 1000, evt?.reason ?? "");
      });
      return;
    }

    this.inner.addEventListener("error", (evt: unknown) => {
      const msg = (evt as { message?: string })?.message ?? "WebSocket error";
      void (handler as ErrorHandler)(new Error(msg));
    });
  }

  send(data: string): void {
    this.inner.send(data);
  }

  close(code?: number, reason?: string): void {
    this.inner.close(code, reason);
  }

  get readyState(): number {
    return this.inner.readyState;
  }
}
