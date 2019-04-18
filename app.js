'use strict';

const express = require('express');
const jsReport = require('jsreport');
const app = express();
const reportingApp = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV !== 'development') {
  app.use('/reporting', reportingApp);
}

const server = app.listen(PORT, () => {
  console.log('server running at http://%s:%s\n', server.address().address, server.address().port);
});

const jsreport = jsReport({ extensions: { express: { app: reportingApp, server: server } }, appPath: '/reporting' });

jsreport.init()
  .then(() => {
    console.log('jsreport server started at http://%s:%s\n', server.address().address, server.address().port);
    jsReportStart(server, app, jsreport);
  }).catch((e) => {
    console.error('jsreport server not started ---> ', e);
  });

app.get('/', (req, res) => {
  res.send('Hello from the main application');
});

function jsReportStart(server, app, jsreport) {

  console.log('jsreport api started at [GET] http://%s:%s/api/reports\n', server.address().address, server.address().port);

  app.get('/api/reports', (req, res) => {
    jsreport.render({
      template: {
        content: "<h1>Hello world</h1>",
        recipe: "chrome-pdf",
        engine: "handlebars",
        chrome: {
          headerTemplate: "<p>some header</p>",
          width: "300px"
        }
      },
      data: { name: "jsreport" }
    }).then((out) => {
      out.stream.pipe(res);
    }).catch((e) => {
      res.end(e.message);
    });
  });
}

