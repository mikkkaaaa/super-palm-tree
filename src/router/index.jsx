import React from "react";
import { createBrowserRouter } from 'react-router-dom'; //创建一个基于浏览器地址栏的路由对象。

import Home from '../pages/home/home';
import NotFound from '../pages/NotFound';
import BreakOut from '../games/Breakout';  //引入不同的页面或游戏组件，用于路由中设置“访问路径”时显示哪个组件。

const router = createBrowserRouter([
    {
        path:'/',
        element: <Home />,  // 首页
    },

    {
        path:'*',  //这里要用*
        element: <NotFound />, // 所有其他路径显示404
    },

    {
        path:'/breakout',  //配置路由名字
        element: <BreakOut />,  // 打砖块游戏页
    },

]);

export default router;  //导出这个路由对象，方便在 App.jsx 里使用