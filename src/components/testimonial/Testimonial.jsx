import React from 'react'
import UserAvatar from '../../assets/1.png'
import Bryant from '../../assets/Bryant.c3a944a1.png'
import LouisBerg from '../../assets/Louis.a2b6cd39.png'
import Augsberg from '../../assets/Augsburg.94cc6dba.png'
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';


const testimonial_metadata = [
  {
    name: "Nicole Melmed, Bryant University",
    avatar: Bryant,
    review: "I am very happy with the service and continue to find prospects that I would not have found through other methods."
  },
  {
    name: "Kathryn O'Leary, Louisburg College",
    avatar: LouisBerg,
    review: "AlmaConnect has been a great resource for us to keep up with alumni! We have recently been working on increasing our engagement on LinkedIn. AlmaConnect has provided us with a lot of great alumni news articles for us to share on this platform. We are excited to continue to utilize this service to stay in the know of alumni successes."
  },
  {
    name: "Jauston Campbell, Augsburg University",
    avatar: Augsberg,
    review: "There is so much information out there, and AlmaConnect makes navigating through it all to locate what I need easy."
  }
]
export const Testimonial = () => {
  return (
    <section id="testimonial">
      <h5>Review from clients</h5>
      <h2>Testimonials</h2>
      <Swiper className="container testimonials__container"
        modules={[Pagination]}
        spaceBetween={50}
        slidesPerView={1}        
        pagination={{ clickable: true }}
      >
        {
          testimonial_metadata.map((testimonial, index) => {
            return(
              <SwiperSlide key={index} className="testimonial">
                <div className="client__avatar">
                  <img src={testimonial.avatar} alt={testimonial.name} style={{maxWidth: "5rem"}}/>            
                </div>
                <h5 className='client__name'>{testimonial.name}</h5>
                  <small className="client__review">
                    {testimonial.review}
                </small>
              </SwiperSlide>
            )
          })
        }
      </Swiper>
    </section>
  )
}
