import React from 'react'

import {Header} from './components/header/Header'
import {NavBar} from './components/nav/NavBar'
import {Footer} from './components/footer/Footer'
import {Experience} from './components/experience/Experience'
import {Testimonial} from './components/testimonial/Testimonial'
import { About } from './components/about/About'
import {Contact} from './components/contact/Contact'
import { Portfolio } from './components/Portfolio/Portfolio'


export const App = () => {
  return (
    <>
      <Header></Header>    
      <NavBar></NavBar>
      <About></About>
      <Experience></Experience>
      <Portfolio></Portfolio>
      <Testimonial></Testimonial>
      <Contact></Contact>
      <Footer></Footer>
    </>
    
    )
}
