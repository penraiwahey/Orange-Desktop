const rules = require("./webpack.rules");

// เพิ่ม CSS loader (สำหรับไฟล์ CSS ที่ไม่จำกัดแค่ในโฟลเดอร์ที่ include ไว้ใน webpack.rules.js)
rules.push({
  test: /\.css$/i,
  use: [
    "style-loader",
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [require("tailwindcss"), require("autoprefixer")],
        },
      },
    },
  ],
});

// เพิ่ม asset loader สำหรับรูปภาพ
rules.push({
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: "asset/resource",
});

module.exports = {
  module: {
    rules, // รวมกฎทั้งหมดใน array
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
};
