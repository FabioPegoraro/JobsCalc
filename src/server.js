const express = require("express")
const server = express()
const routes = require("./routes")
const path = require("path")

// usando template engine
server.set('view engine', 'ejs')

//Mudar a localização da pasta views

server.set('views', path.join (__dirname, "/views/"))

// Habilitar arquivos estaticos
server.use(express.static("public"))

//usar o req.body
server.use(express.urlencoded({ extended: true }))

server.use(routes)
//routes

// Iniciando o servidor
server.listen(3000, () => console.log("Rodando"))
