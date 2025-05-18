
HORS（Hash to Obtain Random Subsets）是一種少數次簽章方案，它利用哈希函數和隨機子集的概念，實現了簽章的快速生成與驗證。同時，通過適當的參數選擇，HORS 可以在安全性和效率之間取得良好的平衡。

# 系統介紹

我們首先將要簽章的訊息分為區段：
$$
d = d_{1},d_{2},\dots,d_{end}
$$
每段都有 log2(t) 位元（其中 t 為系統參數，通常是 2 的某次方）

接著將每個區段解釋為一個二進位整數，叫做索引值。
$$
\mathrm{indices} = \{ \mathrm{index}_{1},\mathrm{index}_{2},\dots, \mathrm{index}_{end}\}
$$
$$
\mathrm{index}_{i} = \mathrm{int}(d_{i},2)
$$
（意思是將區塊 d_i 當作二進位整數，並輸出為一個整數 index_i）

生成 t 個私鑰，每個私鑰都是 n 位元的二進位字串，而他們的雜湊值就是公鑰。
$$
\mathrm{SK}=\{\mathrm{sk}_{0},\mathrm{sk}_{1},\dots,\mathrm{sk}_{t-1}\}
$$$$
\mathrm{PK}=\{\mathrm{pk}_{0},\mathrm{pk}_{1},\dots,\mathrm{pk}_{t-1}\}
$$
$$
\mathrm{pk}_{i}= \mathcal{H}(\mathrm{sk}_{i})
$$
最後，就可以設計簽章為
$$
\sigma 
= \{\sigma_{1},\dots,\sigma_{end}\}
$$
$$
\sigma_{i} = \mathrm{sk}_{\mathrm{index}_{i}} = \mathrm{SK}[\mathrm{index}_{i}]
$$
而驗章時就對每個區段檢查
$$
\mathcal{H}(\sigma_{i}) = \mathrm{PK}[\mathrm{index}_{i}]
$$

# 完整的系統

## 參數與鑰匙生成

### 參數
參數 t ：我們會把訊息分割為 log2(t) 的長度
$$
d = \underbrace{ d_{1} }_{ \log_{2}t },\underbrace{ d_{2} }_{ \log_{2}t},\dots,\underbrace{ d_{end} }_{ \log_{2}t}
$$
我們設定所使用的雜湊函數是使用 SHA-256 ，也設定這個訊息是雜湊函數後的結果（因此固定長度）

### 公私鑰
私鑰
$$
\mathrm{SK}=\{\mathrm{sk}_{0},\mathrm{sk}_{1},\dots,\mathrm{sk}_{t-1}\}
$$
其中每個 sk 都是長度為 n = 256 的二進位字串。
$$
\mathrm{PK}=\{\mathrm{pk}_{0},\mathrm{pk}_{1},\dots,\mathrm{pk}_{t-1}\}
$$
$$
\mathrm{pk}_{i}= \mathcal{H}(\mathrm{sk}_{i})
$$

因為我們選用 SHA-256 所以每個 pk 都是 n = 256 長度的二進位字串。
公佈公鑰給驗章者


## 簽章
首先先進行訊息分段：
$$
d = \underbrace{ d_{1} }_{ \log_{2}t },\underbrace{ d_{2} }_{ \log_{2}t},\dots,\underbrace{ d_{end} }_{ \log_{2}t}
$$
計算每個區塊的索引
$$
\mathrm{index}_{i} = \mathrm{int}(d_{i},2)
$$
$$
\mathrm{indices} = \{ \mathrm{index}_{1},\mathrm{index}_{2},\dots, \mathrm{index}_{end}\}
$$

並找出每段對應的私鑰
$$
\sigma 
= \{\sigma_{1},\dots,\sigma_{end}\}
$$
$$
\sigma_{i} = \mathrm{sk}_{\mathrm{index}_{i}} = \mathrm{SK}[\mathrm{index}_{i}]
$$

發送訊息跟簽章給驗章者
## 驗章

首先先進行訊息分段：
$$
d = \underbrace{ d_{1} }_{ \log_{2}t },\underbrace{ d_{2} }_{ \log_{2}t},\dots,\underbrace{ d_{end} }_{ \log_{2}t}
$$
計算每個區塊的索引
$$
\mathrm{index}_{i} = \mathrm{int}(d_{i},2)
$$
$$
\mathrm{indices} = \{ \mathrm{index}_{1},\mathrm{index}_{2},\dots, \mathrm{index}_{end}\}
$$
驗證所有索引的 hash 值
$$
\mathcal{H}(\sigma_{i}) 
\overset{?}{=} \mathrm{pk}_{\mathrm{index}_{i}} = \mathrm{PK}[\mathrm{index_{i}}]
$$
如果所有的等號都成立，則驗章成功。


