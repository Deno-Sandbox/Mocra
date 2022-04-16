import { Response } from "https://deno.land/std@0.104.0/http/server.ts";
import { sha512 } from "https://denopkg.com/chiefbiiko/sha512/mod.ts";


const salt = "hbygiuBygiuBYGtvtyubhUYVGYIbvyugBvyygujYTygjbh";
const privSalt = "IhbiunjpiuhMOIUHijhnIUh";

export class user {
    private userDB = []

    /*
    User have: 
    - username
    - email
    - private key
    - recovery phrase
    */

    constructor(){
        try{
            this.userDB = JSON.parse(Deno.readTextFileSync("./db/users.json"))
        } catch(err){}
        this.saveUserDB()

        setInterval(() => {
            this.saveUserDB()
        }, 1000 * 60)
    }

    private saveUserDB() {
        Deno.writeTextFileSync("./db/users.json", JSON.stringify(this.userDB))
    }

    //API PART

    async main(request){
        let response:Response = {}

        if(request.method == "POST"){
            try{
                let body = await Deno.readAll(request.body)
                let data = JSON.parse(new TextDecoder().decode(body))


                if(request.url == "/user/register"){
                    response = await this.createUser(data)
                }


            } catch(err){
                response.status = 500
                response.body = {
                    error: true,
                    message: "Internal server error"
                }
            }
        } else {
            response.status = 405
            response.body = {
                error: true,
                message: "Method not allowed"
            }
        }

        response.body = JSON.stringify(response.body)

        return response
    }


    //administrative part
    private async createUser(data){
        let response:Response = {}

        try{
            if(!data.username || !data.email){
                response.status = 400
                response.body = "Bad request"
            } else {
                let user = this.userDB.find(user => user.username == data.username)
                if(user){
                    response.status = 409
                    response.body = {
                        error: true,
                        message: "Username already exists"
                    }
                } else {
                    let newUser = {
                        username: data.username,
                        email: data.email,
                        publicKey: this.generatePublicKey(),
                        privateKey: this.generatePrivateKey(data.username),
                        recoveryPhrase: this.generateRecoveryPhrase()
                    }
                    this.userDB.push(newUser)
                    response.status = 201
                    response.body = {
                        error: false,
                        message: "User created",
                        user: {
                            username: newUser.username,
                            email: newUser.email,
                            publicKey: newUser.publicKey,
                            privateKey: newUser.privateKey,
                            recoveryPhrase: newUser.recoveryPhrase,
                            allowKey: sha512(newUser.privateKey + privSalt, "utf8", "hex")
                        }
                    }
                }
            }
        } catch(err){
            console.log(err)
            response.status = 500
            response.body = {
                error: true,
                message: "Internal server error"
            }
        }


        return response
    }

    public getPublicKey(priv){
        let user = this.userDB.find(user => user.privateKey == priv)
        if(user){
            return user.publicKey
        }
        return null
    }


    public didAuthIsValid(key){
        let user = this.userDB.find(user => user.privateKey == key)
        if(user){
            return true
        } else {
            return false
        }
        return false
    }


    //utils part
    private generatePrivateKey(username){
        let str = username + salt
        return sha512(str, "utf8", "hex")
    }

    private generateRecoveryPhrase(){
        let str = ""
        for(let i = 0; i < 12; i++){
            let randomNumber = Math.floor(Math.random() * (10 - 1)) + 1
            str+= this.randomString(randomNumber)+""
        }
        //remove last character
        str = str.substring(0, str.length - 1)
        return str
    }

    private generatePublicKey(){
        return this.randomString(13)+"."+this.randomString(13)
    }


    private randomString(length) {
        var result = [];
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
        }
        return result.join('');
    }

}