;; product-data
;; It serves as the inventory for the products, stores the data, and implements the CRUDS enforced by the 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-trait.product-trait

(impl-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-trait.product-trait)

;; constants
(define-constant contract-owner tx-sender)
(define-constant ERR_NO_RECORD_FOUND u404)
(define-constant ERR_DUPLICATE_RECORD u504)
(define-constant ERR_UNAUTHORIZED_CALLER u400)
(define-constant SUCCESS u200)

;; data maps and vars
(define-map products { name: (string-ascii 50)} { price: uint })
(define-map valid-contract-callers { contract-identifier: principal} {valid-caller: bool})


;; private functions

;; checks if the principal calling the function is registered as valid contract caller
(define-private (is-valid-contract-caller (caller principal))
  (begin 
     (unwrap! (map-get? valid-contract-callers { contract-identifier: caller }) false)
     true
  )
)

;; public functions

;; It adds the product to the inventory after validating the contract caller
(define-public (add-product (name (string-ascii 50)) (price uint) ) 
  (begin 
    (asserts! (is-valid-contract-caller contract-caller) (err ERR_UNAUTHORIZED_CALLER)) 
    (if
        (map-insert products {name: name} {price: price})
        (ok SUCCESS)
        (err ERR_DUPLICATE_RECORD)
    )  
  )
)

;; It deletes the product from the inventory after validating the contract caller
(define-public (delete-product (name (string-ascii 50)))
  (begin 
    (asserts! (is-valid-contract-caller contract-caller) (err ERR_UNAUTHORIZED_CALLER)) 
    (if 
        (map-delete products {name: name})
        (ok SUCCESS) 
        (err ERR_NO_RECORD_FOUND)
    )
  )
)

;; It gets the product price by name from the inventory after validating the contract caller
(define-public (get-product-price (name (string-ascii 50)))
  (begin 
      (asserts! (is-valid-contract-caller contract-caller) (err ERR_UNAUTHORIZED_CALLER))
      (let
        ((required-product (unwrap! (map-get? products { name: name }) (err ERR_NO_RECORD_FOUND))))
        (ok (get price required-product))
      ) 
  )
)

;; It updates the product price by name from the inventory after validating the contract caller
(define-public (update-product-price (name (string-ascii 50)) (price uint)) 
  (begin
    (asserts! (is-valid-contract-caller contract-caller) (err ERR_UNAUTHORIZED_CALLER)) 
    (unwrap! (map-get? products { name: name }) (err ERR_NO_RECORD_FOUND))
    (map-set products {name: name} {price: price})
    (ok SUCCESS)
  )
)

;; It add the contract in the valid contract callers map so these contract can utilize the inventory and functions of this contract
(define-public (add-valid-contract-caller (app-contract-identifier principal))
  (begin 
    (asserts! (is-eq tx-sender contract-owner) (err ERR_UNAUTHORIZED_CALLER)) 
    (asserts! (map-insert valid-contract-callers { contract-identifier: app-contract-identifier } {valid-caller: true }) (err ERR_DUPLICATE_RECORD))
    (print {new-valid-contract: app-contract-identifier})
    (ok SUCCESS)     
  )
)