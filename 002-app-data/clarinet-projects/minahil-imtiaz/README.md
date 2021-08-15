# Split App/Data Contracts

In this contract the data and app contract have been separated. It helps in storing data in a separate contract i.e. data contract and user can query the data using another contract i.e. app contract. In case of bug in the app contract, the data contract separately holds the data and same data contract can be used with an upgraded app contract.

## _product-trait.clar_

It defines the trait followed by a series of function signatures which must be implemented by the contract implementing the trait defined.

## _product-data.clar_

It implements the trait defined in product-trait.clar and allows valid contract callers to perform basic CRUDs on the product.

## _product-app.clar_

It acts as a bridge between user and data contract. When a user calls a function in this contract, it retrieves the result from data contract and passes it to the user.

## _updated-product-app.clar_

It works exactly like product-app just adds the functionality of logging events on the blokchchain along with retrieving result from the data contract.

## Key points

- Use impl-trait function to ensure a contract is properly implementing the trait
- Using dynamic dispatch the app contract can be passed the data contract as function argument
- A map / list of valid contract callers can be maintained in data contract to store which app contracts can call its functions
- Only data contract deployer can add valid app contract callers in the map / list
- The calls from the previous contract was not disallowed because there was no bug in the previous contract, the updated-contract is just providing additional functionality
