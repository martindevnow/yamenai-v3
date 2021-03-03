require("source-map-support").install();
require("dotenv").config();
require("ts-node").register({
  files: true, // so that TS node hooks have access to local typings too
});

process.env.GATSBY_DEPLOY_DATE = new Date().toString();

module.exports = require("./src/gatsby/config").default;
