import React from 'react';
import { Footer, Navbar } from "../components";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut"
    }
  })
};

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <div className="container pt-2 pb-4 d-flex flex-column align-items-center" style={{ color: '#6c757d' }}>
        
        {/* About Us */}
        <motion.div
          className="text-justify mb-5"
          style={{ width: '70%' }}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <h1 className="text-center mb-3">About HoloDecor</h1>
         
          <p>
            <strong>Blending cutting-edge AR with inspiring interior design.</strong>
          </p>
          <p>
            HoloDecor lets you visualize room transformations using immersive holographic and AR technology — so you can decorate with confidence before making changes.
          </p>
          <p>
            Whether you're staging a new home, upgrading your apartment, or collaborating on a client project, HoloDecor gives you tools to imagine, share, and realize design ideas effortlessly.
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.div
          className="text-justify mb-5"
          style={{ width: '70%' }}
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeInUp}
        >
          <div id="our-story">
  <h2 className="text-center mb-3">Our Story</h2>
  <p>HoloDecor was born from a passion to bridge creativity and technology. As design enthusiasts frustrated by traditional guesswork and wasteful practices, we envisioned a platform where users could instantly preview their dream rooms in photorealistic detail. Starting as a small concept between friends in a university lab, HoloDecor has grown into a dynamic tool used by homeowners, decorators, and professionals. We continue to innovate with one goal: make interior design seamless, smart, and deeply personal.</p>
</div>

        </motion.div>

        {/* Our Mission */}
        <motion.div
          className="text-justify mb-5"
          style={{ width: '70%' }}
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeInUp}
        >
          <h2 className="text-center mb-3">Our Mission</h2>
          <p>
            Our mission is to empower individuals and design professionals to rethink how spaces are imagined and created. We believe that everyone should have access to intuitive, visual tools that allow them to plan their interiors with confidence and creativity. By reducing uncertainty and material waste, we strive to make the design journey more sustainable, cost-effective, and enjoyable — all while maintaining artistic freedom and functional clarity.
          </p>
        </motion.div>

        {/* Our Vision */}
        <motion.div
          className="text-justify mb-5"
          style={{ width: '70%' }}
          initial="hidden"
          animate="visible"
          custom={4}
          variants={fadeInUp}
        >
          <h2 className="text-center mb-3">Our Vision</h2>
          <p>
            Our vision is to redefine the future of interior design by blending physical and digital realities. We aim to become the leading platform for AR-powered design experiences — enabling users to create lifelike room environments and test ideas before execution. We envision a world where interior design is no longer limited by imagination, but enriched by immersive tools that inspire creativity, precision, and personalized beauty in every space.
          </p>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={5}
          variants={fadeInUp}
          className="text-center"
          style={{ width: '100%' }}
        >
          <h2 className="py-4">Why Choose HoloDecor?</h2>
          <div className="row justify-content-center">
            {[
              {
                title: "Real-Time Previews",
                text: "Experience full room layouts with beds, sofas, and decor — before committing.",
                image: "https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              
              {
                title: "Eco-Friendly Approach",
                text: "Reduce returns and waste with smart, pre-visualized choices.",
                image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                title: "User-First Tools",
                text: "No design experience needed — intuitive interfaces for all users.",
                image: "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=600"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="col-md-6 col-lg-3 mb-4"
                initial="hidden"
                animate="visible"
                custom={index + 6}
                variants={fadeInUp}
              >
                <div className="card h-100 shadow-sm p-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="card-img-top img-fluid"
                    style={{ height: "160px", objectFit: "cover", borderRadius: "0.5rem" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text">{item.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;