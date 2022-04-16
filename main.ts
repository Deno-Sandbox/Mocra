/*

The node api can be used for: 
- user registration 
- user login
- user data hosting
- user data retrieval
- shop data hosting
- money transfer

*/

import { serve, Response } from "https://deno.land/std@0.104.0/http/server.ts";
const server = serve({ port: 8500 });

import { user } from "./user/main.ts"
const ins_user = new user()

import { SHOP } from "./shop/main.ts"
const ins_shop = new SHOP()

async function main(request:any) {
    let response:Response = {}

    if(request.url.startsWith("/user/")){
        response = await ins_user.main(request)
    } else if(request.url.startsWith("/shop/")){
        response = await ins_shop.main(request)
    } else {
        response.status = 404
    }

    let header = new Headers()
    header.set("Access-Control-Allow-Origin", "*")
    header.set("Content-Type", "application/json")
    response.headers = header

    request.respond(response)
}

console.log("Server started on port 8500");

for await (const request of server) {
    if(["GET", "POST"].includes(request.method)){
        main(request)
    } else {
        request.respond({ status: 418 })
    }
}