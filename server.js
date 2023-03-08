const express = require('express');
const app = express();
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(8080, () => {
  console.log('hello world!');
});

app.get('/pet', (request, response) => {
  response.send('망빙구 페이지에요!');
});

app.get('/beauty', (request, response) => {
  response.send('망빙구 페이지에요!');
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html');
});

app.get('/write', (request, response) => {
  response.sendFile(__dirname + '/write.html');
});

app.post('/add', (request, response) => {
  console.log('request: ', request.body);
  response.send('멍멍');
});
