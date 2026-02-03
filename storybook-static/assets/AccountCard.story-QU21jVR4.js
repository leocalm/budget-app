import{m as t}from"./budgetData-Dm9Z5fBL.js";import{A as e}from"./AccountCard-BDWTxzm7.js";import"./iframe-BlPw6RHN.js";import"./preload-helper-PPVm8Dsz.js";import"./Paper-ZXYsCSl_.js";import"./polymorphic-factory-0CtcYZKl.js";import"./Group-VLj-LUgQ.js";import"./Title-Bx3YnrbZ.js";import"./ActionIcon-_QTefNip.js";import"./Loader-CTmnaFpN.js";import"./UnstyledButton-DT2tpwi4.js";import"./index-R61n_Ntc.js";import"./Text-CKudE1NG.js";import"./AreaGradient-Ct6ST7oD.js";import"./index-tni0gN6T.js";import"./SimpleGrid-CH29pY9P.js";import"./get-base-value-FMRBrurP.js";import"./Stack-quhSlGT0.js";import"./Button-Bd-cDwKe.js";const k={title:"Components/Accounts/AccountCard",component:e,tags:["autodocs"],argTypes:{onEdit:{action:"edit"},onDelete:{action:"delete"}}},n={args:{account:t[0],balanceHistory:[{date:"2026-01-01",balance:145e3},{date:"2026-01-05",balance:147e3},{date:"2026-01-10",balance:148500},{date:"2026-01-15",balance:15e4}],monthlySpent:12500,transactionCount:23}},a={args:{account:{...t[0],name:"Spending Account",color:"orange",spendLimit:5e4},balanceHistory:[{date:"2026-01-01",balance:145e3},{date:"2026-01-05",balance:147e3},{date:"2026-01-10",balance:148500},{date:"2026-01-15",balance:15e4}],monthlySpent:12500,transactionCount:23}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    account: mockAccounts[0],
    balanceHistory: [{
      date: '2026-01-01',
      balance: 145000
    }, {
      date: '2026-01-05',
      balance: 147000
    }, {
      date: '2026-01-10',
      balance: 148500
    }, {
      date: '2026-01-15',
      balance: 150000
    }],
    monthlySpent: 12500,
    transactionCount: 23
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    account: {
      ...mockAccounts[0],
      name: 'Spending Account',
      color: 'orange',
      spendLimit: 50000 // 500.00
    },
    balanceHistory: [{
      date: '2026-01-01',
      balance: 145000
    }, {
      date: '2026-01-05',
      balance: 147000
    }, {
      date: '2026-01-10',
      balance: 148500
    }, {
      date: '2026-01-15',
      balance: 150000
    }],
    monthlySpent: 12500,
    transactionCount: 23
  }
}`,...a.parameters?.docs?.source}}};export{n as Default,a as WithSpendLimit,k as default};
