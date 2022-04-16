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
const server = serve({ port: 15805 });



async function main(request:any) {
    let response:Response = {}



    return response
}



for await (const request of server) {
    if(["GET", "POST"].includes(request.method)){
        main(request)
    } else {
        request.respond({ status: 418 })
    }
}