
# 多元二次多項式

## 數學描述
多元二次多項式系統是形如以下的多項式系統：
$$
\begin{aligned}
& p^{(1)}\left(x_1, x_2, \ldots, x_n\right)= \sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(1)} x_i x_j+\sum_{i=1}^n p_i^{(1)} x_i+p_0^{(1)} \\
& p^{(2)}\left(x_1, x_2, \ldots, x_n\right)= \sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(2)} x_i x_j+\sum_{i=1}^n p_i^{(2)} x_i+p_0^{(2)} \\
& \vdots \\
& p^{(m)}\left(x_1, x_2, \ldots, x_n\right)=\sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(m)} x_i x_j+\sum_{i=1}^n p_i^{(m)} x_i+p_0^{(m)}
\end{aligned}
$$
這裡，每個多項式 $p^{(k)}(x_1, x_2, \ldots, x_n)$ 都是變量 $x_1, x_2, \ldots, x_n$ 的二次多項式。每個多項式由二次項、一次項和常數項組成。讓我們來看一個具體的例子

假設我們有兩個變量 $x_1$ 和 $x_2$，以及兩個多項式 $p^{(1)}$ 和 $p^{(2)}$，構成的多變量二次多項式系統可以表示如下：

$$
\begin{aligned}
& p^{(1)}\left(x_1, x_2\right)=3 x_1^2+2 x_1 x_2+x_2^2+4 x_1+5 x_2+6 \\
& p^{(2)}\left(x_1, x_2\right)=x_1^2+3 x_1 x_2+2 x_2^2+x_1+2 x_2+3
\end{aligned}
$$

在這個例子中，我們可以看到每個多項式都包含了二次項（如 $3x_1^2$）、一次項（如 $4x_1$）和常數項（如 $6$）。這些多項式可以用來構造多變量加密系統。


## 困難問題
假設我們把上面這個例子記做 F
$$
\mathcal{F}(x_{1},x_{2}) = (p^{(1)}(x_{1},x_{2}),p^{(1)}(x_{1},x_{2}))
$$
那我們可以很快速的求到函數值
$$
\mathcal{F}(1,2) = (31,23)
$$

可是如果反過來，要找到某組 (x1, x2) 滿足
$$
\mathcal{F}(x_{1},x_{2})=(27,1)
$$
那這個問題是，蠻複雜的（歡迎求到解的朋友在底下留言😀）

因此，對於一個多元二次方程組來說
$$
\mathcal{F = }
\left\{
\begin{aligned}
& p^{(1)}\left(x_1, x_2, \ldots, x_n\right)= \sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(1)} x_i x_j+\sum_{i=1}^n p_i^{(1)} x_i+p_0^{(1)} \\
& p^{(2)}\left(x_1, x_2, \ldots, x_n\right)= \sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(2)} x_i x_j+\sum_{i=1}^n p_i^{(2)} x_i+p_0^{(2)} \\
& \vdots \\
& p^{(m)}\left(x_1, x_2, \ldots, x_n\right)=\sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(m)} x_i x_j+\sum_{i=1}^n p_i^{(m)} x_i+p_0^{(m)}
\end{aligned}\right.
$$
要計算 F 的反函數，是非常困難的。也因為這樣的困難度（hardness）我們可以把它設計成密碼協議

# 雙極構造法

我們開始來介紹，這樣的數學物件如何被做成密碼協議

## 線性變換與仿射變換

所謂的線性變換就是用一個矩陣乘上作用的向量，如以下算式
$$
\begin{bmatrix}
a_{11} & a_{12} \\
a_{21} & a_{22}
\end{bmatrix}\begin{bmatrix}
x_{1}\\x_{2}
\end{bmatrix} = \begin{bmatrix}
y_{1} \\
y_{2}
\end{bmatrix}
$$
這個算式就是一個對
$$
\begin{bmatrix}
x_{1} \\
x_{2}
\end{bmatrix}
$$
的線性變換。

所謂的仿射變換就是在線性變換之後再加上一個常數向量，如以下算式
$$
\begin{bmatrix}
a_{11} & a_{12} \\
a_{21} & a_{22}
\end{bmatrix}\begin{bmatrix}
x_{1}\\x_{2}
\end{bmatrix} +\begin{bmatrix}
b_{1} \\
b_{2}
\end{bmatrix}= \begin{bmatrix}
z_{1} \\
z_{2}
\end{bmatrix}
$$
這個算式就是一個對
$$
\begin{bmatrix}
x_{1} \\
x_{2}
\end{bmatrix}
$$
的仿射變換。

接著，以下這個特殊矩陣無論乘上誰，都不會改變他：
$$
I = \begin{bmatrix}
1  & 0 & \cdots & 0 \\
0  & 1 & \cdots & 0 \\ 
\vdots & \vdots & \ddots & \vdots \\
0 & 0 & \cdots & 1
\end{bmatrix}
$$
$$
A\cdot I = A = I\cdot A
$$

再來，我們說一個矩陣 A 是可逆的，如果他有乘法反元素（又是你乘法反元素），即可以找到一個矩陣 A^-1 ：
$$
A \cdot A^{-1} = I
$$
## 雙極構造法

首先我們要生成兩個在 n 維度空間中的可逆的仿射變換：
$$
\mathcal{T}(\mathbf{x}) = \mathbf{A}_{\mathcal{T}}\cdot \mathbf{x}+\mathbf{b}_{\mathcal{T}}
\quad
\mathcal{S}(\mathbf{x}) = \mathbf{A}_{\mathcal{S}}\cdot \mathbf{x}+\mathbf{b}_{\mathcal{S}}
$$
其中我們要求：首先 A_T 與 A_S 都要可逆，其次 T 是 n 維空間上的仿射變換、S 是 m 維空間上的仿射變換。

我們也要生成一個「很好求反函數的」多元二次多項式系統 F ，這裡的「很好求反函數」是雙極構造法中的規定，至於如何生成這樣「很好求反函數的」多元二次多項式，我們會在後面介紹幾種不同的生成方法。

好！我們有一個「很好求反函數的」多元二次多項式系統 F ：
$$
\mathcal{F} (x_{1},\dots,x_{n}) =\mathcal{F}(\mathbf{x})= 
(p^{(1)}(\mathbf{x}),\dots,p^{(m)}(\mathbf{x}))
$$
這是一個從 n 維空間到 m 維空間的函數。

我們於是可以把剛剛這三個東西串起來：
$$
\mathcal{S}(\mathcal{F}(\mathcal{T}(\mathbf{x})))
$$
一開始 x 是一個 n 維向量，接著被 T 送到一個 n 維向量，接著被 F 送到 m 維向量，最後被 S 送到一個 m 維向量。

雖然 F 是一個很好求反函數的多元二次多項式，但是經過 S 與 T 的雙面夾擊後（這裡的 S 與 T 都是隨機生成），最後的結果 S(F(T(x)))，仍然是一個多元二次多項式，而且是係數很亂，看起來根本就是隨機生成的多元二次多項式，此時，求反函數的問題就困難許多。

因此，私鑰為 (T, S, F) 三個函數，而公鑰為 S(F(T(x)))，就完成一個公要鑰密碼系統啦！





ref
DING, Jintai; GOWER, Jason E.; SCHMIDT, Dieter S. _Multivariate public key cryptosystems_. Springer Science & Business Media, 2006.

