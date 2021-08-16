sequenceDiagram
participant Contract Owner
participant Manager
participant App
participant MyFT
participant Player
Contract Owner -->> Manager: Creates manager  
 Manager ->> App: Give tokens to player
App -->> App: Checks player random number
alt number in range  
 App ->> MyFT: Give tokens to player
MyFT ->> Player: Give tokens
else number not in range  
 App ->> MyFT: Destroy tokens of player
MyFT ->> Player: Destroy tokens
end
Player ->> MyFT: Convert tokens
Player ->> MyFT: Transfer tokens
Player ->> MyFT: View token properties
