# Cosmo FT Caller Static Page

There are two interface provided by the project under the view folder. 


* **admin.html** provides interface for the deployer / owner of the contract to manage token and product store. You need to deploy the contract on testnet for using this interface. 


* **customer.html** provides interface for the customers to interact with the store and use their reward tokens. 

## Deploy contract on testnet
* Set up the stacks wallet by following guide at https://bitbucket.org/tintash/clarity-projects/src/main/003-ft/Stacks-Wallet.md
* Switch to testnet network in the wallet 
* Replace the hardcoded stacks address in your contract with your testnet address
* In your project directory create ```settings/Testnet.toml``` 
```
[network]
name = "testnet"
node_rpc_address = "https://stacks-node-api.testnet.stacks.co"

[accounts.deployer]
mnemonic = "[your mnemonic]"
```
* Run ```clarinet deploy --testnet``` to deploy contract on test. It will provide the transaction id which can be used to see contract in stacks explorer.



## WebPack Configuration

https://webpack.js.org/guides/getting-started/


https://www.codeinwp.com/blog/webpack-tutorial-for-beginners/

Configuration with Typescript 
https://webpack.js.org/guides/typescript/

Configuration for multiple bundles 
https://webpack.js.org/guides/output-management/

Resolving Errors
https://stackoverflow.com/questions/68707553/uncaught-referenceerror-buffer-is-not-defined

## Configuring Hiro Wallet
https://docs.stacks.co/build-apps/guides/authentication

## Using [@stacks/connect]('https://github.com/blockstack/connect') for calling functions 
https://docs.stacks.co/build-apps/guides/transaction-signing#prompt-to-execute-contract

## Starting the project 
* Navigate to ft-caller-static-page 
* Replace ```deployerAddress, tokenContractName, storeContractName``` in ```commonFunctions.ts``` with your own values in case of interacting with the admin interface. 
* Run ```npm install```
* Run ```npm start```
* Move to ```http://localhost:5000/view/``` for interacting with the interface