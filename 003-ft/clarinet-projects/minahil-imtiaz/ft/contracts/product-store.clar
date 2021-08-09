
;; product-store

(define-constant contract-owner tx-sender)
(define-constant ERR_NO_RECORD_FOUND u404)
(define-constant ERR_DUPLICATE_RECORD u504)
(define-constant ERR_UNAUTHORIZED_CALLER u400)
(define-constant ERR_INVALID_PRICE u401)
(define-constant SUCCESS u200)


(define-map products { name: (string-ascii 50)} { price: uint, quantity: uint })


(define-private (decrement-quantity (name (string-ascii 50)))
  (let
    ((required-product (unwrap! (map-get? products { name: name }) (err ERR_NO_RECORD_FOUND))) 
     (quantity (- (get quantity required-product) u1)))
    (if (is-eq quantity u0) (map-delete products {name: name}) (map-set products {name: name} {quantity: quantity, price: (get price required-product) }))
    (ok SUCCESS)
  )
)


(define-public (add-product (name (string-ascii 50)) (price uint) (quantity uint) ) 
  (begin 
    (asserts! (is-eq tx-sender contract-owner) (err ERR_UNAUTHORIZED_CALLER)) 
    (asserts! (map-insert products {name: name} {price: price, quantity: quantity})   (err ERR_DUPLICATE_RECORD))
    (ok SUCCESS)
  )
)


(define-public (delete-product (name (string-ascii 50)))
  (begin 
    (asserts! (is-eq tx-sender contract-owner) (err ERR_UNAUTHORIZED_CALLER)) 
    (if 
        (map-delete products {name: name})
        (ok SUCCESS) 
        (err ERR_NO_RECORD_FOUND)
    )
  )
)

(define-public (buy-product (name (string-ascii 50)) (price uint))
   (let 
      ((product-price (try! (get-product-price name))) 
       (caller tx-sender)
       (tokens (* u1000 price))
      )
      (asserts! (is-eq product-price price) (err ERR_INVALID_PRICE))
      (try! (decrement-quantity name))
      (try! (stx-transfer? price caller (as-contract tx-sender)))
      (try! (contract-call? .cosmo-ft issue-token tokens tx-sender))
      (ok SUCCESS)
   )
)

(define-public (transfer-reward-tokens (amount uint) (recipient principal))
   (begin 
      (asserts! (> amount u0) (err ERR_INVALID_PRICE))
      (try! (contract-call? .cosmo-ft transfer amount tx-sender recipient))
      (ok SUCCESS)
   )
)

(define-public (redeem-reward-tokens (amount uint))
   (let 
      ((caller tx-sender)
       (transfer-amount (/ amount u1000)))
      (asserts! (> amount u0) (err ERR_INVALID_PRICE))
      (try! (contract-call? .cosmo-ft destroy-token amount tx-sender))
      (try! (as-contract (stx-transfer? transfer-amount tx-sender caller)))
      (ok SUCCESS)
   )
)

(define-read-only (get-product-price (name (string-ascii 50)))
    (let
       ((required-product (unwrap! (map-get? products { name: name }) (err ERR_NO_RECORD_FOUND))))
       (ok (get price required-product))
    ) 
)
