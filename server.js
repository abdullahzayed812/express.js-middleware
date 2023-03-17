const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const { logger } = require("./middleware/logEvents");
const { errorHandler } = require("./middleware/errorHandler");
const PORT = process.env.PORT || 3500;

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
const whitelist = [
  "http://www.yoursite.com",
  "https://www.google.com",
  "http://127.0.0.1:5500",
  "http://localhost:3500",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

/* 
  This is a built-in middleware, 
  it parses incoming request with urlencoded payloads and based on body parser
*/
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// built-in middleware for server static files
app.use(express.static(path.join(__dirname, "public")));

app.get("^/$|/index(.html)?", (request, response) => {
  response.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/home(.html)?", (request, response) => {
  response.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/old(.html)?", (request, response) => {
  response.redirect(301, "/home.html");
});

// Route handler
app.get(
  "/hello(.html)?",
  (request, response, next) => {
    console.log("Attempted to load hello.html");
    next();
  },
  (request, response) => {
    console.log("I'm the second middleware");
  }
);

// Chaining more route handler
const one = (request, response, next) => {
  console.log("First middleware route handler");
  next();
};

const two = (request, response, next) => {
  console.log("Second middleware route handler");
  next();
};

const three = (request, response, next) => {
  console.log("third middleware route handler");
  next();
};

app.get("/chain", [one, two, three]);

app.all("*", (request, response) => {
  response.statusCode = 404;
  if (request.accepts("html")) {
    response.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (request.accepts("json")) {
    response.json({ error: "404 Not Found" });
  } else {
    response.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server listen in port ${PORT}`));
