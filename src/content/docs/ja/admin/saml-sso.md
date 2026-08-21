---
title: SAML SSO
sidebar:
  badge:
    text: EE
    variant: tip
wikisteadEeLevers:
  - samlSso
---

組織の IdP から SAML でサインインできるようにします。

:::tip[EE]
この機能は Cloud / Enterprise エディションで提供されます。このページでは何ができるかを説明します。内部のしくみについては扱いません。
:::

## 何ができるか

この機能を含むプランのワークスペースでは、組織の SAML IdP をサインインの入り口として登録できます。メンバーは IdP（Okta や Entra ID など）で認証してから Wikistead にサインインするため、ワークスペース専用のパスワードは不要です。設定はワークスペースごとで、他の[サインイン方法](/ja/admin/sign-in-methods/)と並びます。

IdP が OIDC に対応している場合は、Enterprise エディションでなくても [OIDC のシングルサインオン](/ja/admin/sign-in-methods/)を使えます。IdP や組織のポリシー上 SAML が必要な場合の選択肢です。

## 関連

[SCIM プロビジョニング](/ja/admin/scim-provisioning/)と組み合わせると、サインインだけでなくメンバーの作成と停止も IdP 側から行えるようになります。
