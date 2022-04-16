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
        "privateKey": "your auth private key (use it with certified services)",
        "recoveryPhrase": "your recovery phrase (keep it secret)"
    }
}
```
|||