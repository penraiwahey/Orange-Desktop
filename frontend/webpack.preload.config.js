const path = require('path');

module.exports = {
  // ระบุ entry สำหรับ preload file
  entry: './src/preload.js',

  // ตั้งเป้าหมายสำหรับ Electron preload context
  target: 'electron-preload',

  // กำหนด output ที่จะถูก build ลงในโฟลเดอร์ .webpack/preload
  output: {
    filename: 'preload.js',
    path: path.resolve(__dirname, '.webpack', 'preload'),
  },

  // ใส่ module rules สำหรับการแปลงไฟล์ JavaScript ด้วย babel-loader
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};