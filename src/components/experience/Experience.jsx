import React from 'react'
import {BsPatchCheckFill} from 'react-icons/bs'
export const Experience = () => {
  return (
    <section id="experience">
      <h5>Skills and Technologies I work with</h5>
      <h2>My Experience</h2>
      <div className="container experience__container">
        <div className="experience__frontend">
          <h3>Frontend Developement</h3>
          <div className="experience__content">
            <article className='experience__details'>
                <BsPatchCheckFill className="experience__details-icon"/>
                <div>
                  <h4>ReactJs</h4>
                  <small className="text-light">Intermediate - Expert</small>
                </div>
            </article>
            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>JavaScript</h4>
                <small className="text-light">Intermediate - Expert</small>
              </div>
            </article>  
            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>AngularJs</h4>
                <small className="text-light">Intermediate</small>
              </div>
            </article>
            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>HTML</h4>
                <small className="text-light">Intermediate - Expert</small>
              </div>
            </article>

            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>CSS</h4>
                <small className="text-light">Intermediate</small>
              </div>
            </article>                                
          </div>
        </div>
        
        
        <div className="experience__backend">
        <h3>Backend Developement</h3>
          <div className="experience__content">
            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>Ruby</h4>
                <small className="text-light">Intermediate</small>
              </div>
            </article>

            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>Ruby on Rails</h4>
                <small className="text-light">Intermediate</small>
              </div>
            </article>

            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>Mongo</h4>
                <small className="text-light">Intermediate</small>
              </div>
            </article>

            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>NodeJs</h4>
                <small className="text-light">Novice</small>
              </div>
            </article>

            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>Solidity</h4>
                <small className="text-light">Novice</small>
              </div>
            </article>

            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>Truffle</h4>
                <small className="text-light">Novice</small>
              </div>
            </article>

            <article className='experience__details'>
              <BsPatchCheckFill className="experience__details-icon"/>
              <div>
                <h4>Java</h4>
                <small className="text-light">Novice</small>
              </div>
            </article>
            
          </div>
        </div>
      </div>
    </section>
  )
}

