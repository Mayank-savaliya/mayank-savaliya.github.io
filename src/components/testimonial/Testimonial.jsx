import React from 'react'
import UserAvatar from '../../assets/1.png'
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';


const testimonial_metadata = [
  {
    name: "Mayank Savaliya",
    avatar: UserAvatar,
    review: "Lorem ipsum dolor sit amet constuctem adipiscicin alut.Lorem ipsum dolor sit amet constuctem adipiscicin alut.Lorem ipsum dolor sit amet constuctem adipiscicin alut."
  },
  {
    name: "Mayank Savaliya",
    avatar: UserAvatar,
    review: "Lorem ipsum dolor sit amet constuctem adipiscicin alut.Lorem ipsum dolor sit amet constuctem adipiscicin alut.Lorem ipsum dolor sit amet constuctem adipiscicin alut."
  },
  {
    name: "Mayank Savaliya",
    avatar: UserAvatar,
    review: "Lorem ipsum dolor sit amet constuctem adipiscicin alut.Lorem ipsum dolor sit amet constuctem adipiscicin alut.Lorem ipsum dolor sit amet constuctem adipiscicin alut."
  }
]
export const Testimonial = () => {
  return (
    <section id="testimonial">
      <h5>Review from colleagues</h5>
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
                  <img src={testimonial.avatar} alt={testimonial.name} />            
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
