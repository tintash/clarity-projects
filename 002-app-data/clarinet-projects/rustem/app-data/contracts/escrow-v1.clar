(use-trait escrow-traits .escrow-traits.escrow-traits)

(define-constant ERR-SELLER-ONLY (err u200))
(define-constant ERR-BUYER-ONLY (err u201))
(define-constant ERR-BUYER-ALREADY-EXISTS (err u202))
(define-constant ERR-NOT-STARTED (err u203))
(define-constant ERR-ALREADY-STARTED (err u204))
(define-constant ERR-BUYER-REQUIRED (err u205))
(define-constant ERR-NO-VALUE (err u206))
(define-constant ERR-NOT-ENOUGH (err u207))
(define-constant ERR-SELLER-EQ-BUYER (err u208))

(define-read-only (total-contract-deposit)
    (as-contract (stx-get-balance tx-sender))
)

(define-private (get-order (escrow-data <escrow-traits>) (id uint))
   (unwrap-panic (contract-call? escrow-data get-order id)) 
)

(define-public (seller-deposit (escrow-data <escrow-traits>) (id uint) (new-x2price uint))
    (begin
        (asserts! (is-none (get-order escrow-data id)) ERR-ALREADY-STARTED)
        (asserts! (> new-x2price u0) ERR-NO-VALUE)
        (try! (contract-call? escrow-data set-order
               id {buyer: none, seller: tx-sender, x2price: new-x2price}))
        (contract-call? escrow-data pay-to-contract new-x2price)
    )
)

(define-public (buyer-deposit (escrow-data <escrow-traits>) (id uint) (amount uint))
    (let
        (
            (order (unwrap! (get-order escrow-data id) ERR-NOT-STARTED))
            (seller (get seller order))
            (x2price (get x2price order))
        )
        (asserts! (is-none (get buyer order)) ERR-BUYER-ALREADY-EXISTS)
        (asserts! (not (is-eq tx-sender seller)) ERR-SELLER-EQ-BUYER)
        (asserts! (>= amount x2price) ERR-NOT-ENOUGH)
        (try! (contract-call? escrow-data set-order 
               id (merge order {buyer: (some tx-sender)})))
        (contract-call? escrow-data pay-to-contract x2price)
    )
)

(define-public (break-deal (escrow-data <escrow-traits>) (id uint))
    (let
        (
            (order (unwrap! (get-order escrow-data id) ERR-NOT-STARTED))
            (x2price (get x2price order))
            (seller (get seller order))
            (buyer (get buyer order))
        )
        (asserts!  (is-eq tx-sender seller) ERR-SELLER-ONLY)
        (and (is-some buyer)
            (try! (contract-call? escrow-data
                                  contract-pay-to-recipient
                                  x2price (unwrap-panic buyer)))
        )
        (try! (contract-call? escrow-data delete-order id))
        (contract-call? escrow-data contract-pay-to-recipient x2price seller)
    )
)

(define-public (confirm-deal (escrow-data <escrow-traits>) (id uint))
    (let
        (
            (order (unwrap! (get-order escrow-data id) ERR-NOT-STARTED))
            (buyer (unwrap! (get buyer order) ERR-BUYER-REQUIRED))
            (seller (get seller order))
            (x2price (get x2price order))
            (price (/ x2price u2))
        )
        (asserts!  (is-eq tx-sender buyer) ERR-BUYER-ONLY)
        (try! (contract-call? escrow-data delete-order id))
        (try! (contract-call? escrow-data contract-pay-to-recipient price buyer))
        (contract-call? escrow-data contract-pay-to-recipient (+ price x2price) seller)
    )
)
