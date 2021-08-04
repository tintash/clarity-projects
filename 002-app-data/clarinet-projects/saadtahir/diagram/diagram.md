sequenceDiagram
  participant User
  participant App
  participant Data
  participant Trait  
  Data -->> Trait: Implements
  App ->> Data: Calls data functions
  Data -->> App: Checks if its a valid caller
  Data ->> App: Returns data
  User ->> Data: Calls data functions
  Data -->> User: Checks if its a valid caller
  Data ->> User: Returns Error