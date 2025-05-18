為了講解真正有用的晶格密碼學，我們需要先了解「多項式環」與「多項式商環」。不過不用緊張，他跟我們之前看到的整數商環非常類似！我們今天來討論「多項式商環」

# 多項式除法

相信各位在中學時就有學過所謂的多項式除法：給定兩個多項式 f(x) 與 g(x) 請找到 q(x) 與 r(x) 滿足
$$
f(x) = q(x)g(x)+r(x)
$$
其中 r(x) 如果等於零，我們說 g(x) 整除 f(x) ，如果 r(x) 不等於零，那我們稱 r(x) 為餘式，其次數應該要比 g(x) 的次數小。
我們可以看以下舉例：

第一個例子：
給定多項式 $f(x) = 2x^3 + 4x^2 - 6x$ 和 $g(x) = x - 1$，我們可以進行多項式除法，找到 $q(x)$ 與 $r(x)$，使得：

$$
f(x) = q(x)g(x) + r(x)
$$
而答案為：
$$
q(x) = 2x^{2} +6x, \quad r(x) = 0
$$
因為餘式等於零，所以這裡 g(x) 整除 f(x) 

另一個例子：
給定多項式 $f(x) = x^3 + 2x + 1$ 和 $g(x) = x - 1$，我們進行多項式除法，找到 $q(x)$ 與 $r(x)$，使得：

$$
f(x) = q(x)g(x) + r(x)
$$
而答案為：

$$
q(x) = x^{2} + x + 3,\quad r(x) = 4
$$
在這裡，餘式 $r(x) = 4$，這表示 $g(x)$ 不整
除 $f(x)$。

# 多項式商環（多項式的模算數）

讓我們回憶以前學習過的
$$
\mathbb{Z}/q\mathbb{Z} = \{ 0,1,2,\dots,q-1 \}.
$$
這個環裡面的算數，其實就是取數字除以 q 的餘數。我們可以借用同樣的想法來定義多項式的模算數。固定一個 g(x) ，考慮以下模除 g(x) 的運算

首先是模化約：
$$
f(x)  \quad \mathrm{mod} \ g(x)  = r(x)
$$
得到的是多項式 f(x) 除以 g(x) 所得到的餘式 r(x) 

再來是模加法：
$$
f_{1}(x)+f_{2}(x) \quad \mathrm{mod} \ g(x)  
$$
得到的是兩個多項式的和除以 g(x) 所得到的餘式

最後是模乘法：
$$
f_{1}(x)\times f_{2}(x) \quad \mathrm{mod} \ g(x)  
$$
得到的是兩個多項式的積除以 g(x) 所得到的餘式

好！模化約告訴我們，我們實際在考慮的集合其實是：
$$
\{
f(x):\mathrm{deg} (f(x))<\mathrm{deg} (g(x))
\}
$$
因為如果 f(x) 的次數大於 g(x) 的次數，則 g(x) 可以再除 f(x) 並得到更小的餘式 r(x) ，這個更小的餘式在模運算下與原本的 f(x) 視為同一個元素。

有了集合之後，搭配上剛剛的模加法與模乘法，三個部件湊齊，就可以構成一個環！這個環就叫做多項式商環。如果我們一開始所考慮的多項式環其係數是在整數 Z 上，那我們符號上可以把這樣新的環記做
$$
\mathbb{Z}[x] / \langle g(x)\rangle
$$
（又有新符號可以到處擺弄了😂


# 明天會用到的實際例子

各位還記得以下符號嗎？
$$
\mathbb{Z} / q\mathbb{Z} [x]
$$

這個符號代表「係數在模除 q 的整數環的多項式的集合」，有時我們會把它剪寫成右邊的樣子：
$$
\mathbb{Z} / q\mathbb{Z}[x] = \mathbb{Z}_{q }[x]
$$
好節省紙張與墨水（？

在我們剛剛學到多項式模算數後，為了之後的晶格密碼學，需要研究以下這類的多項式商環：給定一個正整數 N，
$$
\mathbb{Z}_{q}[x] / \langle x^N-1\rangle.
$$


舉例來說，我們會實際用到以下的多項式商環：
$$
\mathbb{Z}_{2048}[x] / \langle x^{677}-1\rangle,\quad
\mathbb{Z}_{4096}[x] / \langle x^{821}-1\rangle.
$$


## 使用 SageMath 實作
我們考慮：
$$
\mathbb{Z}_{17}[x] / \langle x^4-1 \rangle
$$

先在 SageMath 中定義這樣的類別：
```
# 定義係數環 Z/17Z
R_q = quotient(ZZ, 17*ZZ)

# 定義多項式環 Z/17Z[x]
R_q_poly = PolynomialRing(R_q,x)

# 定義多項式商環 Z/17Z[x] / (x^4 - 1)
R_q_poly_quotient = quotient(R_q_poly, x^4-1)

print(R_q)
print(R_q_poly)
print(R_q_poly_quotient)

# Outputs:
# Ring of integers modulo 17
# Univariate Polynomial Ring in x over Ring of integers modulo 17
# Univariate Quotient Polynomial Ring in xbar over Ring of integers modulo 17 with modulus x^4 + 16
```

