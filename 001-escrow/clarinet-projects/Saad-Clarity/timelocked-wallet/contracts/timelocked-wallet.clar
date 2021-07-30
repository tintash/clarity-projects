
;; Owner
(define-constant contract-owner tx-sender)

;; Errors
(define-constant err-owner-only (err u100))
(define-constant err-already-locked (err u101))
(define-constant err-unlock-in-past (err u102))
(define-constant err-no-value (err u103))
(define-constant err-beneficiary-only (err u104))
(define-constant err-unlock-height-not-reached (err u105))

;; Data  Variables
(define-data-var beneficiary (optional principal) none)
(define-data-var unlock-height uint u0)

(define-public (set-beneficiary (value (optional principal)))
    (ok (var-set beneficiary value))
)

(define-read-only (get-beneficiary)
    (var-get beneficiary)
)

(define-public (lock (new-beneficiary principal) (unlock-at uint) (amount uint))
    (begin
        ;; Only contract owner can call this function
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        ;; The wallet cannot be locked twice meaning beneficiary already present
        (asserts! (is-none (var-get beneficiary)) err-already-locked)
        ;; The unlock-at should be greater than block-height e.g. in future
        (asserts! (> unlock-at block-height) err-unlock-in-past)
        ;; The amount should not be zero
        (asserts! (> amount u0) err-no-value)
        ;; Transfer funds from tx-sender to contract itself e.g. holding the funds until unlock occurs
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        ;; Save the beneficiary for future unlock
        (var-set beneficiary (some new-beneficiary))
        ;; Save the block-height for future unlock
        (var-set unlock-height unlock-at)
        ;; If everything is good, return true to save data-vars
        (ok true)
    )
)

;; Transferring ownership to another beneficiary
(define-public (bestow (new-beneficiary principal))
    (begin 
        ;; Check that only the current beneficiary is the principal
        (asserts! (is-eq (some tx-sender) (var-get beneficiary)) err-beneficiary-only)
        (var-set beneficiary (some new-beneficiary))
        (ok true)
    )
)

(define-public (claim)
    (begin
        ;; Check if the tx-sender is the beneficiary
        (asserts! (is-eq (some tx-sender) (var-get beneficiary)) err-beneficiary-only)
        ;; Check if the block-height is reached
        (asserts! (>= block-height (var-get unlock-height)) err-unlock-height-not-reached)
        ;; transfer tokens to beneficiary
        ;; as-contract is used so that tx-sender is the contract principal that holds the tokens
        ;; we get out stx from tx-sender
        ;; and trasfer from tx-sender to beneficiary
        ;; beneficiary is unwrap-panic so that we get correct value
        ;; response is thrown to begin to succed or fail
        (as-contract (stx-transfer? (stx-get-balance tx-sender) tx-sender (unwrap-panic (var-get beneficiary))))        
    )
)