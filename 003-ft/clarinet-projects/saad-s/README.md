## Fungible tokens example 

This example implements SIP10 fungible token trait to create referral rewards. These reward tokens are transferred to referrers after new users signup and perform certain number of transactions.   

Example contains a contract and a SIP-10 FT trait.  

### Files  

- **contracts/ft-traits.clar** 
    * defines traits for fungible tokens   
- **contracts/refer-reward-ft.clar**
    * implements ft-traits for refer-reward tokens
    * offers functions like signup, complete-transactions  
- **tests/*.ts**
    * contains test cases

### Testnet deployment

|Contract | Address|
|:---------|:--------|
|ft-trait | `ST2V7C1FR46HSV42S5XCZNJ80XE513E9526DGSC6E.ft-trait`|
|refer-reward-ft | `ST2V7C1FR46HSV42S5XCZNJ80XE513E9526DGSC6E.refer-reward-ft`|

### Flow 

Existing users can invite new users to system. While inviting new user, referrer shares its address with new user. On registration, user inputs name, address and referrer's address . Reward is only offered to referrer, if new user makes certain number of transactions in ssytem. Details of transactions are out of scope of this example. Currently transaction number is set to 1, for simplicity. Once user performs certain number of transactions, contract automatically sends refer reward tokens to referrer and finally removes it from user's stored info.  

***User registration flow is described in following***
![Sequence Diagram](diagrams/signup.png)

***Transactions and rewards flow***
![Sequence Diagram](diagrams/transactions-reward.png)

### Design key points 

- One User can invite multiple new users and will be rewarded for each one
- A user cannot refer her/himself
- Once a referrer is rewarded for a new user, its principal is removed from new user's info map
- Transactions are not reverted if refer-reward fails for any reason