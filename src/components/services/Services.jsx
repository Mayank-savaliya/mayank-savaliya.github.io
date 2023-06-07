import React from 'react'
import {BiCheck} from 'react-icons/bi'
const Services = () => {
  return (
    <section id="services">
      <h5>You can contact me for</h5>
      <h2>Services</h2>
      <div className="container services__container">
        <article className="service">
          <div className="service__head">
            <h3>Front End</h3>
          </div>
          <ul className="service__list">
            <li>
              <BiCheck className='service__list-icon'/>
              <p>
                Blazing fast multi page front-end that is highly scalable
              </p>
            </li>
            <li>
              <BiCheck className='service__list-icon'/>
              <p>
                A front-end that is not only fast but also beautiful
              </p>
            </li>
            <li>
              <BiCheck className='service__list-icon'/>
              <p>
                Cross Device compatibile
              </p>
            </li>
          </ul>
        </article>
        {/* END OF UX */}
        <article className="service">
          <div className="service__head">
            <h3>Backend Development</h3>
          </div>
          <ul className="service__list">
            <li>
              <BiCheck className='service__list-icon'/>
              <p>
                A complete web app or A.P.I only backend using ruby on Rails
                with payments, emailers and asynchronous jobs management
              </p>
            </li>
            <li>
              <BiCheck className='service__list-icon'/>
              <p>
                NoSql database like mongoDB and highly efficient search queries using ElasticSearch
              </p>
            </li>          
          </ul>
        </article>
        {/* End of Web Development */}
        <article className="service">
          <div className="service__head">
            <h3>Web 3.0</h3>
          </div>
          <ul className="service__list">
            <li>
              <BiCheck className='service__list-icon'/>
              <p>
                Smart Contracts
              </p>
            </li>
            <li>
              <BiCheck className='service__list-icon'/>
              <p>
                ERC20 Tokens
              </p>
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}

export default Services