你可以注意到，我們明明在最後模除 x^4 - 1 ，但他輸出 modulus x^4 + 16 。這是因為 -1 在係數環 Z_17 中應該是 16 。

模化約：
```
f = R_q_poly([6, 8, 14, 1, 12, 12])
print(f)

# 模化約，把原本的 f 化約到 Z/17Z[x] / (x^4 - 1) 集合內
f = R_q_poly_quotient(f)
print(f)


# Outputs:
# 12*x^5 + 12*x^4 + x^3 + 14*x^2 + 8*x + 6
# xbar^3 + 14*xbar^2 + 3*xbar + 1
```

首先先找一個在「係數模除 q 的多項式環」裡的元素，這裡選擇一個六次的 
$$
f(x) = 6 + 8x + 14x^{2} + x^{3} +  12x^{4} + 12x^{5} \in \mathbb{Z}_{17}[x]
$$
接著取 f(x) 除以 x^4 - 1 的餘式，得到
$$
f(x) = 1 + 3x+14x^{2} + x^{3} \in \mathbb{Z}_{17} [x] / \langle x^4 - 1\rangle
$$

你可以看見 SageMath 最後的輸出是使用 xbar 而非 x ，原因是 SageMath 認為有模除與沒模除是兩個不同的環，因此要用不同的變數來區分。
 
接著，模加法與模乘法就很簡單可以執行

模加法：
```
# 定義多項式
f1 = R_q_poly_quotient([6, 7, 14, 2])
f2 = R_q_poly_quotient([3, 9, 12, 7])

print(f1)
print(f2, "\n")


# 模加法
add_result = f1 + f2
print(add_result)

# Outputs:
# 2*xbar^3 + 14*xbar^2 + 7*xbar + 6
# 7*xbar^3 + 12*xbar^2 + 9*xbar + 3 

# 9*xbar^3 + 9*xbar^2 + 16*xbar + 9
```

模乘法：
```
# 定義多項式
f1 = R_q_poly([6, 7, 14, 2])
f2 = R_q_poly([3, 9, 12, 7])

print(f1)
print(f2, "\n")
print("正常的模除 q 係數多項式乘法結果為：", f1*f2, "\n")

# 先將 f 與 g 模化約（為了把 f 與 g 弄到對的類別）
f1 = R_q_poly_quotient(f1)
f2 = R_q_poly_quotient(f2)


# 模乘法
mul_result = f1 * f2
print("模除 q 也模除 x^4 - 1 的乘法結果為：", mul_result)

# Outputs:
# 2*x^3 + 14*x^2 + 7*x + 6
# 7*x^3 + 12*x^2 + 9*x + 3 

# 正常的模除 q 係數多項式乘法結果為： 14*x^6 + 3*x^5 + 14*x^4 + 3*x^3 + 7*x^2 + 7*x + 1 

# 模除 q 也模除 x^4 - 1 的乘法結果為： 3*xbar^3 + 4*xbar^2 + 10*xbar + 15
```

（練習）你可以試試看以下的環如何在 SageMath 中定義：
$$
\mathbb{Z}_{2048}[x] / \langle x^{677}-1\rangle,\quad
\mathbb{Z}_{4096}[x] / \langle x^{821}-1\rangle.
$$


# 乘法反元素：
我們在介紹二維晶格密碼學前，有先介紹在 Z/qZ 中的乘法反元素。現在我們也可以在多項式模算數（多項式商環）裡考慮一樣的概念：

繼續使用以上舉例的數字，給定多項式 f(x) 你可不可以找到 g(x) 滿足
$$
f(x) \times g(x) =1  \quad \text{ in }\quad  \mathbb{Z}_{17}[x] /\langle x^4-1 \rangle
$$
那情況與之前都很類似，你可以使用多項式的擴展歐幾里得演算法（多項式的輾轉相除法）來計算這個乘法反元素。但是 SageMath 已經幫我們做好所有功能：

```
f = R_q_poly_quotient([8, 2, 3, 7])
g = f^(-1)

print(f)
print(g)

print(f*g)


# Outputs:
# 7*xbar^3 + 3*xbar^2 + 2*xbar + 8
# 6*xbar^3 + 2*xbar^2 + xbar + 14
# 1
```


好的，我們已經準備好，明天來介紹真正有用的「吾乃數論學家」晶格密碼系統！

# Takeaway

- 多項式的模算數如何進行？與之前的整數模算數類似，是取餘數的算法
- 如何在 SageMath 中定義多項式商環？
- 何謂乘法反元素，如何在 SageMath 中求得？