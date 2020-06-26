window.wasmbinsrc = "https://www.supremenewyork.com/ticket.wasm";
window.navigator = {userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"};
window.document = {cookie: ""};
let wasm

let genType, lastTicket

if (Deno.args[0]) {
    genType = "checkoutGen"
    document.cookie = 'ticket=' + Deno.args[0] + ';path=/'
    setInterval(() => { if (document.cookie !== 'ticket=' + Deno.args[0] + ';path=/') { 
        console.log(document.cookie.substring(document.cookie.indexOf("=") + 1, document.cookie.indexOf(";"))); 
        Deno.exit(); }}, 5);
} else {
    genType = "atcGen"
    setInterval(() => {  if (document.cookie.length > 0 && document.cookie !== lastTicket) { 
        console.log(document.cookie)
        lastTicket = document.cookie; }}, 5);
}

try {
    %CODEHERE%
} catch (error) {
    console.log(error)
    Deno.exit()
}