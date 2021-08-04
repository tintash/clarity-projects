(use-trait data-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.trait.data-trait)

(define-public (upgraded-user-info (data-contract <data-trait>) (user-id uint))
    (ok (try! (as-contract (contract-call? .app get-user-info data-contract user-id))))
)