import React from "react";

import { BiCheck } from "react-icons/bi";
import KarmaBoxFeed from "../../assets/KarmaBoxFeed.png";
import IITKGPStaticWebsite from "../../assets/IITKGPStaticWebsite.png";
import DataMine from "../../assets/DataMine.png";
import AlmaConnectIn from "../../assets/AlmaConnect.png";

export const Portfolio = () => {
    return (
        <section id="portfolio">
            <h5>My Recent Work</h5>
            <h2>Portfolio</h2>
            <div className="container portfolio__container">
                <a className="portfolio__item" href="https://www.almaconnect.com" target="_blank">
                    <div className="portfolio__item-img">
                        <img src={AlmaConnectIn} alt="Feed " />
                    </div>
                    <h3>AlmaConnect</h3>
                    <article className="project__description">
                        <ul>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    Engage your alumni like never before by
                                    connecting with your college and
                                    organisation's alumni network
                                </p>
                            </li>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    Attend events, apply for Jobs, get
                                    mentored/be a mentor, request your
                                    institution related original documents, show your gratitude by helping
                                    your college/org develop through various donation campaigns.
                                </p>
                            </li>
                        </ul>
                    </article>
                    <div className="portfolio__item-cta">
                        {/* <a
                            href="https://github.com/alma-connect/karmabox-react"
                            className="btn"
                            target="_blank"
                        >
                            KarmaBox
                        </a> */}
                        <a
                            href="https://www.almaconnect.com/in"
                            className="btn btn-primary"
                            target="_blank"
                        >
                            Visit AlmaConnect
                        </a>
                    </div>
                </a>

                <a className="portfolio__item" href="https://news.almaconnect.com/" target="_blank">
                    <div className="portfolio__item-img">
                        <img src={KarmaBoxFeed} alt="Feed " />
                    </div>
                    <h3>KarmaBox</h3>
                    <article className="project__description">
                        <ul>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    A personalised feed<i>(BOX)</i> for an
                                    organisation showing related news
                                    <i>(KARMA) </i>
                                    from 400,000+ news sources across the web and
                                    hence the name KARMABOX 🙃
                                </p>
                            </li>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    You can add/update hundreds of thousands of
                                    prospects and keywords to keep updated when
                                    they make their way into the news articles
                                </p>
                            </li>
                        </ul>
                    </article>
                    <div className="portfolio__item-cta">
                        {/* <a
                            href="https://github.com/alma-connect/karmabox-react"
                            className="btn"
                            target="_blank"
                        >
                            KarmaBox
                        </a> */}
                        <a
                            href="https://news.almaconnect.com/"
                            className="btn btn-primary"
                            target="_blank"
                        >
                            Visit Karmabox
                        </a>
                    </div>
                </a>
                <a className="portfolio__item" href="https://news.almaconnect.com/data_mine" target="_blank">
                    <div className="portfolio__item-img">
                        <img src={DataMine} alt="IIT KGP" />
                    </div>
                    <h3>Keep Your Alumni Directory Updated</h3>
                    <article className="project__description">
                        <ul>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    Get real-time employment data of your alumni.
                                </p>
                            </li>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    Receive updates on your alumni when they switch jobs, move up the ladder or transition into other careers.
                                </p>
                            </li>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    Streamline and Navigate easily through vast amounts of alumni data with our advanced filters and unlock precise insights.
                                </p>
                            </li>
                        </ul>
                    </article>

                    <div className="portfolio__item-cta">
                        {/* <a href="https://github.com/alma-connect/karmabox-react" className='btn' target="_blank">IIT KGP</a> */}
                        <a
                            href="https://news.almaconnect.com/data_mine"
                            className="btn btn-primary"
                            target="_blank"
                        >
                            Visit DataMine
                        </a>
                    </div>
                </a>
                <article className="portfolio__item">
                    <div className="portfolio__item-img">
                        <img src={IITKGPStaticWebsite} alt="IIMA" />
                    </div>
                    <h3>Fully Automated Static Websites Creation</h3>

                    <article className="project__description">
                        <ul>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    A website where you yourselves can update
                                    the content of their website without
                                    requiring to get in touch with developer
                                    through a verified portal
                                </p>
                            </li>
                            <li>
                                <BiCheck className="project__description-icon" />
                                <p>
                                    You can adjust the layout and what items to
                                    display and what not to and where to display
                                    them and not only that but also you can
                                    select a theme of your own liking
                                </p>
                            </li>
                        </ul>
                    </article>

                    <div className="portfolio__item-cta">
                        {/* <a href="https://github.com/alma-connect/karmabox-react" className='btn' target="_blank">IIT KGP</a> */}
                        <a
                            href="https://alumni.iima.ac.in/"
                            className="btn btn-primary"
                            target="_blank"
                        >
                            Visit IIMA
                        </a>
                    </div>
                </article>
            </div>
        </section>
    );
};
