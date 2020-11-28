const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  //Handling Exceptions and Rejections and logging them in a file
  winston.add(
    new winston.transports.File({
      filename: "uncaughtExceptions.log",
      handleExceptions: true,
      handleRejections: true,
      level: "error",
    })
  );

  //Handling Exceptions and Rejections and logging them in the database
  winston.add(
    new winston.transports.MongoDB({
      db: "mongodb://localhost/vidly",
      handleExceptions: true,
      handleRejections: true,
    })
  );

  winston.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint()
      ),
      handleExceptions: true,
      handleRejections: true,
    })
  );
};
