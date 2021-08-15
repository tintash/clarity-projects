
# Split App

This App shows how to split the data and the rest of code, so that additional functionality can be handled after deployment

# Contracts

The contracts are divided into three parts

* Data Trait
* Data Contract (Containing the data part)
* App Contract (containing the functionality code)

## Data-Trait

It contains the signatures of all the functions that must be implemented by Data-Contract

## Data-Contract

It contains definitions of all the signatures defined in Data-Trait. This contract is responsible for handling all the data of app. 
Only those contracts can call the Data-Contract that are registered with it using 'add-valid-caller()' function. 
Only the Contract owner can register valid callers for this contract

## App-Contract

It uses the Data-Trait by implementing Data-Contract. User uses this contract for performing any operation with data.

## Updated-App-Contract

Once the App-Contract is deployed, it can not be updated, and hence any change needed on data side (through Data Contract) can not be updated in
App Contract. So this new contract is created to use those updated changes and is then deployed.