# 實作系統

首先定義好雜湊函數：
```
import hashlib
import random

# 定義哈希函數 (SHA-256)，輸入和輸出均為位元串
def hash_func(bitstring):
    # 將位元串轉換為位元組
    byte_data = int(bitstring, 2).to_bytes((len(bitstring) + 7) // 8, byteorder='big')
    # 計算 SHA-256 哈希值
    sha256_hash = hashlib.sha256(byte_data).digest()
    # 將哈希結果轉換為二進位格式，並返回 256 位的二進位字串
    return ''.join(f'{byte:08b}' for byte in sha256_hash)

```


## 參數與鑰匙生成
```
# 參數選擇
logt = 8
t = 2**8  # 公鑰中哈希值的總數量
k = 32     # 簽章中選擇的哈希值數量
n = 256    # 哈希輸出的位元長度（256 位元）

# 生成 n 位元的隨機位串
def generate_random_bitstring(n):
    return ''.join(str(random.randint(0, 1)) for _ in range(n))

# 密鑰生成
def keygen():
    SK = [generate_random_bitstring(n) for _ in range(t)]
    PK = [hash_func(sk) for sk in SK]
    return SK, PK

SK,PK = keygen()
print("SK[0]:", SK[0][:64], "...")
print("PK[0]:", PK[0][:64], "...")


# Outputs:
# SK[0]: 1010010010111001011010101110111100001101010000100011011001101000 ...
# PK[0]: 0011010010110000001001011000100011010010010111110000100001010110 ...
```

## 簽章

```
# 將訊息轉換為他的 hash 值

def message_to_binary(message):
    return ''.join(format(ord(c), '08b') for c in message)

message = "Hi! This is Cesare!"
message_bits = message_to_binary(message)
message_hash = hash_func(message_bits)

print(message_hash)

# Outputs:
# 0010111001001011011001000011001001111100000000111010011110001010010011110011001000011001111010100001110001101110101101001001110001100111101101011001000101010011011101111100111101011001111110100100000010001101010100111000001010010101010011011101101101001111
```


```
# 將訊息的哈希值分區段，並將其解釋為整數

def message_to_indices(message_hash):
    indices = []
    for ptr in range(0,n,8):
        indices.append(int(message_hash[ptr:ptr+8],2))
    return indices

indices = message_to_indices(message_hash)
print(indices)

# Outputs:
# [46, 75, 100, 50, 124, 3, 167, 138, 79, 50, 25, 234, 28, 110, 180, 156, 103, 181, 145, 83, 119, 207, 89, 250, 64, 141, 83, 130, 149, 77, 219, 79]
```


```
# 生成簽章

signature = ""
for index in indices:
    signature += SK[index]

print(signature[:2*n])

# Outputs:
# 11110111001110000...10001101
```

## 驗章

```
# 驗證簽章
# 驗證者有 message, signature


message_hash = hash_func(message_bits)

indices = []
for ptr in range(0,n,8):
    indices.append(int(message_hash[ptr:ptr+8],2))


validity = True
for i in range(n//logt):
    index = indices[i]
    signature_chunk = signature[i*n:(i+1)*n]

    if not hash_func(signature_chunk)==PK[index]:
        print("The signature is not valid!")
        validity = False
        break

print(validity)

# Outputs:
# True
```


# 測試竄改消息的攻擊

```
# 篡改消息
tampered_message = "Hi! This is Caesar!"  # 修改了消息內容
tampered_message_bits = message_to_binary(tampered_message)
tampered_message_hash = hash_func(tampered_message_bits)
tampered_indices = message_to_indices(tampered_message_hash)

# 驗證篡改的消息
validity_tampered = True
for i in range(256 // logt):
    index = tampered_indices[i]
    signature_chunk = signature[i * n:(i + 1) * n]
    if hash_func(signature_chunk) != PK[index]:
        print("The tampered signature is not valid!")
        validity_tampered = False
        break

print("篡改消息的驗證結果：", validity_tampered)

# Outputs:
# The tampered signature is not valid!
# 篡改消息的驗證結果： False
```



ref 
SRIVASTAVA, Vikas; BAKSI, Anubhab; DEBNATH, Sumit Kumar. An overview of hash based signatures. _Cryptology ePrint Archive_, 2023.