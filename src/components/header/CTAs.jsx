import React from 'react'
import CV from '../../assets/Mayank_Savaliya_Resume.pdf';
const CTAs = () => {
  return (
    <div className="cta">
        <a href={CV} className="btn">Download CV</a>
        <a href="#contact" className='btn btn-primary'>Let's talk  </a>
    </div>
  )
}

export default CTAs