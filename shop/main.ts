import { Response } from "https://deno.land/std@0.104.0/http/server.ts";

export class SHOP {
    //shop is the main shop manager
    private produits = []

    constructor() {
        try{
            this.produits = JSON.parse(Deno.readTextFileSync("./db/produits.json"))
        } catch(err){}
        setInterval(() => {
            this.saveProduits()
        }, 60*1000)
    }

    private saveProduits() {
        Deno.writeTextFileSync("./db/produits.json", JSON.stringify(this.produits))
    }

    //manager
    public async main(request){
        let response:Response = {}
        if(request.method == "GET"){
            if(request.url == "/shop/get"){
                //return 20 first produits
                response.body = this.produits.slice(0, 20)
            } else if(request.url.startsWith('/shop/search/')){
                //return produits with name like request.headers.get(search)
                if(request.headers.get("search")){
                    response.body = (this.produits.filter(p => p.name.toLowerCase().includes(request.headers.get("search").toLowerCase()))).slice(0, 50)
                } else {
                    response.status = 400
                    response.body = {
                        error: true,
                        message: "Bad request"
                    }
                }
            } else if(request.url.startsWith('/shop/infos/')){
                //return produit with key request.url.split('/')[3]
                response.body = (this.produits.filter(p => p.key == request.url.split('/')[3])).slice(0, 1)
            }
        } else {
            response.status = 404
        }

        response.body = JSON.stringify(response.body)
        return response
    }
}