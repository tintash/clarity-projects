;; escrow-app-v2
(use-trait escrow-traits .escrow-traits.escrow-traits)

(define-constant err-invalid-caller (err u100))

;; private functions
(define-private (read-buyer (order-id uint)) 
    (as-contract (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow-data get-buyer order-id))
)

;; public functions
(define-public (seller-deposit (escrow-data <escrow-traits>) (order-id uint) (amount uint))
    (ok (try! (contract-call? escrow-data seller-deposit order-id amount)))
)

(define-public (buyer-deposit (escrow-data <escrow-traits>) (order-id uint) (amount uint))
    (ok (try! (contract-call? escrow-data buyer-deposit order-id amount)))
)

(define-public (item-received (escrow-data <escrow-traits>) (order-id uint))
    (begin 
        ;; only buyer 
        (asserts! (is-eq (read-buyer order-id) (some tx-sender)) err-invalid-caller)
        (ok (try! (contract-call? escrow-data item-received order-id)))
    )
)