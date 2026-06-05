const path = require("path");
const fs = require("fs");

module.exports = {
  webpack: function override(config, env) {
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
  devServer: function overrideDevServer(configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      const customArtifactsDir = process.env.REACT_APP_ARTIFACTS_DIR;

      if (customArtifactsDir) {
        const resolvedDir = path.resolve(customArtifactsDir);
        if (fs.existsSync(resolvedDir)) {
          const originalSetupMiddlewares =
            config.setupMiddlewares || ((middlewares) => middlewares);

          config.setupMiddlewares = (middlewares, devServer) => {
            if (!devServer) {
              throw new Error("webpack-dev-server is not defined");
            }

            // 在 Express 最前面拦截所有包含 /artifacts/ 的请求
            // 不依赖 PUBLIC_URL，无论前缀是什么都能匹配
            devServer.app.use((req, res, next) => {
              if (req.method === "GET" || req.method === "HEAD") {
                const match = req.path.match(/\/artifacts\/(.+)$/);
                if (match) {
                  const relativePath = match[1];
                  const filePath = path.join(resolvedDir, relativePath);
                  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    return res.sendFile(path.resolve(filePath));
                  }
                }
              }
              next();
            });

            return originalSetupMiddlewares(middlewares, devServer);
          };

          console.log(
            `[config-overrides] Serving artifacts from: ${resolvedDir} (matches any path containing /artifacts/)`
          );
        } else {
          console.warn(
            `[config-overrides] REACT_APP_ARTIFACTS_DIR="${resolvedDir}" does not exist.`
          );
        }
      }

      return config;
    };
  },
};
