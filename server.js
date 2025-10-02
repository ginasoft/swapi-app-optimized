const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, 'dist'), {
  etag: true,
  maxAge: '365d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listo → http://localhost:${PORT}`);
});
