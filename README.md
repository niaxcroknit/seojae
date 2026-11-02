# 서재한켠 - 독서 기록과 형광펜

가진 책을 서재처럼 꽂아 두고, 한줄평·감상·페이지 메모·형광펜으로 가볍게 기록하는 안드로이드 앱이에요.
로그인과 서버 없이, 기록은 폰 안에만 저장돼요.

| | |
|---|---|
| 앱 ID | `com.nia.seojaehankyeon` (Play에 처음 올린 뒤에는 바꿀 수 없어요) |
| 버전 | 1.0.0 (versionCode 1) |
| 웹에서 바로 쓰기 | https://niaxcroknit.github.io/seojae/ (기록은 그 브라우저에만 저장돼요) |
| 개인정보처리방침 | https://niaxcroknit.github.io/seojae/privacy/ |

---

## 폰에 바로 깔아 보기 (테스트용 APK)

이 저장소에 새 버전이 올라올 때마다 GitHub가 자동으로 앱을 빌드해요.

1. 저장소 위쪽 **Actions** 탭 → 맨 위의 초록 체크(✓) 줄을 눌러요.
2. 아래 **Artifacts**에서 `seojaehankyeon-test-apk`를 내려받아요.
3. 압축을 풀면 나오는 `app-debug.apk`를 폰으로 옮겨서 설치해요.

> 테스트용이라 Play 스토어에 올리는 파일과는 서명이 달라요. 스토어에서 받은 앱과 같이 깔 수는 없어요.

## Play 스토어용 파일(.aab) 만들기

1. 위쪽 초록색 **Code** 버튼 → **Download ZIP**
2. 압축을 풀면 `seojae-main` 폴더가 생겨요. `C:\seojae-main`처럼 짧은 영어 경로에 두세요.
3. 안드로이드 스튜디오 → **File → Open** → `seojae-main` 안의 **`android`** 폴더
4. 그다음은 [`시작하기.md`](시작하기.md)의 3번부터 따라 하면 돼요.

스토어 등록 순서는 [`store/PLAY_STORE.md`](store/PLAY_STORE.md)에 있어요.

## 폴더 구성

| 폴더·파일 | 내용 |
|---|---|
| `android/` | 안드로이드 스튜디오에서 여는 폴더 |
| `www/` | 앱 화면 (웹으로 만든 화면, 글꼴 포함) |
| `src/seojae.html` | 앱 화면의 원본 (Claude 웹 버전과 같은 파일) |
| `store/` | 스토어 아이콘·그래픽·스크린샷, 등록 문구, 개인정보처리방침, 등록 순서 |
| `docs/` | 웹 버전 앱(`index.html`, `npm run build:www`가 만들어요)과 개인정보처리방침(`privacy/`) — GitHub Pages |
| `assets/` | 아이콘·시작 화면 원본 이미지 |
| `art/` | 화면 빌드, 이미지 생성, 앱 동작 시험 스크립트 |
| `.github/workflows/` | 자동 빌드 설정 |
| `node_modules/@capacitor/` | 안드로이드 빌드에 필요한 부품 (지우지 마세요) |

## 고칠 때 (개발자용)

```bash
npm ci                 # 처음 한 번
# src/seojae.html 수정
npm run sync           # www/ 다시 만들고 android/에 복사
npm run test:native    # 실제 Capacitor 연결 스크립트로 앱 동작 시험 (playwright 필요)
```

업데이트를 Play에 올릴 때는 `android/app/build.gradle`의 `versionCode`를 1씩 올려요.
