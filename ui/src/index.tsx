import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from "./serviceWorker"
// import reportWebVitals from './reportWebVitals';

console.log("欢迎使用 得否AI工具箱")
console.log("项目地址: https://github.com/mereithhh/van-nav")

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <App />
);

serviceWorker.register(null);