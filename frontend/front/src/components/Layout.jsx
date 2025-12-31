import React from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
                <Outlet/>
            </main>
            <Footer />
        </div>
    ); 
}
export default Layout;