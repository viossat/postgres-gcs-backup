const {spawn} = require('child_process');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
const filename = new Date().toISOString().substr(0, 19) + '.sql';
const file = bucket.file(filename);

let size = 0;
const stream = file.createWriteStream({
  resumable: false,
}).on('error', err => {
  console.error(err);
}).on('finish', () => {
  console.log('dump ' + filename + ' saved (' + size + ' bytes)');
});

const dump = spawn('pg_dump');
dump.stdout.on('data', data => {
  size += data.length;
  stream.write(data);
});
dump.stderr.on('data', data => {
  console.error(data.toString());
});
dump.on('error', err => {
  console.error(err);
});
dump.on('close', code => {
  stream.end();
  if (code !== 0) {
    console.error('pg_dump exited with code ' + code);
  }
});
