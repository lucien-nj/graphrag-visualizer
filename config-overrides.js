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
          // 将用户指定的本地绝对目录映射到 /artifacts 路径
          // 这样 fetch('/artifacts/xxx.parquet') 会读取本地目录中的文件
          const existingStatic = config.static;
          const publicDir = path.resolve(__dirname, "public");

          config.static = [
            {
              directory: resolvedDir,
              publicPath: "/artifacts",
              watch: true,
            },
          ];

          if (Array.isArray(existingStatic)) {
            config.static.push(...existingStatic);
          } else if (existingStatic && existingStatic.directory) {
            config.static.push(existingStatic);
          } else {
            config.static.push({
              directory: publicDir,
              publicPath: "/",
              watch: true,
            });
          }
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
