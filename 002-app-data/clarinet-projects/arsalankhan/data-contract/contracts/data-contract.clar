(define-data-var input1 uint u0)
(define-data-var input2 uint u0)
(define-map allowed {caller: principal} bool)
(define-constant ERR_NOT_ADMIN (err u301))
(define-constant CONTRACT_OWNER tx-sender)

(define-constant ERR_NOT_VALID_CONTRACT (err u101))
(define-constant ERR_NOT_IN_LIST (err u201))


(impl-trait .data-trait.data-accessor)

(define-public (add)
    (begin
    (print {tx-caller: tx-sender, contract-caller: contract-caller })
    (unwrap! (map-get? allowed {caller: contract-caller}) ERR_NOT_VALID_CONTRACT)
    (ok (+ (var-get input1) (var-get input2)))
    )
)

(define-public (update-values (num1 uint) (num2 uint))
    (begin
        (print {tx-caller: tx-sender, contract-caller: contract-caller })
        (unwrap! (map-get? allowed {caller: contract-caller}) ERR_NOT_VALID_CONTRACT)    
        (var-set input1 num1)
        (var-set input2 num2)
        (ok true)
    )
)

(define-public (allow-contract (input principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_ADMIN)
        (print {tx-caller: tx-sender, contract-caller: contract-caller })
        (map-set allowed {caller: input} true)
        (ok true)
    )
)

