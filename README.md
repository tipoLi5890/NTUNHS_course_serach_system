# 國立台北護理健康大學-課程查詢系統 React 專案

## 目錄結構
```
src/
├── assets/        # 靜態資源：圖像、字體等
├── components/    # 可重複使用的 UI 元件
├── pages/         # 應用的主要頁面
├── services/      # 與後端 API 互動的服務
├── hooks/         # 自定義的 React Hooks
├── utils/         # 公共工具函數
├── styles/        # 全域樣式
├── App.jsx        # 應用的根組件
└── index.jsx      # 應用的進入點
```

## 目錄和功能詳解

### 1. `assets/`

存放靜態資源，例如圖像和字體。

**示例：**

- `src/assets/logo.png`
- `src/assets/fonts/Roboto.ttf`

### 2. `components/`

存放可重複使用的 UI 元件，如按鈕、表單、導航欄等。

**示例：**

`src/components/Button.js`

```jsx
import React from 'react';

const Button = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

export default Button;
```

### 3. `pages/`

應用的主要頁面，每個頁面都是一個獨立的 React 組件。

**示例：**

`src/pages/HomePage/HomePage.jsx`

```jsx
import React from 'react';

const HomePage = () => (
  <div>
    <h1>歡迎來到首頁</h1>
  </div>
);

export default HomePage;
```

### 4. `services/`

用於與後端 API 進行通訊的服務層，統一管理 API 請求。

**示例：**

`src/services/api.js`

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchData = () => apiClient.get('/data');
export const postData = (data) => apiClient.post('/data', data);
```

### 5. `hooks/`

自定義的 React Hooks，用於封裝複雜的邏輯或狀態。

**示例：**

`src/hooks/useFetch.js`

```javascript
import { useState, useEffect } from 'react';

const useFetch = (apiMethod) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiMethod()
      .then((response) => setData(response.data))
      .finally(() => setLoading(false));
  }, [apiMethod]);

  return { data, loading };
};

export default useFetch;
```

### 6. `utils/`

公共的工具函數，例如日期格式化、數據處理等。

**示例：**

`src/utils/formatDate.js`

```javascript
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
```

### 7. `styles/`

全域樣式表或樣式變數文件，用於定義應用的整體風格。

**示例：**

`src/styles/global.css`

```css
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
```

## 安裝與使用

### 1. 安裝依賴

請確保您的電腦已安裝 [Node.js](https://nodejs.org/)。

```bash
npm install
```

#### 1.1. 套件
```bash
npm install html2canvas
```
```bash
npm install @mui/icons-material 
```
### 2. 啟動開發伺服器

```bash
npm start
```

應用將在 `http://localhost:3000` 上運行。

### 3. 構建項目

```bash
npm run build
```

構建的文件將輸出到 `build/` 資料夾。

## 頁面導航設置

以下是路由配置的示例：

`src/App.jsx`

```jsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={HomePage} />
      <Route path="/about" component={AboutPage} />
    </Switch>
  </Router>
);

export default App;
```

**示例頁面：**

`src/pages/AboutPage/AboutPage.js`

```jsx
import React from 'react';

const AboutPage = () => (
  <div>
    <h1>關於我們</h1>
    <p>這是關於頁面的內容。</p>
  </div>
);

export default AboutPage;
```

## 貢獻指南

歡迎對本項目提出建議和改進，您可以通過以下方式與我們聯繫：

1. **提交問題（Issue）**：如果發現任何錯誤或有新的建議，請創建一個新的 Issue。
2. **提交拉取請求（Pull Request）**：如果您想直接進行修改，請 Fork 本倉庫並提交 Pull Request。
