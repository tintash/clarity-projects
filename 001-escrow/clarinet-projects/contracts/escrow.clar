(define-data-var seller (optional principal) none)
(define-data-var buyer (optional principal) none)
(define-data-var item-amount uint u0)

(define-constant err-buyer-only (err u100))

(define-public (send-funds (amount uint) (recipient principal))
(begin
    (var-set item-amount amount)
    (var-set buyer (some tx-sender))
    (var-set seller (some recipient))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (ok true)
)
)

(define-private (payout-balance)
  (unwrap-panic (as-contract (stx-transfer? (var-get item-amount) tx-sender (unwrap-panic (var-get seller)))))
)

(define-public (itemRecieved)
(begin
    (asserts! (is-eq (some tx-sender) (var-get buyer)) err-buyer-only)
    (payout-balance)
    (ok true)
)

)
