/// <reference types="vite/client" />
interface ImportMetaEnv {
  /**
   * 本地开发服务器端口
   */
  readonly VITE_SERVER_PORT: number;

  /**
   * 开发模式下是否打开浏览器
   */
  readonly VITE_OPEN_BROWSER: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
