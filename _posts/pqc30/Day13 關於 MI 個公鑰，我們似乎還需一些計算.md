  

我們在 Day11 討論了 MI 協議。但是我們在當時所定義的公鑰是以下程式碼：

  

```

def Public_key(x):

x = T(x)

x = Central_Map_poly(x)

x = S(x)

return x

```

  

那這不就代表說，當我們公佈公鑰時，其中的私鑰 T, F, S 都必須一起發出去？

  

另外，在 Day12 討論了 MI 裡面的 F 是多元二次，所以 P(x) = S(F(T(x))) 是一個多元二次多項式系統。今天我們就使用程式來計算這個公鑰 P(x) 於是我們可以把它安全的發出去。

  
  

# 多元二次多項式的矩陣表示法

首先根據 Day12 的內容，我們知道公鑰 P 可以寫成：

$$

\mathcal{P} =

\left\{

\begin{aligned}

& p^{(1)}\left(x_1, x_2, \ldots, x_n\right)= \sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(1)} x_i x_j+\sum_{i=1}^n p_i^{(1)} x_i+p_0^{(1)} \\

& p^{(2)}\left(x_1, x_2, \ldots, x_n\right)= \sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(2)} x_i x_j+\sum_{i=1}^n p_i^{(2)} x_i+p_0^{(2)} \\

& \vdots \\

& p^{(m)}\left(x_1, x_2, \ldots, x_n\right)=\sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(m)} x_i x_j+\sum_{i=1}^n p_i^{(m)} x_i+p_0^{(m)}

\end{aligned}\right.

$$

其中係數都是固定的。

如果想要安全地把私鑰送出去，那我們就得乖乖的把上面這些係數通通算出來，然後發送這些係數出去。

為了讓程式好寫，我們在這裡使用矩陣表示法：

  

首先先看其中第 k 個多元二次多項式：

$$

p^{(k)}\left(x_1, x_2, \ldots, x_n\right)=

\sum_{i=1}^n \sum_{j=i}^n p_{i j}^{(k)} x_i x_j+

\sum_{i=1}^n p_i^{(k)} x_i+

p_0^{(k)}

$$

如果把 x 寫成行向量

$$

x = \begin{bmatrix}

x_1 \\ \vdots \\ x_n

\end{bmatrix}

$$

則有

$$

\begin{aligned}

\sum_{i=1}^n \sum_{j=i}^n p_{i j} x_i x_j

&=

\begin{bmatrix}

x_1 & \cdots & x_n

\end{bmatrix}

\begin{bmatrix}

p_{11} & p_{12} & \cdots & p_{1n} \\

0 & p_{22} & \cdots & p_{2n} \\

\vdots & \vdots & \ddots & \vdots \\

0 & 0 & \cdots & p_{nn} \\

\end{bmatrix}

\begin{bmatrix}

x_1 \\ \vdots \\ x_n

\end{bmatrix}

\\

&=x^{T}Qx

\end{aligned}

$$

  

$$

\begin{aligned}

\sum_{i=1}^n p_i x_i &=

\begin{bmatrix}

p_{1} & p_{2} & \cdots & p_{n}

\end{bmatrix}

\begin{bmatrix}

x_1 \\ \vdots \\ x_n

\end{bmatrix}

\\

&= L x

\end{aligned}

$$

  

於是我們可以寫出

$$

p^{(k)}\left(x_1, x_2, \ldots, x_n\right)=

x^{T}Q^{(k)}x+L^{(k)}x +C^{(k)}

$$

其中

$$

Q^{(k)} = \begin{bmatrix}

p_{11}^{(k)} & p_{12}^{(k)} & \cdots & p_{1n} ^{(k)}\\

0 & p_{22}^{(k)} & \cdots & p_{2n}^{(k)} \\

\vdots & \vdots & \ddots & \vdots \\

0 & 0 & \cdots & p_{nn}^{(k)} \\

\end{bmatrix}

\quad

L^{(k)} = \begin{bmatrix}

p_{1} ^{(k)}& p_{2} ^{(k)}& \cdots & p_{n} ^{(k)}

\end{bmatrix},

\quad C^{(k)} = p_{0}^{(k)}

$$

  

結論：

我們要計算出每個矩陣 Q, L, 以及常數項 C ，然後就可以當作公鑰發出去。

  

## MI 系統裡的特殊觀察

因為我們在 MI 系統內要設定 q = 2，也就是係數是 Z_2 裡面的元素，因此

$$

x_i^2 = x_i

$$

  

所以所有的線性項都可以當作二次項

$$

\sum_{i=1}^n p_i x_i =

\sum_{i=1}^n p_i x_i^2

$$

也因此，對 MI 系統來說，我們可以把 p^{(k)} 寫成

$$

p^{(k)}(x_1,...,x_n) = x^T Q^{(k)} x +C^{(k)}

$$

  
  
  
  

# 計算 MI 系統的公鑰係數

  

接下來，我們使用 SageMath 來實作這個矩陣表示法，並計算公鑰。

  
  

## 準備工作（再做一次 MI ）

首先，讓我們定義參數和隨機仿射映射

  

