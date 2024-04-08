const express = require ("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require ("dotenv/config");
const authJwt = require('./helpers/jwt');

app.use(cors());
app.options('*', cors());


const api = process.env.API_URL;


const productRouter = require("./routers/products");
const categoryRouter = require("./routers/categories");
const OrderRouter = require("./routers/orders");
const userRouter = require("./routers/users");


// pasword
// k3CQQalQBS0uxyzl

// Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt()); //it is for the toke authentication

// Routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/orders`, OrderRouter);
app.use(`${api}/users`, userRouter);



mongoose.connect(process.env.CONNECTION_STRING).then(()=> {
    console.log("Connected to Database");
}).catch((err) => {
    console.log(err);
})


app.listen(3000, () => {
    console.log("server is running: http://localhost:3000");
});