const http = require('http');

const hostname = '0.0.0.0';
const port = 8080;

if (process.env.ENVIRONMENT === 'prod') {	
    process.exit(1);	
}

const server = http.createServer((_, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html lang="en"> \
  <head> \
      <title>mb-service-3</title> \
  </head> \
  <body style="background-color:CornflowerBlue;"> \
      <h1>Hello, you have reached mb-service-3!</h1> \
      <h1>Version: V1</h1>  \
  </body> \
   </html>');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


