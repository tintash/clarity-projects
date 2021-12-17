(define-trait escrow-traits 
    (
        (set-caller (principal) (response bool uint))
        (delete-caller (principal) (response bool uint))
        (get-order (uint)
                   (response (optional {buyer: (optional principal),
                                       seller: principal,
                                       x2price: uint})
                              uint
                              ) 
        )
        (set-order (uint {buyer: (optional principal),
                          seller: principal,
                          x2price: uint})
                    (response bool uint))
        (delete-order (uint) (response bool uint))
        (pay-to-contract (uint) (response bool uint))
        (contract-pay-to-recipient (uint principal) (response bool uint))
    )
)