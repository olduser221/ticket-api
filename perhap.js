const WORKERS = process.env.WEB_CONCURRENCY || 1
const PORT = process.env.PORT || 5000

const throng = require('throng')
const fastify = require('fastify')({ logger: false })
const path = require('path')
fastify.register(require('fastify-static'), {
  root: path.join(__dirname),
})
const fs = require('fs')
const functions = require('./functions.js')

const db = JSON.parse(fs.readFileSync("db.json", "utf-8"))

const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
global.atcTicketsUS = []
global.atcTicketsEU = []
global.gifts = []

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start)

function start () {
  // Simple redirect to our site if they provide incorrect endpoin
  fastify.get('/', async (request, reply) => {
    reply.redirect('https://perhap.dev')
  })

  // Endpoint for testing performance
  fastify.get('/test', async (request, reply) => {
    reply
      .code(200)
      .send({
          "status": "success"
      })
  })

  // Handler for api calls to /files (Only coming from our monitor server)
  fastify.post('/files', async (request, reply) => {
    await functions.processJS(request.body)
    await functions.processWASM(request.body)
    reply
      .code(200)
      .send({
          "status": "success"
      })
  })

  // Handler for api calls to /gen
  fastify.get('/gen', async (request, reply) => {

    if (db.keys.includes(request.query.key)) {
      if (request.query.region === "us") {

        // Sends analytics to database
        // collection.insertOne({endpoint: "/gen", region: "us", key: request.query.key, timestamp: Date.now()}, (error, result) => {});

        // ATC / Checkout Handler
        if (request.query.ticket) {
          reply
            .code(200)
            .send({
                "status": "success",
                "type": "checkout",
                "_ticket": await functions.generateCheckoutUS(request.query.ticket),
                "ticket": request.query.ticket,
                "userAgent": userAgent,
                "timestamp": Math.floor(Date.now() / 1000)
            })
        } else {
          reply
            .code(200)
            .send({
                "status": "success",
                "type": "atc",
                "_ticket": atcTicketsUS.pop(),
                "userAgent": userAgent,
                "timestamp": Math.floor(Date.now() / 1000)
            })
        }

      } else if (request.query.region === "eu") {

        // Sends analytics to database
        //collection.insertOne({endpoint: "/gen", region: "eu", key: request.query.key, timestamp: Date.now()}, (error, result) => {});
        
        // ATC / Checkout Handler
        if (request.query.ticket) {
          reply
            .code(200)
            .send({
                "status": "success",
                "type": "checkout",
                "_ticket": await functions.generateCheckoutEU(request.query.ticket),
                "ticket": request.query.ticket,
                "userAgent": userAgent,
                "timestamp": Math.floor(Date.now() / 1000)
            })
        } else {
          reply
            .code(200)
            .send({
                "status": "success",
                "type": "atc",
                "_ticket": atcTicketsEU.pop(),
                "userAgent": userAgent,
                "timestamp": Math.floor(Date.now() / 1000)
            })
        }

      } else {
        reply
          .code(200)
          .send({
              "status": "invalid"
          })
      }

    } else {
      reply
        .code(200)
        .send({
            "status": "unauthorized"
        })
    }

  })

  // Server listener / DB connection
  fastify.listen(PORT, '0.0.0.0', async function (err, address) {

    console.log("Ticket API started on port " + PORT)

    if (err) {
      console.log(err)
      process.exit(1)
    }

    // Spawns initial _ticket gens per region
    for (i = 0; i<8; i++) {
      functions.spawnerUS()
      functions.spawnerEU()
      await functions.sleep(250)
    }

    // Checks total amount of stored ticket cookies and purges half the old ones
    setInterval(() => {  
      if (atcTicketsUS.length > 2500) {
        atcTicketsUS = atcTicketsUS.slice(Math.floor(atcTicketsUS.length / 2), atcTicketsUS.length)
      }
      if (atcTicketsEU.length > 2500) { 
        atcTicketsEU = atcTicketsEU.slice(Math.floor(atcTicketsEU.length / 2), atcTicketsEU.length)
      }
    }, 60000);

  })
}