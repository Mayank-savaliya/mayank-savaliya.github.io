import React from 'react';
import ME from '../../assets/mak_social.JPG';
import {FaAward} from 'react-icons/fa'
import {FiUsers} from 'react-icons/fi'
import {VscFolderLibrary} from 'react-icons/vsc'
export const About = () => {
  return (
    <section id="about">
      <h5>Ge to know</h5>
      <h2>About me</h2>

      <div className="container about__container">
        <div className="about__me">
          <div className="about__me-image">
            <img src={ME} alt="Me" />
          </div>
        </div>
        <div className="about__content">
          <div className="about__cards">
            <article className="about__card">
              <FaAward className='about__icon'/>
              <h5>
                Experience
              </h5>
              <small>
                2+years of working Experience
              </small>
            </article>


            <article className="about__card">
              <FiUsers className='about__icon'/>
              <h5>
                Clients
              </h5>
              <small>
                2 Clients
              </small>
            </article>

            <article className="about__card">
              <VscFolderLibrary className='about__icon'/>
              <h5>
                Projects
              </h5>
              <small>
                10+ Completed Projects
              </small>
            </article>
          </div>
          <p>Lorem Ipsum Dolor sit amit Lorem Ipsum Dolor sit amitLorem Ipsum Dolor sit amit Lorem Ipsum Dolor sit amit</p>
          <a href="#contact" className='btn btn-primary'>Let's Talk</a>
        </div>
      </div>
    </section>
  )
}
