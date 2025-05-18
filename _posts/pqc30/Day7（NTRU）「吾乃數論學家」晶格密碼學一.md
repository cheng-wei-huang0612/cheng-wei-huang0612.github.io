
今天會著重介紹協議本身，並搭配 SageMath 實作。
明天則會介紹著名的攻擊方式：LLL Reduction

# 開始之前

NTRU 密碼系統，翻譯為「吾乃數論學家」密碼系統。其實與我們之前討論過的二維晶格密碼系統非常類似。除了加密過程中會有各種模算數以外，解密的正確性也有類似模式：因為係數的大小可以被控制，所以會得到比模數等號還強的整數等號。


## 符號

我們也趁這時候先講好一些約定符號：
首先我們要考慮以下三個多項式商環
$$
R = \mathbb{Z}[x] / \langle x^N-1\rangle,\quad
R_{p} = \mathbb{Z}_{p}[x] / \langle x^N-1\rangle,\quad
R_{q} = \mathbb{Z}_{q}[x] / \langle x^N-1\rangle
$$

再來，我們要考慮這種集合
$$
T(a,b)  \subset R
$$
裡面包涵「洽有 a 個係數等於 1、洽有 b 個係數等於 -1、其他係數等於 0 」的所有多項式：例如
$$
1+x -x^2 + x^{6} \in T(3,1).
$$
這種集合被稱為「三元多項式」（ternary polynomial）

後續的 SageMath 程式中，我們會使用 `ternary_polynomial(a, b, N)` 函數來生成這些多項式。

## 係數有號提升（center-lift）

另外我們需要一個重要概念：「有號提升」Center-lift
我們之前講過所謂的「提升」（lift），就是直接把整數商環的整數當作平常的整數來用。如果本來是模除 m 的整數商環，那提升的結果會是落在 0, 1, ..., m-1。

所謂的「有號提升」是指，把每個在模除 m 的整數商環，都提升至以下區間內的整數：
$$
\left( -\frac{m}{2}, \frac{m}{2} \right]
$$

如果你對一個在
$$
R_{q} = \mathbb{Z}_{q}[x] / \langle x^N-1\rangle
$$
裡面的多項式進行有號提升，其結果就是把每個係數都提升到 (-m/2, m/2] 的區間。



# 密碼系統
## 密鑰生成
數組 (N, p, q, d)
- N, p 為質數
- gcd(N,q) = gcd(p,q) = 1 ，也就是 q 與 N, p皆互質。
- q > (6d + 1) p 這是為了最後解碼的正確性而做的設定，暫且不需理會。

以上這些可稱為，全域參數（global parameters），是公開資訊的一部分。

```
# NTRU parameters
N = 11  # degree of the polynomial, should be prime
p = 3   # small modulus
q = 73  # large modulus
d = 2


print(q > (6*d+1)*p)


# Polynomial ring
R_poly = quotient(PolynomialRing(ZZ,x),x^N-1)
R_q = quotient(ZZ,q*ZZ)
R_q_poly = quotient(PolynomialRing(R_q,x),x^N-1)
R_p = quotient(ZZ,p*ZZ)
R_p_poly = quotient(PolynomialRing(R_p,x),x^N-1)

# Outputs:
# True
```


Alice 隨機生成以下兩個多項式：
- $f(x) \in  T(d+1,d)$
- $g(x) \in  T(d,d)$
並計算
- $F_q(x) = (f(x))^{-1} \in R_{q}$ 
- $F_p(x) = (f(x))^{-1} \in R_{p}$ 
如果上面這兩個皆不存在，重新生成$f$

```
# Ternary polynomial generation 
def ternary_polynomial(d1, d2, N):
    poly_coeffs = [1]*d1 + [-1]*d2 + [0]*(N-d1-d2)
    shuffle(poly_coeffs)
    return R_poly(poly_coeffs)

f = ternary_polynomial(d+1,d,N)
g = ternary_polynomial(d,d,N)

F_q = R_q_poly(f)^(-1)
F_p = R_p_poly(f)^(-1)
```

接著在 R_q 中計算
$$
h(x) = F_{q}(x) g(x) \in R_{q}
$$
F_p 可為留作解密使用。

```
h = F_q*R_q_poly(g)
print(h)

# Outputs:
# 67*xbar^10 + 44*xbar^9 + 55*xbar^8 + 59*xbar^7 + 16*xbar^6 + 36*xbar^5 + 47*xbar^4 + 31*xbar^3 + 71*xbar^2 + 22*xbar + 63
```

公鑰為：h(x)、以及 (N, p, q, d)
私鑰為：f(x), g(x)


## 加密訊息
加密：Bob 欲傳加密訊息給 Alice
- Bob 將要傳的訊息表示為一個多項式：
$$
m(x) \in R\quad -\frac{p}{2} <m_{i}\le \frac{p}{2}
$$
- Bob 選擇一個隨機的多項式 
$$
r(x) \in \mathcal T(d,d)
$$

```
m = R_poly([0,1,0,0,0,1,1])
r = ternary_polynomial(d,d,N)
```

計算密文：
$$
e(x) = p h(x) r(x) + m(x) \in R_{q}
$$
```
e = p*R_q_poly(h)*R_q_poly(r) + R_q_poly(m)
print(e)

# Outputs:
# 3*xbar^10 + 13*xbar^9 + 27*xbar^8 + 21*xbar^7 + 9*xbar^6 + 58*xbar^5 + 48*xbar^4 + 16*xbar^3 + 38*xbar^2 + 15*xbar + 47
```

