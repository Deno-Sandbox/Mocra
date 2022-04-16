import { Response } from "https://deno.land/std@0.104.0/http/server.ts";

import { user } from "../user/main.ts";
const ins_user = new user()

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
                response.body = this.produits.filter(p => !p.hidden && !p.private.enable).slice(0, 20)
            } else if(request.url.startsWith('/shop/search/')){
                //return produits with name like request.headers.get(search)
                if(request.headers.get("search")){
                    response.body = (this.produits.filter(p => p.name.toLowerCase().includes(request.headers.get("search").toLowerCase()))).filter(p => !p.hidden && !p.private.enable).slice(0, 50)
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
        } else if(request.method == "POST"){
            try{
                let body = await Deno.readAll(request.body)
                let data = JSON.parse(new TextDecoder().decode(body))

                if(request.url == "/shop/create"){
                    response = await this.createProduit(data)
                }

            } catch(err){
                console.log(err)
                response.status = 500
                response.body = {
                    error: true,
                    message: "Internal server error"
                }
            }
        } else {
            response.status = 404
        }

        response.body = JSON.stringify(response.body)
        return response
    }


    // Produits
    /*
        - create produits
        - update produits
        - delete produits
    */

    /*
    Produits type
    {
        "name": "",
        "description": "",
        "price": 0,
        "key": "",
        "images": [],
        "stock": 0,
        "categories": [],
        "hidden": false,
        "private": {
            "enable": false,
            "password": ""
        },
        "lastUpdate": "",
        "authorkey": ""
    }
    */

    private async createProduit(data){
        let response:Response = {}
        console.log(data)

        if(data.name.length > 0 && data.description.length > 0 && data.price >= 0 && data.images.length > 0 && data.stock >= 0 && data.categories.length > 0 && data.authorkey.length > 0){
            //only keep the 35 first characters from name
            data.name = data.name.slice(0, 35)
            //only keep the 500 first characters from description
            data.description = data.description.slice(0, 500)
            //generate a key
            data.key = this.generateKey()
            //only keep 10 first images
            data.images = data.images.slice(0, 10)
            //only keep 20 first categories
            data.categories = data.categories.slice(0, 20)
            //set last update to now
            data.lastUpdate = new Date().toISOString()
            //check price >= 0
            if(data.price < 0){
                data.price = 0
            }
            if(data.stock < 0){
                data.stock = 0
            }

            if(data.hidden == undefined){
                data.hidden = false
            }

            if(data.private == undefined){
                data.private = {
                    enable: false,
                    password: ""
                }
            } else {
                if(data.private.enable == undefined){
                    data.private.enable = false
                }
                if(data.private.password == undefined){
                    data.private.password = "1234"
                }
            }

            //get the public key from the authorkey 
            let publicKey = await ins_user.getPublicKey(data.authorkey)
            if(publicKey == null){
                //invalid user
                response.status = 400
                response.body = {
                    error: true,
                    message: "Invalid user"
                }
            } else {
                let produit = this.newProduit(data.name, data.description, data.price, data.key, data.stock, data.categories, data.lastUpdate, publicKey, data.hidden, data.private.enable, data.private.password)
                this.produits.push(produit)
                response.body = {
                    error: false,
                    message: "Produit created",
                    produit: produit
                }
            }
            
        } else {
            response.status = 400
            response.body = {
                error: true,
                message: "Bad request"
            }
        }


        return response
    }


    private newProduit(name, description, price, key, stock, categories, lastUpdate, authorkey, hidden, privateData, privatePassword){
        return {
            name: name,
            description: description,
            price: price,
            key: key,
            images: [],
            stock: stock,
            categories: categories,
            lastUpdate: lastUpdate,
            authorkey: authorkey,
            hidden: hidden,
            private: {
                enable: privateData,
                password: privatePassword
            }
        }
    }


    //utils
    private generateKey(){
        return ins_user.randomString(17)
    }
}