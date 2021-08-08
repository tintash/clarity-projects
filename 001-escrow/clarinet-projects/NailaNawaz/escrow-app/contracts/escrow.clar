
;;shipment of item from seller to buyer

;; constants
(define-constant ERR_PAYMENT (err u1))
(define-constant ERR_NOT_BUYER (err u2))
;; data variable
(define-data-var item-buyer (optional principal) none)
(define-data-var item-seller (optional principal) none)
(define-data-var item-price uint u10)

;; buyer will call this method to set the price of item
;; (define-public (setPrice (amount uint))
;;     (begin
;;         (var-set item-price amount)
;;         (ok true)
;;     )    
;; )

;; this function will be called by seller
;; the price of item will be set as half of the amount send by seller to contract

(define-public (amountBySeller (amount uint))
    (begin 
        (var-set item-price (/ amount u2))
        (unwrap! (stx-transfer? amount tx-sender (as-contract tx-sender)) (err ERR_PAYMENT))
        (var-set item-seller (some tx-sender))
        (ok true)
    )
)

;; customer will call this method to transfer money to contract
;; check if the amount is 2x the price of item
;; if amount is 2x then save the sender id and transfer amount to contract
;; if the amount is less than the required, then throw error
;; He'll be sending the 2x amount for the purchase  
;; sender id will be saved in the item-buyer variable
;;tx-sender is the one who calls the contract
   
(define-public (purchaseItem (amount uint))
    (begin
        (if (>= amount (* u2 (var-get item-price)))
            (begin
                (unwrap! (stx-transfer? amount tx-sender (as-contract tx-sender)) (err ERR_PAYMENT))
                (var-set item-buyer (some tx-sender))
                (ok true)
            )
            (begin 
                (print "Not enough amount")
                (ok false)
            )
        ) 
    )
)

;; this method is called by buyer on receving item
;; return the item-price / 2 from contract to buyer
;; return the (item-price * 2) the price by seller + the item price paid by buyer to seller

(define-public (itemReceived)
    (begin 
        (asserts! (is-eq (some tx-sender) (var-get item-buyer)) ERR_NOT_BUYER)
        (try! (stx-transfer? (/ (var-get item-price) u2) (as-contract tx-sender) (unwrap-panic (var-get item-buyer))))
        (try! (stx-transfer? (+ (* (var-get item-price) u2) (var-get item-price)) (as-contract tx-sender) (unwrap-panic (var-get item-seller))))
        (ok true)
    )
)

(define-read-only (itemNotReceived)
    (begin
        ;; confirmation from seller required
        (ok true)
    )
)

