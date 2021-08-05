Sequence Diagram:

  Data-Contract->>App-Contract: Allow-valid-contract 
  App-Contract->>+Data-Trait: app-update (input1, input2)
  Data-Trait->>+Data-Contract: update-values (input1, input2)
  App-Contract->>+Data-Trait: app-add ()
  Data-Trait->>+Data-Contract: add ()
  Data-Contract->>+App-Contract: (+ input1 input2)