const rules = require("./webpack.rules");

// CSS loader
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

// รูปภาพ loader
rules.push({
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: "asset/resource",
});

module.exports = {
  module: {
    rules, // ต้องเป็น array
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
};
