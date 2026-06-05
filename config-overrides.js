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

            // 在 Express app 上注册 artifacts 路由
            // 优先于 static 中间件，直接读取本地绝对路径下的文件
            // 必须带上 PUBLIC_URL 前缀，因为应用可能运行在子路径下
            const publicUrl = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
            const routePath = (publicUrl ? publicUrl : "") + "/artifacts/*";

            devServer.app.get(routePath, (req, res, next) => {
              const relativePath = req.params[0] || "";
              const filePath = path.join(resolvedDir, relativePath);
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(path.resolve(filePath));
              } else {
                next();
              }
            });

            return originalSetupMiddlewares(middlewares, devServer);
          };

          const publicUrl = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
          console.log(
            `[config-overrides] Serving artifacts from: ${resolvedDir} -> ${publicUrl || ""}/artifacts`
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
