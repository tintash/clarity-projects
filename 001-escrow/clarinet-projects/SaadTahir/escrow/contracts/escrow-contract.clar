
(define-constant contract-owner tx-sender)

(define-constant err-owner-only (err u100))
(define-constant err-buyer-only (err u101))

(define-data-var item-amount uint u0)
(define-data-var item-buyer (optional principal) none)
(define-data-var item-seller (optional principal) none)

;;Buyer will call this method to transfer money to contract
(define-public (purchaseItem (amount uint))
    (begin        
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (var-set item-buyer (some tx-sender))
        (ok true)
    )
)

;;Contract-ownder will call this function e.g. Seller
(define-public (transferAmount (amount uint))
    (begin
        (asserts! (is-eq contract-owner tx-sender) err-owner-only)
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (var-set item-seller (some tx-sender))
        (var-set item-amount (/ amount u2))
        (ok true)
    )
)

;; Buyer will call this function
(define-public (itemPurchased)
    (begin        
        (asserts! (is-eq (some tx-sender) (var-get item-buyer)) err-buyer-only)
        (let
            (
                (item-cost-with-balance (+ (* (var-get item-amount) u2) (var-get item-amount)))
            )
            (try! (as-contract (stx-transfer? (var-get item-amount) tx-sender (unwrap-panic (var-get item-buyer)))))
            (try! (as-contract (stx-transfer? item-cost-with-balance tx-sender (unwrap-panic (var-get item-seller)))))
            (ok true)
        )        
    )
)