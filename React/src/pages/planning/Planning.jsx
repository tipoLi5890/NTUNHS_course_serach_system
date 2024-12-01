import React, { useState } from 'react';
import Header from "../../components/Header";
import Footer from '../../components/Footer';
//import './styles/planning.css';

const Planning = () => {

    //登入
    const isLoggedIn = window.Cookies.get('isLoggedIn');
    const savedUsername = window.Cookies.get('username');


    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header/>

            <div className='main'>
                <h2>我的課程規劃</h2>
            </div>
            
            {/* 頁尾 */}
            <Footer/>
        </div>
    );
};

export default Planning;

