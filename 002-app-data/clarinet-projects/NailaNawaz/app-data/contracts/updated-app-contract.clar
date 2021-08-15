;; this contract will use the trait to communicate with the data contract
(use-trait data-trait .data-trait.sum)

;; this function will take 2 params, calls the data-contract
;; data-contract then prints the sum of those numbers
(define-public (get-sum-updated (data-contract <data-trait>) (num1 uint) (num2 uint) (num3 uint))
       (ok (try! (contract-call? data-contract get-sum-updated num1 num2 num3)))
)