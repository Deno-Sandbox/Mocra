# API



## User 

### Register

||| General Request
URL: /user/register
Method: POST
Body: 
```json
{
    "username": "",
    "email": ""
}
```
||| Response
```json
{
    "error": false,
    "message": "User created",
    "user": {
        "username": "your username",
        "email": "your email",
        "publicKey": "your public key"
        "privateKey": "your auth private key (use it with certified services)",
        "recoveryPhrase": "your recovery phrase (keep it secret)",
        "allowKey": "your auth key for actions"
    }
}
```
|||


## Shop
| Request | Method | Response |
| :------ | :----- | :------- |
| /shop/get | GET | les 20 premiers produits |
| /shop/search/ | GET {search:value} | les 50 premiers resultats de recherche |
| /shop/infos/${key} | GET | les infos d'un produits