import React from 'react'
import {FaLinkedin} from 'react-icons/fa'
import {BsGithub} from 'react-icons/bs'
const HeaderSocials = () => {
  return (
    <div className="header__socials">
        <a href="https://linkedin.com" target="_blank"><FaLinkedin /></a>
        <a href="https://github.com/Mayank-savaliya" target="_blank"><BsGithub /></a>
    </div>
  )
}

export default HeaderSocials