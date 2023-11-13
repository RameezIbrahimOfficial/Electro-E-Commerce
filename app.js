const express = require('express');
const path = require('path');
const { userRouter, adminRouter } = require('./Routes');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT;
const MONGO_CON_STR = process.env.MONGO_CON_STR;
const MONGO_CON_STR_ATLAS = process.env.MONGO_CON_STR_ATLAS;

app.set('view engine', 'ejs')
app.set('views', [path.join(__dirname, "views/user"), path.join(__dirname, "views/admin")])

// app.use(morgan('dev'))
app.use('/', userRouter)
app.use('/admin', adminRouter)
app.use(express.static('public'))
app.use('/Public', express.static('Public'));


app.listen(PORT, async (req, res) => {
    try {
        await mongoose.connect(MONGO_CON_STR, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log("SERVER STARTED")
        console.log(`http://127.0.0.1:${PORT}`)
    } catch (error) {
        console.log(error)
    }
})

