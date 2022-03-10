import React from 'react'
import CTAs from './CTAs'
import ME from '../../assets/ME_WHEN_THE.jpg'

import HeaderSocials from './HeaderSocials'
export const Header = () => {
  return (
    <header>
      <div className="container header__container">
        <h5>Hello I'm</h5>
        <h1>Mayank Savaliya</h1>
        <h5 className="text-light">Fullstack Developer</h5>
        <CTAs></CTAs>
        <HeaderSocials />
        {/* Removing padding to cover image full to top dome shape */}
        <div className="me" style={{padding: 0}}>
          <img src={ME} alt="me" style={{height: 'inherit'}}/>
        </div>
        <a href="#contact" className="scroll__down">Scroll Down</a>
      </div>
    </header>
  )
}
