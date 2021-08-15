(use-trait data-t .data-trait.data-accessor)

(define-public (app-add (data-contract <data-t>) (input1 uint) (input2 uint))
    (begin 
        (try! (contract-call? data-contract update-values input1 input2))
        (ok (try! (contract-call? data-contract add)))
    )
    
)