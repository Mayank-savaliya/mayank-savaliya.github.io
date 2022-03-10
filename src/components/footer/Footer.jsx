import React from 'react'
import {FaFacebookF} from 'react-icons/fa'
import {FiInstagram} from 'react-icons/fi'
import {IoLogoTwitter} from 'react-icons/io'

export const Footer = () => {
  return (
    <footer>
      <a href="#" className='footer__logo'>MAK</a>
      <ul className='permalinks'>
        <li><a href="#">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#portfolio">Portfolio</a></li>
        <li><a href="#testimonial">Testimonials</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div className="footer__socials">
        <a href="https://www.facebook.com/mayank.savaliya.9/"><FaFacebookF /></a>
        <a href="https://instagram.com/mayank.savaliya.23"><FiInstagram /></a>
        <a href="https://twitter.com/_bLuRrY__FaCe"><IoLogoTwitter /></a>
      </div>
    </footer>
  )
}
