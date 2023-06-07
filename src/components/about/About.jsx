import React from "react";
import ME from "../../assets/About.jpg";

import { FaAward } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { VscFolderLibrary } from "react-icons/vsc";
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
                            <FaAward className="about__icon" />
                            <h5>Experience</h5>
                            <small>3+ years of working Experience</small>
                        </article>

                        <article className="about__card">
                            <FiUsers className="about__icon" />
                            <h5>Clients</h5>
                            <small>2 Clients</small>
                        </article>

                        <article className="about__card">
                            <VscFolderLibrary className="about__icon" />
                            <h5>Projects</h5>
                            <small>10+ Completed Projects</small>
                        </article>
                    </div>
                    <p>
                        I'm Mayank Savaliya, a Full Stack Developer at
                        AlmaConnect. I completed my bachelors in I.C.T
                        <i>(Information and Communication Technology)</i> at
                        Dhirubhai Ambani Institute of Information and
                        Communication Technology in 2020. I like to keep myself
                        updated with technologies and am currently growing myself in the field of
                        blockhain and decentralizing the web using the same.
                    </p>
                    <a href="#contact" className="btn btn-primary">
                        Let's Talk
                    </a>
                </div>
            </div>
        </section>
    );
};
