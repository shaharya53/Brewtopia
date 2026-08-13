import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Custom Counter Component for counting animation
function Counter({ target }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const started = useRef(false);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 100000) return (num / 100000).toFixed(1) + "L";
    return num;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 2000; // 2 seconds animation
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function (easeOutQuad)
            const easeProgress = progress * (2 - progress);
            
            const currentCount = Math.floor(easeProgress * target);
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [target]);

  return (
    <span ref={elementRef} className="counter">
      {formatNumber(count)}
    </span>
  );
}

export default function Home() {
  // Hero Slider
  const [currentSliderPos, setCurrentSliderPos] = useState(0);
  const heroSliderItems = [
    {
      img: '/sebastian-schuppik-H7xTpvBjJS4-unsplash.jpg',
      subtitle: 'Traditional & Hygiene',
      title: <>For the love of <br /> delicious Coffee</>,
      text: 'Come and enjoy our delicious coffee with aesthetic area'
    },
    {
      img: '/daan-evers-tKN1WXrzQ3s-unsplash.jpg',
      subtitle: 'Traditional & Hygiene',
      title: <>For the love of <br /> delicious Coffee</>,
      text: 'Come and enjoy our delicious coffee with aesthetic area'
    },
    {
      img: '/nafinia-putra-Kwdp-0pok-I-unsplash.jpg',
      subtitle: 'Traditional & Hygiene',
      title: <>For the love of <br /> delicious Coffee</>,
      text: 'Come and enjoy our delicious coffee with aesthetic area'
    }
  ];

  const slideNext = () => {
    setCurrentSliderPos((prev) => (prev >= heroSliderItems.length - 1 ? 0 : prev + 1));
  };

  const slidePrev = () => {
    setCurrentSliderPos((prev) => (prev <= 0 ? heroSliderItems.length - 1 : prev - 1));
  };

  // Auto Slider
  useEffect(() => {
    const interval = setInterval(slideNext, 7000);
    return () => clearInterval(interval);
  }, []);

  // Moments Section Animation
  const [animateMoments, setAnimateMoments] = useState(false);
  const momentsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimateMoments(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (momentsRef.current) {
      observer.observe(momentsRef.current);
    }

    return () => {
      if (momentsRef.current) {
        observer.unobserve(momentsRef.current);
      }
    };
  }, []);

  // Reviews State
  const [customReviews, setCustomReviews] = useState([]);
  const initialReviews = [
    {
      img: '/artist-01.png',
      name: 'Divya Bhalodia',
      stars: '★★★★★',
      text: 'Great experience! Highly recommended.'
    },
    {
      img: '/artist-02.png',
      name: 'Kavya Patel',
      stars: '★★★★☆',
      text: 'Good service, but can be improved.'
    },
    {
      img: '/artist-03.png',
      name: 'Smit Panchal',
      stars: '★★★★★',
      text: 'Excellent quality and support!'
    },
    {
      img: '/artist-05.png',
      name: 'Arya Shah',
      stars: '★★★★★',
      text: 'Excellent quality and support!'
    },
    {
      img: '/artist-04.png',
      name: 'Smit Parmar',
      stars: '★★★★☆',
      text: 'Very satisfied with my purchase.'
    }
  ];

  const handleAddReview = () => {
    const name = prompt("Your Name:");
    if (!name) return;
    const ratingInput = prompt("Enter Star Rating (1 to 5):");
    const rating = parseInt(ratingInput) || 5;
    const reviewText = prompt("Enter Review:");
    if (!reviewText) return;

    let starString = "";
    if (rating === 1) starString = "★☆☆☆☆";
    else if (rating === 2) starString = "★★☆☆☆";
    else if (rating === 3) starString = "★★★☆☆";
    else if (rating === 4) starString = "★★★★☆";
    else starString = "★★★★★";

    setCustomReviews((prev) => [
      ...prev,
      {
        img: '/artist-03.png', // Fallback avatar for guest review
        name: name,
        stars: starString,
        text: reviewText
      }
    ]);
  };

  const momentsImages = [
    { src: '/about1.png', type: 'img-1' },
    { src: '/about2.png', type: 'img-2' },
    { src: '/about3.png', type: 'img-1' },
    { src: '/about4.webp', type: 'img-2' },
    { src: '/about16.avif', type: 'img-1' },
    { src: '/about6.avif', type: 'img-2' },
    { src: '/about7.avif', type: 'img-2' },
    { src: '/about8.png', type: 'img-1' },
    { src: '/about9.avif', type: 'img-2' },
    { src: '/about10.avif', type: 'img-1' },
    { src: '/about11.avif', type: 'img-2' },
    { src: '/about12.avif', type: 'img-1' },
    { src: '/about13.avif', type: 'img-1' },
    { src: '/about14.avif', type: 'img-2' },
    { src: '/about15.avif', type: 'img-1' },
    { src: '/about16.avif', type: 'img-2' },
    { src: '/about17.avif', type: 'img-1' },
    { src: '/about18.avif', type: 'img-2' }
  ];

  return (
    <main>
      <article>
        {/* Section 1: Hero */}
        <section id="nav1" className="hero text-center" aria-label="home">
          <ul className="hero-slider" data-hero-slider>
            {heroSliderItems.map((item, idx) => (
              <li
                key={idx}
                className={`slider-item ${idx === currentSliderPos ? 'active' : ''}`}
                data-hero-slider-item
              >
                <div className="slider-bg">
                  <img src={item.img} width="1880" height="950" className="img-cover" alt="" />
                </div>
                <p className="label-2 section-subtitle slider-reveal">{item.subtitle}</p>
                <h1 className="display-1 hero-title slider-reveal">{item.title}</h1>
                <p className="body-2 hero-text slider-reveal">{item.text}</p>
                <a href="#nav2" className="btn btn-primary slider-reveal">
                  <span className="text text-1">View Menu</span>
                  <span className="text text-2" aria-hidden="true">View Menu</span>
                </a>
              </li>
            ))}
          </ul>
          
          <button className="slider-btn prev" aria-label="slide to previous" onClick={slidePrev}>
            <ion-icon name="chevron-back"></ion-icon>
          </button>
          <button className="slider-btn next" aria-label="slide to next" onClick={slideNext}>
            <ion-icon name="chevron-forward"></ion-icon>
          </button>

          <Link to="/book-table" className="hero-btn has-after">
            <img src="/images/hero-icon.png" width="48" height="48" alt="" />
            <span className="label-2 text-center span">Book A Table</span>
          </Link>
        </section>

        {/* Section 2: Menu Grid */}
        <h1 id="nav2" className="body-1 contact-number hover-underline view-menu-heading">MENU</h1>
        <div className="menu-main">
          <div className="menu-3">
            <Link to="/menu/coffee">
              <div className="menu-1-item" style={{ backgroundImage: 'url(/Coffeemenu2.webp)', backgroundSize: 'cover', opacity: 0.6 }}></div>
            </Link>
            <Link to="/menu/fastfood">
              <div className="menu-2-item" style={{ backgroundImage: 'url(/Foodmenu1.webp)', backgroundSize: 'cover', opacity: 0.6 }}></div>
            </Link>
          </div>
          <div className="menu-3">
            <Link to="/menu/bakery">
              <div className="menu-2-item" style={{ backgroundImage: 'url(/Bakerymenu1.webp)', backgroundSize: 'cover', opacity: 0.6 }}></div>
            </Link>
            <Link to="/menu/cakes">
              <div className="menu-1-item" style={{ backgroundImage: 'url(/Cakesmenu1.webp)', backgroundSize: 'cover', opacity: 0.6 }}></div>
            </Link>
          </div>
          <div className="menu-3">
            <Link to="/menu/mocktails">
              <div className="menu-1-item" style={{ backgroundImage: 'url(/Mocktails.webp)', backgroundSize: 'cover', opacity: 0.7 }}></div>
            </Link>
            <Link to="/menu/tea">
              <div className="menu-2-item" style={{ backgroundImage: 'url(/Teamenu1.webp)', backgroundSize: 'cover', opacity: 0.7 }}></div>
            </Link>
          </div>
        </div>

        {/* Bestsellers Section */}
        <h1 className="body-1 contact-number hover-underline bestseller-heading">BESTSELLERS</h1>
        <div className="best-container">
          <ul className="accordion">
            <li><img src="/Bestseller.webp" alt="" className="img-best" id="img1" /></li>
            <li><img src="/Crunchyredhat.png" alt="" className="img-best" id="img2" /></li>
            <li><img src="/Cafemocha.jpg" alt="" className="img-best" id="img3" /></li>
            <li><img src="/Hazelnutoatcortado.jpg" alt="" className="img-best" id="img5" /></li>
            <li><img src="/Chocolatecortado.jpg" alt="" className="img-best" id="img4" /></li>
          </ul>
        </div>

        {/* Section 3: Offers */}
        <h1 id="nav3" className="body-1 contact-number hover-underline offers-heading">Offers</h1>
        <div className="offer">
          <ul className="accordion">
            <li><img src="/offer2.png" alt="Offer" /></li>
            <li><img src="/b1g1offer.jpg" alt="Offer" /></li>
            <li><img src="/subscriberoffer.jpg" alt="Offer" /></li>
            <li><img src="/sandwichoffer.jpg" alt="Offer" /></li>
            <li><img src="/valentineoffer.jpg" alt="Offer" /></li>
          </ul>
        </div>

        {/* Section 4: Our Presence */}
        <h1 id="nav4" className="body-1 contact-number hover-underline view-menu-heading">OUR PRESENCE</h1>
        <div className="loc-counter">
          <div className="location-container">
            {[
              { img: '/ahmedabad.avif', state: 'Gujarat', offset: '65px' },
              { img: '/mumbai.avif', state: 'Maharashtra', offset: '40px' },
              { img: '/delhi.avif', state: 'Delhi', offset: '80px' },
              { img: '/rajasthan.avif', state: 'Rajasthan', offset: '50px' },
              { img: '/kerela.avif', state: 'Kerala', offset: '70px' },
              { img: '/madhyapradesh.avif', state: 'Madhya Pradesh', offset: '25px' },
              { img: '/banglore.avif', state: 'Banglore', offset: '60px' },
              { img: '/goa.avif', state: 'Goa', offset: '80px' },
            ].map((loc, index) => (
              <div key={index} className="location-items">
                <img src={loc.img} alt={loc.state} />
                <p style={{ left: loc.offset }}>{loc.state}</p>
              </div>
            ))}
          </div>

          <div className="counter-section">
            <div className="counter-box">
              <Counter target={2200000} />
              <strong>Customers</strong>
            </div>
            <div className="counter-box">
              <Counter target={870000} />
              <strong>Reviews</strong>
            </div>
            <div className="counter-box">
              <Counter target={700} />
              <strong>Outlets</strong>
            </div>
            <div className="counter-box">
              <Counter target={227} />
              <strong>Items</strong>
            </div>
          </div>
        </div>

        {/* Moments Section */}
        <h1 className="moments-heading">Moments @ BREWTOPIA</h1>
        <div ref={momentsRef} className="moments">
          {momentsImages.map((mom, idx) => (
            <div
              key={idx}
              className={`moments-items ${animateMoments ? 'momentts' : ''}`}
              style={{ transitionDelay: animateMoments ? `${idx * 200}ms` : '0ms' }}
            >
              <img id={mom.type} src={mom.src} alt="Brewtopia Moment" />
            </div>
          ))}
        </div>

        <hr />

        {/* Section 5: About */}
        <h1 id="nav5" className="body-1 contact-number hover-underline about-heading">ABOUT</h1>
        <div className="about-one">
          <div className="about-image">
            <img className="image-1" src="/kris-atomic-3b2tADGAWnU-unsplash.jpg" alt="" />
          </div>
          <div className="about-item">
            <p>
              Brewtopia is the country's first completely indigenous and eclectic café chain, known not just for its menu, but the varied experiences it brought to 20 outlets in 18 cities to expand the cafe culture.
            </p>
            <p>
              Born in 2001 in the bylanes of Churchgate, Mumbai and celebrating more than 20 years of operations, Brewtopia has influenced the world-view of an entire generation, to stir a social revolution.
            </p>
          </div>
        </div>
        <div className="about-two">
          <div className="about-item">
            <p>
              Brewtopia is the country's first completely indigenous and eclectic café chain, known not just for its menu, but the varied experiences it brought to 20 outlets in 18 cities to expand the cafe culture.
            </p>
            <p>
              Born in 2001 in the bylanes of Churchgate, Mumbai and celebrating more than 20 years of operations, Brewtopia has influenced the world-view of an entire generation, to stir a social revolution.
            </p>
          </div>
          <div className="about-image">
            <img className="image-2" src="/rodeo-project-management-software-PYqzYhTNjho-unsplash.jpg" alt="" />
          </div>
        </div>

        {/* Reviews Listing */}
        <h1 className="body-1 contact-number hover-underline review-heading">Reviews</h1>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...initialReviews, ...customReviews].map((rev, index) => (
              <div key={index} className="review-card">
                <div className="customer-info">
                  <img src={rev.img} alt={rev.name} className="customer-photo" />
                  <span className="customer-name">{rev.name}</span>
                </div>
                <div className="stars">{rev.stars}</div>
                <p>{rev.text}</p>
              </div>
            ))}
          </div>
          <div className="marquee-track" aria-hidden="true">
            {[...initialReviews, ...customReviews].map((rev, index) => (
              <div key={`dup-${index}`} className="review-card">
                <div className="customer-info">
                  <img src={rev.img} alt={rev.name} className="customer-photo" />
                  <span className="customer-name">{rev.name}</span>
                </div>
                <div className="stars">{rev.stars}</div>
                <p>{rev.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rate-news">
          <div className="rate-news-item">
            <div className="rating-card">
              <div className="text-wrapper">
                <p className="text-primary">Please Rate Your Experience</p>
                <p className="text-secondary">to help us serve you better</p>
              </div>
              <div>
                <button className="custom-review" onClick={handleAddReview}>
                  Write Review
                </button>
              </div>
              <br />
              <div className="socials-container">
                <a className="social-button" href="#">
                  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z"></path>
                  </svg>
                </a>
                <a className="social-button" href="#">
                  <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                  </svg>
                </a>
                <a className="social-button" href="#">
                  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="rate-news-item">
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <span className="title">Subscribe to our newsletter.</span>
              <p className="description">Nostrud amet eu ullamco nisi aute in ad minim nostrud adipisicing velit quis. Duis tempor incididunt dolore.</p>
              <div>
                <input placeholder="Enter your email" type="email" name="email" id="email-address" required />
                <button type="submit">Subscribe</button>
              </div>
            </form>
          </div>
        </div>
      </article>
    </main>
  );
}
