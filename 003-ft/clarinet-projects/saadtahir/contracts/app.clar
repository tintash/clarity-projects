(use-trait ft-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.ft-trait.sip-010-trait)

(define-public (get-balance (ft-contract <ft-trait>) (owner principal))    
    (ok (try! (as-contract (contract-call? ft-contract get-balance owner))))
)

(define-public (get-total-supply (ft-contract <ft-trait>))    
    (ok (try! (as-contract (contract-call? ft-contract get-total-supply))))
)

(define-public (get-name (ft-contract <ft-trait>))    
    (ok (try! (as-contract (contract-call? ft-contract get-name))))
)

(define-public (get-symbol (ft-contract <ft-trait>))    
    (ok (try! (as-contract (contract-call? ft-contract get-symbol))))
)

(define-public (get-decimals (ft-contract <ft-trait>))    
    (ok (try! (as-contract (contract-call? ft-contract get-decimals))))
)

(define-public (get-token-uri (ft-contract <ft-trait>))    
    (ok (try! (as-contract (contract-call? ft-contract get-token-uri))))
)

(define-public (transfer (ft-contract <ft-trait>) (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (ok (try! (contract-call? ft-contract transfer amount sender recipient memo)))
)

;; only the address or contract can destroy the tokens
(define-public (destroy (amount uint) (address principal))
    (ok (try! (contract-call? .my-ft destroy amount address)))
)

;; This function can only be called by contract owner (deployer)
(define-public (goal-scored (amount uint) (scorer principal))
    (ok (try! (contract-call? .my-ft goal-scored amount scorer)))
)