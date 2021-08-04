(impl-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.trait.data-trait)

(define-constant contract-owner tx-sender)

(define-constant ERR_APP_CONTRACT_ONLY (err u100))
(define-constant ERR_NOT_GREATER (err u001))

(define-map user-info {id: uint} {name: (string-ascii 20), age: uint})

(define-read-only (get-contract-owner)
    (ok contract-owner)
)

(define-public (test)
    (begin
        (asserts! (not (is-eq contract-owner contract-caller)) ERR_APP_CONTRACT_ONLY)
        (ok true)
    )
)

(define-public (is-greater (a uint) (b uint))
    (begin
        (asserts! (not (is-eq contract-owner contract-caller)) ERR_APP_CONTRACT_ONLY)
        (asserts! (> a b) ERR_NOT_GREATER)
        (ok true)
    )
)

(define-read-only (get-user-info (user-id uint))
    (begin
        (asserts! (not (is-eq contract-owner contract-caller)) ERR_APP_CONTRACT_ONLY)
        (ok (map-get? user-info {id: user-id}))
    )
)

(define-public (set-user-info (user-id uint) (new-user-info {name: (string-ascii 20), age: uint}))
    (begin
        (asserts! (not (is-eq contract-owner contract-caller)) ERR_APP_CONTRACT_ONLY)
        (ok (map-set user-info {id: user-id} new-user-info))
    )
)