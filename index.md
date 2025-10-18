---
layout: default
title: "Cesare Huang's Homepage"
abstract: |
    I study the intersection of computational number theory and
    cryptographic engineering.
    My work focuses on building high-performance and formally verified 
    cryptographic implementations.
---

## Table of Contents
* TOC
{:toc}


## Introduction
From differential equations used in atmospheric modeling to number-theoretic computations in modern cryptography, mathematics has become an essential foundation of modern engineering.
I am interested in uncovering deeper mathematical structures and applying them to contemporary computational science. In addition to exploring mathematical applications across disciplines, I work at the boundary where mathematics meets machine code — pushing hardware to its computational limits.



## Research Interests

- Implementing cryptographic primitives in AArch64 assembly
- Formal verification of low-level cryptographic assembly program 


## My Blog Writings


- In 2024, I wrote a series of introduction to Post-Quantum 
    Cryptography, and has submitted to a technical blog contest held
    by <a href="https://ithelp.ithome.com.tw/2024ironman">ITHome</a>.
    This series consists of 30 articles and covers 

    - lattice based (2 - 9), 
    - multivariate-quadratic system based (10 - 17), 
    - hash based (18 - 23), and 
    - code based (24 - 29)

    cryptographic schemes.
    Besides intuitive mathematics explanation, most cryptographic 
    schemes are provided with runnable SageMath code.
    Last but not least, this series won the second place in the
    "data security" track in the ITHome contest mentioned.
    - [Day 01：前言](/pqc30/day01.html)


## My Talks

- In 2025 August, I was invited to give a lecture on Number Theoretic 
Transform at Core Program held by ZK Education
    - <a href="/documents/NTT_Tutorial_short_handout_2025_aug28.pdf">
    slide</a>
    
$$
\frac{\mathbb{Z}_{p}[x]}{\langle x^{2n} - 1\rangle}
\cong
\frac{\mathbb{Z}_{p}[x]}{\langle x^{n} - 1\rangle}
\times
\frac{\mathbb{Z}_{p}[x]}{\langle x^{n} + 1\rangle}
$$



- In 2025 October, I was invited to give a brief introduction on
SafeGCD (Also known as Bernstein-Yang Inversion) in the course 
"Cryptography Engineering" at NTU
    - <a href="/documents/safegcd_2025_oct7.pdf"> slide </a>

$$
\mathrm{Divstep}(\delta, f, g) = 
\left\{
\begin{aligned}
&(2 + \delta, f, g/2)  
    \text{ if } g \bmod 2 = 0 \\
&(2 + \delta, f, (g+f)/2)  
    \text{ if } \delta < 0 \text{ and } g \bmod 2 = 1 \\
&(2 - \delta, g, (g-f)/2)  
    \text{ if } \delta \ge 0 \text{ and } g \bmod 2 = 1 \\
\end{aligned}
\right.
$$





## Contact Information
Feel free to reach me via:
- [GitHub](https://github.com/cheng-wei-huang0612)
- [Email](mailto:cesarehuang@icloud.com)


## Acknowledgement




