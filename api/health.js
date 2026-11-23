module.exports = (request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.statusCode = 200;
  response.end(JSON.stringify({ status: 'ok' }));
};
