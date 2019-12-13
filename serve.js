const express = require('express');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.static('public')); // 設置靜態資源目錄
app.get('/', (req, res) => {
  res.sendfile('./public/');
});

app.listen(process.env.PORT || 3000);