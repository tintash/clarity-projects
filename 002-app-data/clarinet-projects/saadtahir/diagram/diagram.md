sequenceDiagram
  participant User
  participant App
  participant Data
  User ->> App: Calls smart contract function
  App ->> Data: Calls data functions
  Data -->> Data: Checks if it's a valid caller
  alt is valid
    Data ->> App: Returns data
    App ->> User: Returns data
  else is invalid
    Data ->> App: Returns error
    App ->> User: Returns error
  end
