const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const User = require('./models/user')
const Noticia = require('./models/noticia')

const noticias = require('./routes/noticias')
const restrito = require('./routes/restrito')
const auth = require('./routes/auth')
const pages = require('./routes/pages')

const session = require('express-session')
const bodyParser = require('body-parser')


const mongo = process.env.MONGODB || 'mongodb://localhost/noticias'

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(session({ secret: 'fullstark-master'}))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(express.static('public'))

app.use((req, res, next) => {
    if('user' in req.session) {
        res.locals.user = req.session.user
    }
    next()
})

app.use('/restrito', (req, res, next) => {
    if('user' in req.session){
        return next()
    }
    res.redirect('/login')    
})

app.use('/restrito', restrito)
app.use('/noticias', noticias)

app.use('/', auth)
app.use('/', pages)

const createInitialUser = async() =>{
    //const total = await User.count({username: 'carlos'})
    const total = await User.collection.estimatedDocumentCount({username: 'carlosnascimento'})
    console.log(total, 'TOTAL')
    if(total===0){
        const user = new User({
            username: 'carlosnascimento',
            password: 'abc123'
        })
        await user.save()
        console.log('user created')        
    }else{
        console.log('user created skipped')
    }

const noticia = new Noticia({
    title: 'Noticia Pública' + new Date().getTime(),
    content: 'content',
    category: 'public'   
})
await noticia.save()

const noticia2 = new Noticia({
    title: 'Noticia Privada' + new Date().getTime(),
    content: 'content',
    category: 'privada'   
})
await noticia2.save()

}

mongoose
.connect(mongo, { useNewUrlParser: true })
.then(() => {
    createInitialUser()
    app.listen(port, ()=> console.log('Listening...'))
  })
    .catch( e => console.log(e))





