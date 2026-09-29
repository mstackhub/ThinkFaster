const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Add CORS and Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Handle URL Rewrites
  if (pathname === '/') {
    pathname = '/index.html';
  } else if (pathname === '/projects') {
    pathname = '/projects.html';
  } else if (pathname === '/contact') {
    pathname = '/contact.html';
  } else if (pathname === '/about') {
    pathname = '/about.html';
  } else if (pathname === '/privacy') {
    pathname = '/privacy.html';
  } else if (pathname === '/terms') {
    pathname = '/terms.html';
  } else if (pathname === '/admin' || pathname === '/admin/') {
    pathname = '/admin/index.html';
  } else if (pathname === '/admin/login') {
    pathname = '/admin/login.html';
  } else if (pathname === '/admin/projects') {
    pathname = '/admin/projects.html';
  } else if (pathname === '/admin/project-form') {
    pathname = '/admin/project-form.html';
  } else if (pathname === '/admin/categories') {
    pathname = '/admin/categories.html';
  } else if (pathname === '/admin/settings') {
    pathname = '/admin/settings.html';
  } else if (pathname.startsWith('/project/')) {
    const slug = pathname.replace('/project/', '').replace(/\/$/, '');
    // Check if static project dir exists
    const staticDirIndex = path.join(BASE_DIR, 'project', slug, 'index.html');
    if (fs.existsSync(staticDirIndex)) {
      pathname = `/project/${slug}/index.html`;
    } else {
      pathname = '/project.html';
    }
  }

  // Handle nested asset paths from admin or subdirectories
  if (pathname.includes('/assets/')) {
    pathname = pathname.substring(pathname.indexOf('/assets/'));
  }

  let filePath = path.join(BASE_DIR, pathname);

  // If directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Serve file or 404
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const notFoundPath = path.join(BASE_DIR, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFoundPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

const net = require('net');

function findAvailablePort(startPort, callback) {
  const tester = net.createServer();
  tester.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      findAvailablePort(startPort + 1, callback);
    } else {
      callback(err);
    }
  });
  tester.once('listening', () => {
    tester.close(() => {
      callback(null, startPort);
    });
  });
  tester.listen(startPort, '0.0.0.0');
}

findAvailablePort(PORT, (err, availablePort) => {
  if (err) {
    console.error('Failed to find open port', err);
    process.exit(1);
  }
  server.listen(availablePort, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 ThinkFaster Web Server is running!`);
    console.log(`   ➜ Website:  http://localhost:${availablePort}`);
    console.log(`   ➜ Admin:    http://localhost:${availablePort}/admin/login.html`);
    console.log(`==================================================\n`);
  });
});
