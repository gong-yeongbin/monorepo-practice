# MECROSS PRO Admin

| Branch  | Description  | S3 bucket                    | Website                                                                      |
| ------- | ------------ | ---------------------------- | ---------------------------------------------------------------------------- |
| staging | staging      | admin.staging.mecrosspro.com | [http://admin.staging.mecrosspro.com/](http://admin.staging.mecrosspro.com/) |
| main    | production   | admin.mecrosspro.com         | [http://admin.mecrosspro.com/](http://admin.mecrosspro.com/)                 |
| social  | google login |                              |                                                                              |

## Built With

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Create React App](https://img.shields.io/badge/Create%20React%20App-09D3AC?style=for-the-badge&logo=Create%20React%20App&logoColor=white)

#### Design

![Material UI](https://img.shields.io/badge/-MUI-007FFF?style=for-the-badge&logo=MUI&logoColor=white)
![Ant-Design](https://img.shields.io/badge/-AntDesign-230170FE?style=for-the-badge&logo=ant-design&logoColor=white)
![Styled Components](https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white)

#### State Management

![MobX](https://img.shields.io/badge/MobX-FF9955?style=for-the-badge&logo=MobX&logoColor=white)

#### Data Management

![Axios](https://img.shields.io/badge/axios-671ddf?style=for-the-badge)
![React Query](https://img.shields.io/badge/React%20Query-FF4154?style=for-the-badge&logo=React%20Query&logoColor=white)

#### Version Control

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

#### Deployment

| Technology    | Description                                            |
| ------------- | ------------------------------------------------------ |
| Github Action | Automate workflows (CI/CD)                             |
| Slack         | Notify deployment success/failure (with slack webhook) |

#### AWS

| Technology | Description                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Amplify    | Authenticate Google Users (`social` branch) & Create accounts for media/advertisers in developer menu |
| CloudFront | Instant image updates by setting the cache policy to `Managed-CachingDisabled`                        |

#### Other

| Technology        | Description                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| react-table       | Build table UI (`MUI Data Grid` is used for tables in Modals)                                        |
| react-virtualized | Infinite Scroll in tables(modals) & Render large data efficiently (windowing) & Auto-sized component |
| react-window      | Infinite Scroll in tables(modals) & Render large data efficiently (windowing) & Fixed component      |

## Page Structure

![admin-page](https://user-images.githubusercontent.com/61957322/175446727-d1843c99-e597-4fd6-9f4a-f2a0506496b9.png)

## User Flow

![admin](https://user-images.githubusercontent.com/61957322/175446736-1a927455-97d0-49ce-9561-8775de3bf3dd.png)

## Getting Started

### Installing

모노레포 루트에서 pnpm으로 설치한다.

    pnpm install

개발 서버(Vite, 포트 3000) / 빌드는 루트 또는 앱에서 실행한다.

    pnpm --filter=frontend dev
    pnpm --filter=frontend build

> CRA(react-scripts)에서 Vite로 전환되었으므로 환경변수 프리픽스는 `REACT_APP_`이 아니라 `VITE_`이며, 코드에서는 `import.meta.env.VITE_*`로 참조한다. env 파일은 gitignore되므로 아래 키를 로컬에 직접 둔다.

### Actions Secrets

![admin-secrets](https://user-images.githubusercontent.com/61957322/175449728-5d319f8c-0db0-4cce-a3f9-d1d141b662c3.png)
위 5개의 secrets 키 중 **.env.staging**을 `STAGING`에, **.env.production**을 `PRODUCTION`에 각각 관리합니다.

##### .env.staging

```
VITE_API_URL=http://3.38.15.191
VITE_BUCKET=admin.mecrosspro.com
VITE_USER_POOL_ID=ap-northeast-2_LJNZrOOIY
VITE_USER_POOL_CLIENT_ID=4365iskqu3mull89so0kugbol9
VITE_REGION=ap-northeast-2
VITE_OAUTH_DOMAIN=admin-mecrosspro.auth.ap-northeast-2.amazoncognito.com
VITE_REDIRECT_SIGN_IN=http://localhost:3000/
VITE_REDIRECT_SIGN_OUT=http://localhost:3000/login
VITE_IDENTITY_POOL_ID=ap-northeast-2:b2f375c0-5a04-454d-b66f-1259fcc96abc
VITE_USER_POOL_ID_ADVERTISER=ap-northeast-2_6UiiWuevH
VITE_USER_POOL_ID_PARTNER=ap-northeast-2_drkLCbha3
VITE_USER_POOL_CLIENT_ID_ADVERTISER=56aanu4dlo5n5tol0ad8s6dbvd
VITE_USER_POOL_CLIENT_ID_PARTNER=1cuu7mknumn8v4s0krlmq1hotc
```

##### .env.production

```
VITE_API_URL=http://3.38.88.48:3000
VITE_USER_POOL_ID_ADVERTISER=ap-northeast-2_6UiiWuevH
VITE_USER_POOL_ID_PARTNER=ap-northeast-2_drkLCbha3
VITE_USER_POOL_CLIENT_ID_ADVERTISER=56aanu4dlo5n5tol0ad8s6dbvd
VITE_USER_POOL_CLIENT_ID_PARTNER=1cuu7mknumn8v4s0krlmq1hotc
VITE_REGION=ap-northeast-2
```

## Deployment

### 1. Prerequisites

##### Github Actions와 연동하여 배포 후 성공/실패 알림을 slack으로 전송

- Example
  ![example](https://user-images.githubusercontent.com/61957322/175441071-1d1e0c17-161b-48a1-8151-8796061df3cf.png)
- 관련 코드  
  `.github\workflows`

```
      - name: Slack notification success
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_CHANNEL: mecrosspro
        uses: Ilshidur/action-slack@2.0.2
        with:
          args: 'admin production에 배포했습니다.'

      - name: Slack notification failure
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        uses: Ilshidur/action-slack@2.0.2
        with:
          args: 'admin production 배포에 실패했습니다.'
        if: failure()
```

- 참고 사이트  
  [https://velog.io/@sdb016/Github-actions와-slack-연동해서-알림받기](https://velog.io/@sdb016/Github-actions%EC%99%80-slack-%EC%97%B0%EB%8F%99%ED%95%B4%EC%84%9C-%EC%95%8C%EB%A6%BC%EB%B0%9B%EA%B8%B0)

### 2. `git push`