```

q = 2

n = 5 # degree of g(x)

  

R = quotient(ZZ, q*ZZ)

R_poly = PolynomialRing(R, 'x')

  

g = x^5 + x^3 + 1

R_poly_quotient = quotient(R_poly, g)

  

theta = 2

h = (xgcd((q^n)-1, (q^theta)+1))[2]

h = h + (q^n-1)

  

# 生成隨機仿射映射

def RandomAffineMapGenerator(n, R):

while True:

A = random_matrix(R, n, n)

if A.is_invertible():

break

b = random_vector(R, n)

  

def AffineMap(v):

v = vector(v)

v = A * v + b

return v.list()

  

def InverseMap(v):

v = vector(v)

v = A.inverse() * (v - b)

return v.list()

  

return AffineMap, InverseMap, A, b

  

S, S_inv, A_S, b_S = RandomAffineMapGenerator(n, R)

T, T_inv, A_T, b_T = RandomAffineMapGenerator(n, R)

```

  
  
  

```

def Central_Map_poly(X):

X = R_poly_quotient(X)

return (X^(q^theta + 1)).list()

  

def Central_Map_poly_inv(X):

X = R_poly_quotient(X)

return (X^h).list()

  

def Public_key(x):

x = T(x)

x = Central_Map_poly(x)

x = S(x)

return x

```

  
  

## 開始計算係數

  

我們先把每個 p^{(k)} 的常數項給算出來，並記錄在 C 這個 list 裡面

```

zero_vector = [0] * n

C = Public_key(zero_vector)

```

  
  

另外定義一個扣掉常數項之後的公鑰映射

```

def Homogeneous_Public_key(x):

x = Public_key(x)

for i in range(n):

x[i] = x[i] - C[i]

return x

```

定義這個之後我們就有

$$

\text{Homogeneous\_Public\_key}(x) = [x^T Q^{(1)} x, x^T Q^{(2)} x, ..., x^T Q^{(n)} x]

$$

也就是

$$

\text{Homogeneous\_Public\_key}(x) [k] = x^T Q^{(k)} x

$$

於是就可以很方便計算 Q^{(k)}.

  

我們在程式碼裡面使用 Q 來儲存所有的 Q^{(k)}：

$$

Q = [ Q^{(1)}, Q^{(2)},..., Q^{(n)}]

$$

```

# 先初始化為零，把形狀做好

Q = [[[0 for _ in range(n)] for _ in range(n)] for _ in range(n)]

```

  
  

先計算對角線項：

  

原理是因為如果 e_i = (0,...,1,...0) （只有在第 i 的位置是 1 其他都是零）那

$$

e_i^T Q^{(k)}e_i = Q^{(k)}_{ii}

$$

  

```

# 計算對角線項

for i in range(n):

for k in range(n):

e_i = [0 for _ in range(n)]

e_i[i] = 1

Q[k][i][i] = Homogeneous_Public_key(e_i)[k]

```

  
  
  

接著計算非對角線項：

  

原理是因為如果 e_ij = (0,...,1,...,1,...0) （只有在第 i, j 的位置是 1 其他都是零）

則

$$

e_{ij}^T Q^{(k)}e_{ij} = Q^{(k)}_{ii}+Q^{(k)}_{ij}+Q^{(k)}_{ji}+Q^{(k)}_{jj}

$$

  

但因為我們所設定的 Q 是上三角矩陣，所以 Q_ji = 0

因此我們知道

$$

\begin{aligned}

Q^{(k)}_{ij} &= e_{ij}^T Q^{(k)}e_{ij} - Q^{(k)}_{ii} - Q^{(k)}_{jj}\\

&= \text{Homogeneous\_Public\_key}(e_{ij}) [k] - Q[k][i][i] - Q[k][j][j]

\end{aligned}

$$

  
  

```

# 計算非對角線項

for k in range(n):

for i in range(n):

for j in range(i+1,n):

e_ij = [0 for _ in range(n)]

e_ij[i] = 1

e_ij[j] = 1

  

Q[k][i][j] = Homogeneous_Public_key(e_ij)[k] - (Q[k][i][i]) - Q[k][j][j]

  

```

  

好！幾乎完成了！現在已經可以把 Q = [Q^{(1)}, ..., Q^{(n)}] 以及常數項 C 釋出。

  

## 驗證正確性

為了驗證正確性，我們進行以下的驗證。

  

首先把 Q 裡面的每個矩陣 Q^{(k)} 都轉化為 SageMath 裡面的矩陣類別，後面的乘法就可以寫得很簡單：

```

for k in range(n):

Q[k] = matrix(Q[k])

```

  
  

於是可以做出以下根據矩陣 Q^{(k)} 以及常數項 C 所做的公鑰：

```

def Publishable_Public_Key(x):

x = (Matrix([[x[i]] for i in range(n)]))

result = []

for k in range(n):

result.append(x.T * Q[k] * x + C[k])

  
  

result = [result[i][0][0] for i in range(n)]

```

  

並進行驗證

```

for _ in range(100):

x = [R(randint(0,1)) for i in range(5)]

result = Public_key(x)

result2 = Publishable_Public_Key(x)

if not (result == result2):

print("WRONG Public Key")

break

```