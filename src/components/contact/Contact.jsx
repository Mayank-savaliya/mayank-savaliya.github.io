import React from 'react'
import {MdOutlineEmail} from 'react-icons/md'
import {BsWhatsapp} from 'react-icons/bs'
export const Contact = () => {
  return (
    <section id="contact">
      <h5>Get in touch </h5>
      <h2>Contact Me</h2>
      <div className="container contact__container">
        <div className="contact__options">
          <article className="contact__option">
             <MdOutlineEmail className='contact__option-icon'/>
             <h4>Email</h4>
             <h5>mayanksavaliya123@gmail.com</h5>
             <a href="mailto:mayanksavaliya123@gmail.com" target="_blank">Send a message</a>
          </article>

          <article className="contact__option">
             <BsWhatsapp className='contact__option-icon'/>
             <h4>WhatsApp</h4>
             <h5>+91 7096472724</h5>
             <a href="https://api.whatsapp.com/send?phone=+917096462724" target="_blank" >Send a message</a>
          </article>

        </div>
        <form action="" style={{display: 'none'}}>
          <input type="text" name="name" placeholder='Your Full Name' required/>
          <input type="email" name="email" placeholder='Your Email' required/>
          <textarea name="message" cols="30" rows="7" placeholder='Your Message'></textarea>
          <button type="submit" className='btn btn-primary'>Send Message</button>
        </form>
      </div>
    </section>
  )
}
