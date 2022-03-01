import React from 'react'
import UserAvatar from '../../assets/1.png'

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
      <div className="container testimonials__container">
        {
          testimonial_metadata.map((testimonial, index) => {
            return(
              <article key={index} className="testimonial">
                <div className="client__avatar">
                  <img src={testimonial.avatar} alt={testimonial.name} />            
                </div>
                <h5 className='client__name'>{testimonial.name}</h5>
                  <small className="client__review">
                    {testimonial.review}
                </small>
              </article>
            )
          })
        }
      </div>
    </section>
  )
}
