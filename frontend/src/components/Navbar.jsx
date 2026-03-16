import React from 'react';
import './Navbar.css';
export default
function Navbar(){ 
    const user = JSON.parse(localStorage.getItem('user')||'null'); 
    return (
    <div className='navbar'>
        <div className='nav-left'>
            <a href='/home' className='brand'>StudySpace</a></div>
        <div className='nav-right'>
            <a href='/home'>Home</a>
            <a href='/chat'>Chat</a>
            <a href='/sessions'>Sessions</a>
            <a href='/resources'>Resources</a>
            <a href='/pomodoro'>Pomodoro</a>
            <a href='/settings'>Settings</a>
            {
            user? 
            <a href='/login' onClick={()=>{localStorage.removeItem('token'); 
                localStorage.removeItem('user');}}>Logout</a>:<a href='/login'>Login</a>}</div></div>); 
            }
