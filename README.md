# KeroroPangPang Server Implementation

그렇게 많은 분석을 진행하지 못하였으나, 이후 진행할 어떤 천재분을 위하여 이 레포지토리를 업로드 합니다. (영어를 못해서 이부분만 한국어로 적어 놓은 것은 아닙니다 ㅠㅠ)  
코드나 관련 분석 부분에 궁금하신 점이 있으신 분은 DM이나 다른 방법으로 연락 주시면 친절히 답변해드리겠습니다!

## Modifying

You must modify the client to use this server. I wrote some infomations below, so just try!

### Modifying list

-   Edit the ip address to connect (hint: you can do this by putting edited TVars.xml to data folder)
    ![hint_image](./some%20picture.png)
-   Bypass loading gameguard and checking status of gameguard
    ![hint_image](./some%20picture1.png) This is loading gamegaurd part. Try to bypass checking part by yourself! (hint: take a look at "m_goormClientSession->tick()" string references)
-   Checking age of the user with tooniland api server. (try this too!)
