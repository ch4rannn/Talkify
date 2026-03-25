import { spawn } from 'child_process';
import fs from 'fs';

const child = spawn('railway', ['login', '--browserless'], { shell: true });

child.stdout.on('data', (data) => {
  const str = data.toString();
  const match = str.match(/https:\/\/railway\.com\/cli-login\?d=[a-zA-Z0-9=_-]+/);
  if (match) {
    fs.writeFileSync('railway_link.txt', match[0]);
    console.log("FOUND LINK:", match[0]);
    // Leave the child running so the auth process doesn't die!
  }
});

child.stderr.on('data', (data) => {
  console.log(data.toString());
});
