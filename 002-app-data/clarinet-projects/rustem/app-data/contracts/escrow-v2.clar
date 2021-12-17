(use-trait escrow-traits .escrow-traits.escrow-traits)

(define-constant ERR-SELLER-ONLY (err u200))
(define-constant ERR-BUYER-ONLY (err u201))
(define-constant ERR-NOT-STARTED (err u203))
(define-constant ERR-BUYER-REQUIRED (err u205))
(define-constant ERR-DISCOUNT-TOO-BIG (err u210))

(define-map discounts uint uint)

(define-read-only (total-contract-deposit)
    (as-contract (stx-get-balance tx-sender))
)

(define-private (get-order (escrow-data <escrow-traits>) (id uint))
   (unwrap-panic (contract-call? escrow-data get-order id)) 
)

(define-read-only (get-discount (id uint))
    (default-to u0 (map-get? discounts id))
)

(define-public (set-discount (escrow-data <escrow-traits>) (id uint) (amount uint)) 
    (let
        (
            (order (unwrap! (get-order escrow-data id) ERR-NOT-STARTED))
            (seller (get seller order))
            (x2price (get x2price order))
            (price (/ x2price u2))
        )
        (asserts! (is-eq tx-sender seller) ERR-SELLER-ONLY)
        (asserts! (>= price amount) ERR-DISCOUNT-TOO-BIG)
        (map-set discounts id amount)
        (ok id)
    )
)

(define-public (delete-discount (escrow-data <escrow-traits>) (id uint)) 
    (let
        (
            (order (unwrap! (get-order escrow-data id) ERR-NOT-STARTED))
            (seller (get seller order))
        )
        (asserts! (is-eq tx-sender seller) ERR-SELLER-ONLY)
        (map-delete discounts id)
        (ok id)
    )
)

(define-public (seller-deposit (escrow-data <escrow-traits>) (id uint) (amount uint))
    (contract-call? .escrow-v1 seller-deposit escrow-data id amount)
)

(define-public (buyer-deposit (escrow-data <escrow-traits>) (id uint) (amount uint))
    (contract-call? .escrow-v1 buyer-deposit escrow-data id amount)
)

(define-public (break-deal (escrow-data <escrow-traits>) (id uint))
    (contract-call? .escrow-v1 break-deal escrow-data id)
)

(define-public (confirm-deal (escrow-data <escrow-traits>) (id uint))
    (let
        (
            (order (unwrap! (get-order escrow-data id) ERR-NOT-STARTED))
            (buyer (unwrap! (get buyer order) ERR-BUYER-REQUIRED))
            (seller (get seller order))
            (x2price (get x2price order))
            (price (/ x2price u2))
            (discount (get-discount id))
        )
        (asserts!  (is-eq tx-sender buyer) ERR-BUYER-ONLY)
        (try! (contract-call? escrow-data delete-order id))
        (try! (contract-call? escrow-data contract-pay-to-recipient (+ price discount) buyer))
        (contract-call? escrow-data contract-pay-to-recipient (- (+ price x2price) discount) seller)
    )
)