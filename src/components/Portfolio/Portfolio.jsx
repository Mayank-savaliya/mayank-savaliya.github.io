import React from 'react'
import KarmaBoxFeed from '../../assets/KarmaBoxFeed.png'

export const Portfolio = () => {
  return (
    <section id="portfolio">
      <h5>My Recent Work</h5>
      <h2>Portfolio</h2>
      <div className="container portfolio__container">
        <article className="portfolio__item">
          <div className="portfolio__item-img">
            <img src={KarmaBoxFeed} alt="Feed " />
          </div>
          <h3>This is portfolio item title</h3>
          <div className="portfolio__item-cta">
            <a href="https://github.com/alma-connect/karmabox-react" className='btn' target="_blank">KarmaBox</a>
            <a href="https://news.almaconnect.com/" className='btn btn-primary' target="_blank">Live</a>
          </div>
        </article>

        <article className="portfolio__item">
          <div className="portfolio__item-img">
            <img src={KarmaBoxFeed} alt="Feed " />
          </div>
          <h3>This is portfolio item title</h3>
          <div className="portfolio__item-cta">
            <a href="https://github.com/alma-connect/karmabox-react" className='btn' target="_blank">KarmaBox</a>
            <a href="https://news.almaconnect.com/" className='btn btn-primary' target="_blank">Live</a>
          </div>
        </article>

        <article className="portfolio__item">
          <div className="portfolio__item-img">
            <img src={KarmaBoxFeed} alt="Feed " />
          </div>
          <h3>This is portfolio item title</h3>
          <div className="portfolio__item-cta">
            <a href="https://github.com/alma-connect/karmabox-react" className='btn' target="_blank">KarmaBox</a>
            <a href="https://news.almaconnect.com/" className='btn btn-primary' target="_blank">Live</a>
          </div>
        </article>
        
      </div>
    </section>
  )
}
