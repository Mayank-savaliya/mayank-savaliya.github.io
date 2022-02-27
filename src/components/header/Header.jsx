import React from 'react'
import CTAs from './CTAs'
import ME from '../../assets/mak_profile.png'
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
        <div className="me">
          <img src={ME} alt="me"/>
        </div>
        <a href="#contact" className="scroll_down">Scroll Down</a>
      </div>
    </header>
  )
}
