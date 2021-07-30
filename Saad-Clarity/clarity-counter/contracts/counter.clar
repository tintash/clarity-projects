;; define counter variable
(define-data-var counter int 0)

;; counter getter
(define-read-only (get-counter)
    (ok (var-get counter)))

;; counter increment
(define-public (increment)
    (begin
    (var-set counter (+ (var-get counter) 1))
    (ok (var-get counter))))

;; counter decrement
(define-public (decrement)
    (begin
    (var-set counter (- (var-get counter) 1))
    (ok (var-get counter))))
