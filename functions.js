const spawn = require('child_process').spawn
const execa = require('execa');
const fetch = require('node-fetch')
const fs = require('fs')
const kill  = require('tree-kill');
const EventEmitter = require('events')
const ee = new EventEmitter().setMaxListeners(1000000)

const usSandbox = fs.readFileSync("./js/us-sandbox.js", "utf-8")
const euSandbox = fs.readFileSync("./js/eu-sandbox.js", "utf-8")

module.exports = {
    
    spawnerUS: async () => {

        let counter = 0;

        try {
            const gen = execa('deno', ['run', '--allow-net', './js/us-ticket.js']);
            gen.stdout.on('data', (data) => {
                atcTicketsUS.push(data.toString().substring(data.toString().indexOf('=') + 1, data.toString().indexOf(';')))
                counter++
    
                if (counter >= 100) {
                    gen.kill('SIGTERM', {
                        forceKillAfterTimeout: 2000
                    });
                    module.exports.spawnerUS()
                }
            }); 
        } catch (error) {
            console.log("error")
        }

    },
      
    spawnerEU: async () => {

        let counter = 0;

        try {
            const gen = execa('deno', ['run', '--allow-net', './js/eu-ticket.js']);
            gen.stdout.on('data', (data) => {
                atcTicketsEU.push(data.toString().substring(data.toString().indexOf('=') + 1, data.toString().indexOf(';')))
                counter++
    
                if (counter >= 100) {
                    gen.kill('SIGTERM', {
                        forceKillAfterTimeout: 2000
                    });
                    module.exports.spawnerEU()
                }
            }); 
        } catch (error) {
            console.log("error")
        }

    },
      
    generateCheckoutUS: async (ticket) => {

        try {
            const {stdout} = await execa('deno', ['run', '--allow-net', './js/us-ticket.js', ticket]);
            return(stdout);
        } catch (error) {
            return(undefined);
        }

    },
      
    generateCheckoutEU: async (ticket) => {

        try {
            const {stdout} = await execa('deno', ['run', '--allow-net', './js/eu-ticket.js', ticket]);
            return(stdout);
        } catch (error) {
            return(undefined);
        }
        
    },

    processJS: async (data) => {
        if (data.region === "us") {
            fetch(data.js)
                .then(res => res.text())
                .then(body => {
                    var output = usSandbox.replace("%WASMURL%", data.wasm).replace("%CODEHERE%", body)
                    fs.writeFileSync('./js/us-ticket.js', output)
                    ee.emit('exitUS', 'test')
                });
        } else {
            fetch(data.js)
                .then(res => res.text())
                .then(body => {
                    var output = euSandbox.replace("%WASMURL%", data.wasm).replace("%CODEHERE%", body)
                    fs.writeFileSync('./js/eu-ticket.js', output)
                    ee.emit('exitEU', 'test')
                });
        }
    },

    processWASM: async (data) => {
        if (data.region === "us") {
            fetch(data.wasm)
                .then(res => res.text())
                .then(body => {
                    fs.writeFileSync('./wasm/us-ticket.wasm', body, 'binary')
                });
        } else {
            fetch(data.wasm)
                .then(res => res.text())
                .then(body => {
                    fs.writeFileSync('./wasm/eu-ticket.wasm', body, 'binary')
                });
        }
    },

    sleep: async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}