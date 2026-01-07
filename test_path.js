
import path from 'path';

const url = 'http://localhost:5000/uploads/user123/file.pdf';
console.log('URL:', url);
console.log('path.basename:', path.basename(url));
console.log('path.win32.basename:', path.win32.basename(url));
console.log('path.posix.basename:', path.posix.basename(url));
