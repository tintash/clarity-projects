## Assignment: 3 Fungible Tokens

The game is that there are managers that can send tokens to its players as reward. If the player scores a goal, the reward of 'x' tokens is sent to him. If the player doesn't score a goal, 'x' tokens are burnt from his account. The players can then use those tokens and transfer between themselves or convert them. They can also see the token information as well. Only the managers are responsible of giving or destroying the tokens if a goal is scored based on random number generator. A manager is added into my-ft manager variable first.

## app.clar

Implements a random number generator. If the random number is greater than the criteria set, the token is transferred to the player's wallet. Else tokens are burnt.

ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK.app

## my-ft.clar

Implements sip-010-trait. A token owner can transfer tokens by calling transfer function. It can also view token properties. A manager can give or burn tokens of players. A player can convert tokens to STX following the conversion e.g 1 STX = 1000 tokens. Initially, 1000000 STX is given to contract so that convert tokens can be acheived. The contract owner first adds managers in the data variable.

ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK.my-ft

## ft-trait.clar

sip-010-trait is defined in the contract.

ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK.ft-trait
