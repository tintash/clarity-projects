(use-trait data-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.trait.data-trait)

;; Static dispatch (requires Clarinet.toml file depends_on)
(define-public (test)
    (as-contract (contract-call? .data test))
)

;; Static dispatch (requires Clarinet.toml file depends_on)
(define-public (is-greater (a uint) (b uint))
    (ok (try! (contract-call? .data is-greater a b)))
)

;; Dynamic dispatch (requires following trait)
(define-public (get-user-info (data-contract <data-trait>) (user-id uint))    
    (ok (try! (as-contract (contract-call? data-contract get-user-info user-id))))
    
)

;; Dynamic dispatch (requires following trait)
(define-public (set-user-info (data-contract <data-trait>) (user-id uint) (new-user-info {name: (string-ascii 20), age: uint}))
    (ok (try! (as-contract (contract-call? data-contract set-user-info user-id new-user-info))))
)