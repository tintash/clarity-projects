# trait.clar

It contains function definitions that the data contract will implement

# data.clar

It implements the trait contract and only the app contract can interact with this contract using dynamic dispatch. If any other user tries to call data contract public functions, an error is thrown. Test is implemented for this behaviour.

# app.clar

It interacts with the data contract methods to get and set the data variables. It contains static dispatched functions (just for the sake of understanding) and dynamic dispatched functions.

# upgraded-app.clar

This is an updated version of app contract since we cannot upgrade the already deployed app contract. It calls the app contract public function using its own function. The test for this class is implemented as well.
