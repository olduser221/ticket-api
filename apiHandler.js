const { exec } = require("child_process");
var express = require("express");
var app = express();
var http = require('http').createServer(app);
const bodyParser = require('body-parser');
const request = require('request-promise').defaults({jar: true, timeout: 3000, resolveWithFullResponse: true});
const cheerio = require('cheerio');
const fs = require('fs');

const { Webhook, MessageBuilder } = require('discord-webhook-node');
const hook = new Webhook("https://discordapp.com/api/webhooks/700582606596603914/9vY2iynX9BEIlUCWjCBDp4aSK1mVTl9_bAHvkg2xbEyY_q2LAQ-c-7DdVFjvLCHzPMs3");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

class Monitor {
    constructor () {
        this.options = {
            url: 'https://www.supremenewyork.com/mobile',
            proxy: 'http://sup-us-1.resdleafproxies.com:11570',
            headers: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/84.0.271182770 Mobile/15E148 Safari/605.1',
                'cache-control': 'none'
            }
        }

        this.wasm_url
        this.js_url
    }

    get_links() {
        return ({
            javascript: this.js_url,
            wasm: this.wasm_url
        })
    }

    async sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async send_notification () {

        let embed = new MessageBuilder()

        embed.setTitle('New ticket files detected!')
        embed.addField('**JAVASCRIPT**', this.js_url, false)
        embed.addField('**WASM**', this.wasm_url, false)
        embed.addField('**TIMESTAMP**', Date.now(), false)
        embed.setFooter("Phase Ticket Monitor")
        embed.setTimestamp()
        
        hook.send(embed)

    }

    async fetch_wasm () {
        return request.get({
            url: this.wasm_url,
            proxy: 'http://sup-us-1.resdleafproxies.com:11570',
            headers: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/84.0.271182770 Mobile/15E148 Safari/605.1',
                'cache-control': 'none'
            },
            encoding: null
        }).then(async (response) => {
            try {
                fs.writeFileSync('./ticket.wasm', response.body, 'binary')
                return true
            } catch (error) {
                return undefined
            }
        }).catch((err) => {
            return undefined
        })
    }

    async fetch_supreme () {
        return request.get(this.options).then((response) => {
            try {

                let $ = cheerio.load(response.body)

                var scripts = $('script')
                for (var i = 0; i < scripts.length; i++) {
                    if (scripts[i].children[0].data.trim().includes('.wasm')) {
                        let wasm = scripts[i].children[0].data.trim()
                        wasm = wasm.substring(wasm.indexOf('"h') + 1, wasm.indexOf('";'))
                        if (wasm !== this.wasm_url) {
                            for (let x = 0; x < scripts.length; x++) {
                                if (scripts[x].attribs.src) {
                                    if (scripts[x].attribs.src.replace('.js', '') === wasm.replace('.wasm', '')) {
                                        this.js_url = scripts[x].attribs.src
                                        console.log(`New js file: ${scripts[x].attribs.src}`)
                                    }
                                }
                            }
                            console.log(`New wasm file: ${wasm}`)
                            this.wasm_url = wasm
                            return "new"
                        } else {
                            return "old"
                        }
                    }
                }

            } catch (error) {
                return undefined
            }
        }).catch((err) => {
            return undefined
        })
    }

    async handler () {
        while(true) {

            let sup_resp = await this.fetch_supreme()

            if (sup_resp === "new") {
                // this.send_notification()
                let wasm_resp = false
                while(wasm_resp === false) {
                    wasm_resp = await this.fetch_wasm()
                }
            } else if (sup_resp === "old") {
                await this.sleep(15000)
            } else {
                await this.sleep(5000)
            }

        }
    }
}

let main_monitor = new Monitor
main_monitor.handler()

http.listen(1337, 'localhost',function(){
    //console.log("Pooky server running.\n");
})

app.get('/gen', async (req, res) => {
    let respBody

    if (req.query.ticket) {
        exec(`node ticket.js ${req.query.ticket}`, (error, stdout, stderr) => {
            if (error) {
                respBody = {
                    status: "failed",
                    timestamp: Date.now()
                }
            }
            if (stderr) {
                respBody = {
                    status: "failed",
                    timestamp: Date.now()
                }
            }
            else {
                respBody = {
                    status: "success",
                    type: "checkout",
                    _ticket: stdout.substring(stdout.indexOf('=') + 1, stdout.indexOf(';')),
                    ticket: req.query.ticket,
                    timestamp: Date.now()
                }
            }
            res.json(respBody);
            return stdout;
        });
    } else {
        exec(`node ticket.js`, (error, stdout, stderr) => {
            if (error) {
                respBody = {
                    status: "failed",
                    timestamp: Date.now()
                }
            }
            if (stderr) {
                respBody = {
                    status: "failed",
                    timestamp: Date.now()
                }
            }
            else {
                respBody = {
                    status: "success",
                    type: "checkout",
                    _ticket: stdout.substring(stdout.indexOf('=') + 1, stdout.indexOf(';')),
                    ticket: req.query.ticket,
                    timestamp: Date.now()
                }
            }
            res.json(respBody);
            return stdout;
        });
    }
});

app.get('/latest', async (req, res) => {
    let respBody = main_monitor.get_links();
    res.json(respBody);
});