const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)
const router = require('./routes/index');
const connectDB = require('./config/db');
const flash = require('connect-flash');

// load config
dotenv.config({ path: './config/config.env' });

//Passport config
require('./config/passport')(passport);

connectDB();
const app = express();

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Method Override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body){
    let method = req.body._method
    delete req.body._method
    return method
  }
}));

//logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
// Handlebars Helpers
// const { formatDate, stripTags, truncate, editIcon, select }
const { formatDate , stripTags, truncate, editIcon, select} = require('./helpers/hbs')

//Handlebars
app.engine('.hbs', exphbs({
  helpers: {
    formatDate,
     stripTags,
     truncate,
     editIcon,
     select,
  },
  defaultLayout: 'main',
  extname: '.hbs'
})
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

//session
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

//Passport middleware 
app.use(passport.initialize());
app.use(passport.session());


//middleware for connect flash
app.use(flash());

//setting up messages globally
app.use((req, res, next) => {
  res.locals.success_msg = req.flash(('success_msg'));
  res.locals.error_msg = req.flash(('error_msg'));
  res.locals.error = req.flash(('error'));
  res.locals.currentUser = req.user;
  next();
})

//set user globally
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})


// static folder
app.use(express.static('public'));

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT} `))