(define-trait data-accessor
    (
        (add () (response uint uint))
        (update-values (uint uint) (response bool uint))
    )
)