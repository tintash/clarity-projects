
(impl-trait .escrow-traits.escrow-traits)

;; Errors
(define-constant contract-owner tx-sender)

(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-UNAUTHORIZED (err u101))

;; Data
(define-map orders uint {buyer: (optional principal), seller: principal, x2price: uint})
(define-map authorized-callers principal bool)

(define-read-only (total-contract-deposit)
    (as-contract (stx-get-balance tx-sender))
)

(define-read-only (is-authorized (caller principal))
    (default-to false (map-get? authorized-callers caller))
)

(define-public (set-caller (caller principal)) 
    (begin
        ;; only contract owner 
        (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY) 
        (ok (map-set authorized-callers caller true))
    )
)

(define-public (delete-caller (caller principal)) 
    (begin 
        ;; only contract owner 
        (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
        (ok (map-delete authorized-callers caller))
    )
)

(define-read-only (get-order (id uint))
    (ok (map-get? orders id))
)

(define-public (set-order (id uint)
                          (order {buyer: (optional principal),
                           seller: principal,
                           x2price: uint})
                )
    (begin
        (asserts! (is-authorized contract-caller) ERR-UNAUTHORIZED)
        (ok (map-set orders id order))
    )
)

(define-public (delete-order (id uint))
    (begin
        (asserts! (is-authorized contract-caller) ERR-UNAUTHORIZED)
        (ok (map-delete orders id))
    )
)

(define-public (pay-to-contract (amount uint))
    (begin
        (asserts! (is-authorized contract-caller) ERR-UNAUTHORIZED)
        (stx-transfer? amount tx-sender (as-contract tx-sender))
    )
)

(define-public (contract-pay-to-recipient (amount uint) (recipient principal))
    (begin
        (asserts! (is-authorized contract-caller) ERR-UNAUTHORIZED)
        (as-contract (stx-transfer? amount tx-sender recipient))
    )
)
