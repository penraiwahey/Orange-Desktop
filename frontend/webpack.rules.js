const path = require("path");

module.exports = [
  // รองรับ native node modules (.node files)
  {
    test: /native_modules[/\\].+\.node$/,
    use: "node-loader",
  },
  // สำหรับโมดูลจาก node_modules ที่อาจมีไฟล์ .mjs หรือ .node
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: "@vercel/webpack-asset-relocator-loader",
      options: {
        outputAssetBase: "native_modules",
      },
    },
  },
  // สำหรับ JavaScript และ JSX ด้วย babel-loader (React)
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-react"],
      },
    },
  },
  // สำหรับไฟล์ CSS (ในตัวอย่างใช้ include ระบุ path หากมีเฉพาะในบางโฟลเดอร์)
  {
    test: /\.css$/,
    include: [path.resolve(__dirname, "app/src")],
    use: ["style-loader", "css-loader", "postcss-loader"],
  },

  // คุณสามารถเพิ่ม loader rules อื่นๆ ที่จำเป็นสำหรับโปรเจคของคุณได้ที่นี่
];
