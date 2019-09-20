const express = require('express');
const fileUpload = require('express-fileupload');

const UPLOADS_DIR = 'uploads/';
const STATICS_DIR = 'public/';
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const app = express();
app.use(express.static(STATICS_DIR));
app.use('/' + UPLOADS_DIR, express.static(UPLOADS_DIR));

app.use(fileUpload({
  limits: { fileSize: MAX_FILE_SIZE },
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));


app.post('/upload', function(req, res) {
  const { files } = req;
  if (!files || Object.keys(files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const { file } = files;
  const path = UPLOADS_DIR + file.name;
  file.mv(path, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.send(path);
  });
});

app.listen(8081);
