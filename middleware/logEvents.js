const { v4: uuid } = require("uuid");

const fsPromises = require("fs").promises;
const fs = require("fs");
const path = require("path");

const logEvents = async (message, logFileName) => {
  const dateTime = new Date().toLocaleString();
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem,
      { encoding: "utf-8" }
    );
  } catch (error) {
    console.log(error);
  }
};

const logger = (request, response, next) => {
  logEvents(
    `${request.method}\t${request.headers.origin}\t${request.url}`,
    "reqLog.txt"
  );
  console.log({
    requestMethod: request.method,
    requestHeaderOrigin: request.headers.origin,
    requestUrl: request.url,
  });
  next();
};

module.exports = { logger, logEvents };
