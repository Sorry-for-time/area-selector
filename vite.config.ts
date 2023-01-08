import autoprefixer from "autoprefixer";
import { fileURLToPath, URL } from "node:url";
import { ConfigEnv, defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): any => {
  const env: Record<string, string> = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [],
    server: {
      port: Number.parseInt(env.VITE_SERVER_PORT),
      open: env.VITE_OPEN_BROWSER === "true" ? true : false
    },
    resolve: {
      // 配置别名路径
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    css: {
      postcss: {
        plugins: [autoprefixer]
      }
    }
  };
});
