// function errorHandler(err, req, res, next) {
//   if (err.name === "UnauthorizedError") {
//     return res.status(401).send({ message: "No Token Provided" });
//   }

//   if (err.name === "ValidationError") {
//     return res.status(401).send({ message: err });
//   }

//   return res.status(500).send(err);
// }

// module.exports = errorHandler;
