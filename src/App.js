import React from 'react'
import "./App.scss"

import {Header} from './components/header/Header'
import {NavBar} from './components/nav/NavBar'
import {Footer} from './components/footer/Footer'
import {Experience} from './components/experience/Experience'
import {Testimonial} from './components/testimonial/Testimonial'
import { About } from './components/about/About'
import {Contact} from './components/contact/Contact'
import { Portfolio } from './components/Portfolio/Portfolio'
import Services from './components/services/Services'
import { Helmet } from 'react-helmet'
import FavIcon from './assets/portfolio.png'

export const App = () => {
  return (
    <>
      <Helmet>
        <link rel="shortcut icon" href={FavIcon}/>
      </Helmet>
      <Header></Header>    
      <NavBar></NavBar>
      <About></About>
      <Experience></Experience>
      <Services />
      <Portfolio></Portfolio>
      <Testimonial></Testimonial>
      <Contact></Contact>
      <Footer></Footer>
    </>
    
    )
}