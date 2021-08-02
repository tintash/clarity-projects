(define-data-var seller (optional principal) none)
(define-data-var buyer (optional principal) none)
(define-data-var item-amount uint u0)
(define-data-var seller-amount uint u0)

(define-constant err-buyer-only (err u100))
(define-constant err-seller-only (err u101))

(define-public (buyItem (amount uint) (recipient principal))
  (begin
    (var-set item-amount (/ amount u2))
    (var-set buyer (some tx-sender))
    (var-set seller (some recipient))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (ok true)
  )
)

(define-public (transferFunds (amount uint))
  (begin
    (asserts! (is-eq (some tx-sender) (var-get seller)) err-seller-only)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set seller-amount amount)
    (ok true)
  )
)

(define-private (payoutBalance)
  (begin
    (unwrap-panic (as-contract (stx-transfer? (+ (var-get item-amount) (var-get seller-amount)) tx-sender (unwrap-panic (var-get seller)))))
    (unwrap-panic (as-contract (stx-transfer? (var-get item-amount) tx-sender (unwrap-panic (var-get buyer)))))
  )
)

(define-public (itemRecieved)
  (begin
    (asserts! (is-eq (some tx-sender) (var-get buyer)) err-buyer-only)
    (payoutBalance)
    (ok true)
  )
)
