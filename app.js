const express = require('express')
const dotenv = require('dotenv')
const console = require('console')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')

//load config
dotenv.config({path: './config/config.env'})

//passport config
require('./config/passport')(passport)

connectDB()

const app = express()

//body parser
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

// method overide
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))


// login
if (process.env.NODE_ENV === 'developement'){
    app.use(morgan('dev'))
}

// helper handle bar
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')

//handlebars
app.set('view engine', '.hbs')
app.engine('hbs', exphbs({
    helpers:{
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select
    },
    extname: 'hbs', 
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir  : [
        //  path to your partials
        path.join(__dirname, 'views/partial'),
    ]
}));

//session middleware
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL
          })
    })
)

//passport middel ware
app.use(passport.initialize())
app.use(passport.session())

// set global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

// static folder
app.use(express.static(path.join(__dirname, 'public')))

// routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const PORT = process.env.PORT || 3000


app.listen(
    PORT,
    console.log(`server running on port ${PORT}`)
)
