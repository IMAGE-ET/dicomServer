
import bodyParser from 'body-parser'

import index_router from './app/routes/index_router'

import express from 'express'
const app = express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(express.static(__dirname+'/public'))
app.use(express.static(__dirname+'/node_modules'))

app.use(index_router)

app.listen(8080,() => {
  console.log('server started')
})