## 解密訊息
解密：Alice 收到 Bob 傳送過來的 e(x)

在 R_q 中計算
$$
a(x) = f(x)e(x) \in R_{q}
$$
```
a = R_q_poly(f) * e
print(a)

# Outputs:
# xbar^10 + 72*xbar^9 + 2*xbar^8 + 67*xbar^7 + xbar^6 + 9*xbar^5 + 63*xbar^4 + 72*xbar^3 + 7*xbar^2 + 72*xbar + 2
```
 
將 $a(x)$ 做有號提升到 $R$
```
# Center-lift function
def center_lift(poly, q):
    # 先把係數列出來
    original_coeff = poly.list()

    # 把比 q/2 還大的數字減去 q 
    center_lifted_coeffs = []
    for coeff in original_coeff:
        if coeff > (q // 2):
            coeff -= q
        center_lifted_coeffs.append(coeff)
    return R_poly(center_lifted_coeffs)


a = center_lift(a,q)
print(a)


# Outputs:
# xbar^10 + 72*xbar^9 + 2*xbar^8 + 67*xbar^7 + xbar^6 + 9*xbar^5 + 63*xbar^4 + 72*xbar^3 + 7*xbar^2 + 72*xbar + 2
```

最後在 R_p 中計算
$$
b(x) = F_{p}(x)a(x) \in R_{p}
$$
此 $b(x)$ 即等於 $m(x)$。
```
a = center_lift(a,q)
print(a)
print(type(a))

# Outputs:
# xbar^10 - xbar^9 + 2*xbar^8 - 6*xbar^7 + xbar^6 + 9*xbar^5 - 10*xbar^4 - xbar^3 + 7*xbar^2 - xbar + 2
# <class 'sage.rings.polynomial.polynomial_quotient_ring.PolynomialQuotientRing_generic_with_category.element_class'>
```


好！看到這裡，你大概很好奇：「為什麼這樣胡搞瞎搞最後解密會成功？」我們以下開始詳細的數學證明。

# 正確性
首先我們展開多項式 $a(x)$
$$
\begin{aligned} a(x) &= f(x) \cdot e(x) \pmod{q} \\ &= f(x) \cdot (ph(x) \cdot r(x) + m(x)) \pmod{q} \\ &= pf(x) \cdot F_q(x) \cdot g(x) \cdot r(x) + f(x) \cdot m(x) \pmod{q} \\ &= pg(x) \cdot r(x) + f(x) \cdot m(x) \pmod{q} \end{aligned}
$$
好的，我們來對
$$
pg(x) \cdot r(x) + f(x) \cdot m(x) \pmod{q}
$$
做分析：
首先注意到根據我們的構造， $g(x),r(x) \in\mathcal T(d,d)$，所以乘積 $g(x) r(x)$ 可能的最大係數為 $2d$ 。（這種情況是兩個多項式的 $1$ 與 $-1$ 都互相有配對到的時候）
又注意到 $f(x) \in \mathcal T(d+1,d)$，而 $m(x)$ 的係數落於
$$- \frac{p}{2} <m_{i} \le \frac{p}{2}$$
所以乘積 $f(x) m(x)$ 可能的最大係數為 $(2d+1)\cdot \frac{p}{2}$。
因此，
$$
a(x) = p g(x) \cdot r(x)+f(x)\cdot m(x)
$$
的可能最大係數為
$$
p \cdot (2d) + (2d+1)\cdot \frac{p}{2} = \left( 3d+\frac{1}{2} \right)p
$$
根據我們選擇全域參數設定： $(6d+1)p<q$ ，我們知道
$$
p \cdot (2d) + (2d+1)\cdot \frac{p}{2} = \left( 3d+\frac{1}{2} \right)p < \frac{q}{2}
$$
所以當 Alice 計算完 $a(x)$ 並有號提升到 $R$ 時，以下的等式
$$
a(x) = pg(x) \cdot r(x) + f(x) \cdot m(x) 
$$
仍然在 $R$ 成立。（注意：根據解密的過程，我們原先只知道在模除 $q$ 之下有以上等式，現在是不需模除 $q$ 而等式仍然成立）
e
接著我們可以繼續做模 $p$ 的運算（在 $R_{p}$ 裡的運算）：
$$
\begin{aligned} b(x) &= F_p(x) \cdot a(x) \pmod{p} \\ &= F_p(x) \cdot (pg(x) \cdot r(x) + f(x) \cdot m(x)) \pmod{p} \\ &= F_p(x) \cdot f(x) \cdot m(x) \pmod{p} \\ &= m(x) \pmod{p} \end{aligned}
$$
於是，我們可以正確的解碼。

跟當時講二維晶格時類似的事情又發生了，通篇文章沒看到什麼向量之類的符號，這與晶格密碼學有什麼關係？明天我們就來看這個密碼系統的攻擊方法，在這當中就會有晶格問題！

# Takeaway


- 了解 NTRU 密碼系統的運作
- 了解在 SageMath 中多項式商環的操作
- NTRU 解密的正確性與我們之前在二維晶格內運用的手法類似，都是控制數字的大小，好建立整數上的等價關係。