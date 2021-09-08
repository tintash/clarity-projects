# Cosmo FT Backend Interface 

## Configurations 

Create ```.env``` file in the ft-interface-backend folder according to the given sample. 
```
DEPLOYER_ADDRESS = ST3F9BYX07T0Q51JT2YVXT532BNZGY78KT7ZMH6KK
DEPLOYER_PRIVATE_KEY = e881ba3b27be35fbe97fc817e472222e5a3ce0a1c167b48bf44ef54961a4924b05
SENDER_ADDRESS = ST1ABV23F0DXCEAFBYBHAX9T2NM51MC19Q466JDY9
SENDER_PRIVATE_KEY = e4123358bc2d847ef3f77e87d043d8eb292fbaf2888475a7653544650370b5e801
PORT = 8080
``` 


Run ```stx make_keychain [mnemonics] -t``` to get private key for your  testnet account. 



## Starting the project 

* Navigate to ft-interface-backend folder
* Run ```npm install```
* Run ```npm start```
