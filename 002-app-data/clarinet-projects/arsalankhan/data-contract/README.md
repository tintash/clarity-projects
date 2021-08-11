# Trait Example

## Data-Contract Definition
We have a data contract definition in its seperate file named 'data-contract'. It contains the actual implementation of what will be doing with our data in the future. Its available in its seperate contract file 'data-contract.clar'.



## Trait Definition
We have an external trait definiton in its seperate contract file named 'data-trait.clar'. It has two functions 'add' and 'update-values'. The 'update-values' will used to update the two unsigned integer available in the above data-contract definition and the function 'add' is going to add those data elements and return the response.

```
(define-trait data-accessor
    (
        (add () (response uint uint))
        (update-values (uint uint) (response bool uint))
    )
)
```

## App Contracts
We have two contracts 'app-contract' and 'updated-app-contract' both are interacting with 'data-contract' using trait implementation. In order for any app-contract to call data-contract functions, they need to be valid contracts. following are the steps to add any app contract as valid contracts to interact with data-contract.

## Steps
A sequence diagram explaining the steps.

[![](https://mermaid.ink/img/eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG5cbkRhdGEtQ29udHJhY3QtPj5BcHAtQ29udHJhY3Q6IEFsbG93LXZhbGlkLWNvbnRyYWN0IFxuQXBwLUNvbnRyYWN0LT4-K0RhdGEtVHJhaXQ6IGFwcC11cGRhdGUgKGlucHV0MSwgaW5wdXQyKVxuRGF0YS1UcmFpdC0-PitEYXRhLUNvbnRyYWN0OiB1cGRhdGUtdmFsdWVzIChpbnB1dDEsIGlucHV0MilcbkFwcC1Db250cmFjdC0-PitEYXRhLVRyYWl0OiBhcHAtYWRkICgpXG5EYXRhLVRyYWl0LT4-K0RhdGEtQ29udHJhY3Q6IGFkZCAoKVxuRGF0YS1Db250cmFjdC0-PitBcHAtQ29udHJhY3Q6ICgrIGlucHV0MSBpbnB1dDIpXG5cbiAgICAgICAgICAgICIsIm1lcm1haWQiOnsidGhlbWUiOiJkZWZhdWx0In0sInVwZGF0ZUVkaXRvciI6ZmFsc2UsImF1dG9TeW5jIjp0cnVlLCJ1cGRhdGVEaWFncmFtIjpmYWxzZX0)](https://mermaid-js.github.io/mermaid-live-editor/edit/##eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG5cbkRhdGEtQ29udHJhY3QtPj5BcHAtQ29udHJhY3Q6IEFsbG93LXZhbGlkLWNvbnRyYWN0IFxuQXBwLUNvbnRyYWN0LT4-K0RhdGEtVHJhaXQ6IGFwcC11cGRhdGUgKGlucHV0MSwgaW5wdXQyKVxuRGF0YS1UcmFpdC0-PitEYXRhLUNvbnRyYWN0OiB1cGRhdGUtdmFsdWVzIChpbnB1dDEsIGlucHV0MilcbkFwcC1Db250cmFjdC0-PitEYXRhLVRyYWl0OiBhcHAtYWRkICgpXG5EYXRhLVRyYWl0LT4-K0RhdGEtQ29udHJhY3Q6IGFkZCAoKVxuRGF0YS1Db250cmFjdC0-PitBcHAtQ29udHJhY3Q6ICgrIGlucHV0MSBpbnB1dDIpXG5cblxuICAgICAgICAgICAgIiwibWVybWFpZCI6IntcbiAgXCJ0aGVtZVwiOiBcImRlZmF1bHRcIlxufSIsInVwZGF0ZUVkaXRvciI6ZmFsc2UsImF1dG9TeW5jIjp0cnVlLCJ1cGRhdGVEaWFncmFtIjpmYWxzZX0)









