我們到目前為止有介紹包括
1. WOTS+
2. Merkle Tree
3. FORS
把這三個系統進行巧妙結合之後就會得到 SPHINCS+ 系統了！（終極拼裝車（？））

# 概念簡介

簡單來講，我們會使用 FORS 來對訊息進行簽章，其中有生成 FORS 公鑰，接著再用 WOTS+ 系統對 FORS 的公鑰進行簽章，其中會生成 WOTS+ 公鑰。

再來，WOTS+ 公鑰會被放到第一顆 Merkle tree 的最底層，給定所需要的二進位字串 Auth 後，可以算到該 Merkle tree 的根 Merkle root。

然後這個 Merkle root 會被 WOTS+ 再簽章一次，其中產生的公鑰會被放到第二顆 Merkle tree 的最底層，算到該棵 Merkle tree 的根後，再用 WOTS+ 對這個根進行簽章，其中會產生一個WOTS+公鑰，放到第三棵......

# SPHINCS+ 系統


## 密鑰生成
1. 為每個訊息生成一組WOTS+私鑰，並計算對應的公鑰
2. 將每個消息分成區段，假設區段的長度為 log2(w)，則為每個區段生成 w 個私鑰（對應到不同 index），並計算每個區段的 FORS Merkle tree 。
3. 將第一步算到的 WOTS+ 公鑰放到 d 層 Hyper Merkle tree 的最底層，並開始計算總公鑰（叫做 SPHINCS+ 公鑰）
## 簽章
1. 首先對訊息（或者訊息的 hash value）使用 FORS 進行簽章
2. 使用 Hyper Merkle Tree 中最底層的 WOTS+ 公鑰（以及對應私鑰）對第一步的 FORS 公鑰進行簽章
3. 使用 Hyper Merkle Tree 中次底層的 WOTS+ 公鑰（以及對應私鑰）對最底層 Merkle tree 的 root 進行簽章
4. 以此類推，直到簽到 Hyper Merkle Tree 的最上層為止。

## 驗章
就是把上述步驟每段都進行驗證
1. 首先驗證訊息（或者訊息的 hash value）的 FORS 簽章
2. 驗證對 FORS 公鑰進行簽章的 WOTS+ 
3. 驗證第二步的 WORS+ 公鑰為最底層的 Merkle tree 的底層（也就是檢查該棵樹的 Merkle root）
4. 驗證對第三部 Merkle root 的 WOTS+ 簽章
5. 以此類推，直到檢查到 Hyper Merkle Tree 最頂層的 SPHINCS+ 公鑰





# 小結


在這段旅程中，我們逐步學習了 WOTS+、Merkle Tree 和 FORS，這些技術各自有其脈絡，最終通過巧妙的結合變成了 SPHINCS+ （根本是一個超強拼裝車）。

這個系統將所有這些組件整合在一起，形成了一個無狀態且抗量子攻擊的數位簽章方案。雖然它看似複雜，但正是這些「拼裝車」般的設計，讓 SPHINCS+ 能夠在未來的量子計算時代中脫穎而出，保護我們的數位安全。

SPHINCS+ 是目前 NIST 後量子加密競賽中唯一的基於哈希函數的數位簽章方案。它不依賴於數論問題或週期問題，這使它在抵抗量子計算攻擊時具有天然的優勢。此外，SPHINCS+ 還擁有許多變體，例如 K-SPHINCS+ 和 SPHINCS-α，這些變體根據不同的需求進行調整和優化，以在不同的應用場景中提供更好的性能或更高的安全性。

作為一個靈活且高度安全的簽章系統，SPHINCS+ 代表了基於哈希的簽章技術的最前沿，也是未來數位安全的重要基礎之一。