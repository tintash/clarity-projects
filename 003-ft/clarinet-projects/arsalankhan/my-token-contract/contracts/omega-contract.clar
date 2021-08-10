(define-constant CONTRACT_OWNER tx-sender)
(define-data-var price uint u1000) ;; price in uSTX for 1 OMEGA
(define-data-var amountOfOMEGA uint u0)

(define-public (sell-omega (amount uint))
    (begin
        (asserts! (is-eq contract-caller CONTRACT_OWNER) (err u101))
        ;; send OMEGA to contract
        (try! (transfer-mia amount contract-caller (as-contract tx-sender)))
        (var-set amountOfOMEGA (+ (var-get amountOfOMEGA) amount))
        (ok true)
    )
)

(define-public (withdraw-omega (amount uint))
    (begin 
        (asserts! (is-eq contract-caller CONTRACT_OWNER) (err u101))
        ;; send OMEGA to caller
        (try! (transfer-mia amount (as-contract tx-sender) contract-caller))
        (var-set amountOfOMEGA (- (var-get amountOfOMEGA) amount))
        (ok true)
    )
)

(define-public (buy-omega (amount uint))
    (begin
        (asserts! (not (is-eq contract-caller CONTRACT_OWNER)) (err u101))
        ;; transfer stx to deployer
        (try! (stx-transfer? (* amount (var-get price)) contract-caller CONTRACT_OWNER))
        ;; send OMEGA to caller
        (try! (transfer-mia amount (as-contract tx-sender) contract-caller))
        (var-set amountOfOMEGA (- (var-get amountOfOMEGA) amount))
        (ok true)
    )
)

(define-public (change-price (newPrice uint)) ;; price in uSTX
    (begin
        (asserts! (is-eq contract-caller CONTRACT_OWNER) (err u101))
        (var-set price newPrice)
        (ok true)
    )
)

(define-read-only (get-price)
    (ok (var-get price))
)

(define-read-only (get-remaining)
    (ok (var-get amountOfOMEGA))
)

(define-private (transfer-mia (amount uint) (from principal) (to principal))
    (contract-call? .omega-coin transfer amount from to none)
)

;; (define-private (get-my-balance (user principle))
;;     (contract-call? .omega-coin get-balance user)
;; )