const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const path = require('path')
const bodyparser = require('body-parser')
const session = require('express-session')
const nocache = require("nocache")
const mongoose = require("mongoose");
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin')
const { v4: uuidv4 } = require('uuid')
const dbConnect = require('./config/dbConnect')


dbConnect();


const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

app.use(nocache());


app.use('/', express.static(path.join(__dirname, 'public')))
// app.use('/img',express.static(path.join(__dirname,'public/img')))


// --- Session
app.use(
   session({
      secret: uuidv4(),
      resave: false,
      saveUninitialized: true,
   })
)



app.use('/', userRoute);

app.use('/admin', adminRoute)

// catch 404 page handler
app.use(function (req, res, next) {
   next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
   res.locals.message = err.message;
   res.locals.error = req.app.get("env") === "development" ? err : {};
   res.status(err.status || 500)
   res.render('user/error')
});



app.listen(PORT, () => {
   console.log(`server is running at port ${PORT}`);
})