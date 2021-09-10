
;; escrow-app
(use-trait escrow-traits .escrow-traits.escrow-traits)

;; public functions
(define-public (seller-deposit (escrow-data <escrow-traits>) (order-id uint) (amount uint))
    (ok (try! (contract-call? escrow-data seller-deposit order-id amount)))
)

(define-public (buyer-deposit (escrow-data <escrow-traits>) (order-id uint) (amount uint))
    (ok (try! (contract-call? escrow-data buyer-deposit order-id amount)))
)

(define-public (item-received (escrow-data <escrow-traits>) (order-id uint))
    (ok (try! (contract-call? escrow-data item-received order-id)))
)
