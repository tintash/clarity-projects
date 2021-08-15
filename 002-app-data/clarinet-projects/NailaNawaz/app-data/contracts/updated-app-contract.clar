;; this contract will use the trait to communicate with the data contract
(use-trait data-trait .data-trait.sum)

;; this function will take 3 params, calls the data-contract twice to calculate sum
;; data-contract then prints the sum of those numbers
(define-public (get-sum-updated (data-contract <data-trait>) (num1 uint) (num2 uint) (num3 uint))
       (begin 
              (let 
                     ((temp-sum (try! (contract-call? data-contract get-sum num1 num2)))) 
                     (ok (try! (contract-call? data-contract get-sum temp-sum num3)))
              )
       )
)