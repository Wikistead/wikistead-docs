---
title: SAML SSO
sidebar:
  badge:
    text: EE
    variant: tip
wikisteadEeLevers:
  - samlSso
---

SAML で組織の IdP からサインインします。

:::tip[EE]
この機能は Cloud/Enterprise エディションで提供されます。このページは「何ができるか」を書きます。どう作られているかはドキュメントの範囲外です。
:::

## 何ができるか

entitlement のあるワークスペースは、組織の SAML IdP をサインインの扉として登録できます：メンバーは IdP（Okta・Entra ID ほか SAML の世界）で認証し、Wikistead に到着します——ワークスペースローカルのパスワードは介在しません。設定はワークスペース単位で、他の[サインイン方法](/ja/admin/sign-in-methods/)と並びます。

OIDC を話す IdP には、Enterprise エディションなしで [OIDC シングルサインオン](/ja/admin/sign-in-methods/)が使えます。SAML は、IdP やポリシーがそれを要求する組織のためにあります。

## 関連

[SCIM プロビジョニング](/ja/admin/scim-provisioning/)と組み合わせると、メンバーをサインインさせるディレクトリが、作成と停止も行うようになります。
