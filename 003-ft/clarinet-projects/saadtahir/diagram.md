sequenceDiagram
participant User
participant App
participant Data
User ->> App: Calls goal scored function
App ->> Data: Calls data functions
Data -->> Data: Checks if it's a valid caller
alt is valid
Data ->> App: Returns tokens
App ->> User: Returns tokens
else is invalid
Data ->> App: Returns error
App ->> User: Returns error
end
