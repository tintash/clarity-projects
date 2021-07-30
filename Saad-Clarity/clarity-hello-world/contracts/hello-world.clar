
;; hello-world
;; this function is the first code I am writing in clarity language

;; public functions
(define-public (say-hi)
    (ok "hello world"))

;; read-only functions
(define-read-only (echo-number (val int))
    (ok val))

(define-private (do-add (a int) (b int))
    (ok (+ a b)))

