(define-trait data-trait
    (        
        (get-user-info (uint) (response (optional {name: (string-ascii 20), age: uint}) uint))
        (set-user-info (uint {name: (string-ascii 20), age: uint}) (response bool uint))
    )
)