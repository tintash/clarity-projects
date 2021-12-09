;; Errors
(define-constant err-seller-only (err u100))
(define-constant err-buyer-only (err u101))
(define-constant err-buyer-already-exists (err u102))
(define-constant err-not-started (err u103))
(define-constant err-already-started (err u104))
(define-constant err-buyer-required (err u105))
(define-constant err-no-value (err u106))
(define-constant err-not-enough (err u107))
(define-constant err-seller-eq-buyer (err u108))

;; Data
(define-map orders uint {buyer: (optional principal), seller: principal, x2price: uint})

(define-read-only (get-order (id uint))
    (map-get? orders id)
)

(define-public (seller-deposit (id uint) (new-x2price uint))
    (begin
        (asserts! (is-none (get-order id)) err-already-started)
        (asserts! (> new-x2price u0) err-no-value)
        (map-set orders id {buyer: none, seller: tx-sender, x2price: new-x2price})
        (stx-transfer? new-x2price tx-sender (as-contract tx-sender))
    )
)

(define-public (buyer-deposit (id uint) (amount uint))
    (let
        (
            (order (unwrap! (get-order id) err-not-started))
            (seller (get seller order))
            (x2price (get x2price order))
        )
        (asserts! (is-none (get buyer order)) err-buyer-already-exists)
        (asserts! (not (is-eq tx-sender seller)) err-seller-eq-buyer)
        (asserts! (>= amount x2price) err-not-enough)
        (map-set orders id (merge order {buyer: (some tx-sender)}))
        (stx-transfer? x2price tx-sender (as-contract tx-sender))
    )
)

(define-public (break-deal (id uint))
    (let
        (
            (order (unwrap! (get-order id) err-not-started))
            (x2price (get x2price order))
            (seller (get seller order))
            (buyer (get buyer order))
        )
        (asserts!  (is-eq tx-sender seller) err-seller-only)
        (if (is-some buyer)
            (try! (as-contract (stx-transfer? x2price tx-sender (unwrap-panic buyer))))
            false
        )
        (map-delete orders id)
        (as-contract (stx-transfer? x2price tx-sender seller))
    )
)

(define-public (confirm-deal (id uint))
    (let
        (
            (order (unwrap! (get-order id) err-not-started))
            (buyer (unwrap! (get buyer order) err-buyer-required))
            (seller (get seller order))
            (x2price (get x2price order))
            (price (/ x2price u2))
        )
        (asserts!  (is-eq tx-sender buyer) err-buyer-only)
        (map-delete orders id)
        (try! (as-contract (stx-transfer? price tx-sender buyer)))
        (as-contract (stx-transfer? (+ price x2price) tx-sender seller))
    )
)
