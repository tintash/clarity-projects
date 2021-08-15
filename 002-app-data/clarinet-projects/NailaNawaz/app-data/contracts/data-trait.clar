;; this contract contains the traits to be implemented by data-contract
(define-trait sum
    (
        (get-sum (uint uint) (response bool uint))
        (get-sum-updated (uint uint uint) (response bool uint))
    )
)