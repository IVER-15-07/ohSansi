import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar' 
import Footer from '../components/Footer'

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default UserLayout
