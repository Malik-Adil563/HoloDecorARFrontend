import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Navbar, Footer } from "../components";
import { useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const blogContent = {
  "why-ar-is-the-future-of-home-decor": {
    title: "Why AR is the Future of Home Decor",
    date: "April 30, 2025",
    author: "Minahil Shah",
    images: ["../assets/After.jpg", "../assets/Before.png"],
    content: `In today's rapidly evolving technological landscape, Augmented Reality (AR) is becoming a transformative force in the way we approach home decor and interior design. What was once the domain of professional designers and visualization experts is now accessible to anyone with a smartphone. AR enables users to bridge the gap between imagination and reality, offering a level of personalization, accuracy, and confidence that traditional design tools simply cannot match.

Understanding AR in Home Decor
Augmented Reality in home decor refers to the use of digital overlays that appear in your real-world space through your device’s camera. With AR, you can place virtual furniture, try out different wall colors, and visualize room arrangements with astonishing realism. Instead of flipping through catalog pages or relying on guesswork, users can see exactly how a new piece of decor will fit into their space before buying or rearranging anything.

This approach revolutionizes the decorating process. It’s no longer about imagining how something might look—it’s about experiencing it in real time. The results are more intuitive decision-making and a far more satisfying decorating journey.

Elevating the Design Process
One of the most significant advantages of AR is the ability to visualize furniture and decor in real-world scale and lighting conditions. It removes much of the uncertainty and hesitation from design choices. For example, a customer considering a bold-colored armchair can see exactly how it will complement existing items in their room without committing to a purchase. If it doesn’t work, they can swap it out with another option instantly and keep experimenting until they’re satisfied.

The process is not only practical but also creatively liberating. AR gives people the freedom to play with styles, colors, and arrangements without the physical limitations of moving heavy objects or painting and repainting walls. It’s design without the risk and without the mess.

Moving Beyond Traditional Tools
Traditional home decor methods rely on sample swatches, physical measurements, and a lot of mental visualization. These methods often lead to mistakes, second-guessing, and returns. While some mobile apps from major furniture brands have introduced basic AR functionality, they are usually limited in realism, customization, and scale.

In contrast, more advanced AR platforms provide a seamless, immersive experience. These allow for not just the placement of single furniture pieces but the simulation of entire room makeovers. With real-time shadows, proportionally accurate models, and flexible customization, these platforms offer a user experience that mirrors working with an interior designer—only with complete control in the user’s hands.

Empowering Professionals and Homeowners Alike
AR is not only a game-changer for individual homeowners. Professionals in design, real estate, and renovation are integrating AR into their workflow to improve client engagement and project approval rates. Interior designers can present fully rendered concepts to clients within the clients’ own spaces, eliminating miscommunication and uncertainty.

Home stagers and real estate agents are using AR to transform empty homes into fully furnished showcases that help potential buyers visualize possibilities. Homeowners working on renovations or DIY projects can virtually test layouts, choose materials, and see how different upgrades will look, all before spending a single dollar on supplies.

A Glimpse into the Future: AR and AI Combined
The future of home decor lies at the intersection of AR and Artificial Intelligence. Together, these technologies are creating a world where design assistance is not only visual but intelligent. AR allows you to see it. AI helps you decide. With smart suggestions based on your taste, browsing history, or even your mood, AI-powered AR platforms can curate styles that match your personality while adapting to trends.

Imagine walking into your bedroom and receiving a suggestion on your device: a minimalist Scandinavian look with soft hues and natural textures based on your preference history. With a few taps, you see it come to life in your own space. This is not science fiction—it’s the near future of home design.`
  },
  "how-to-use-ar-for-redesigning-your-room": {
    title: "How to Use AR for Redesigning Your Room",
    date: "April 28, 2025",
    author: "Bushra Yawar",
    images: ["../assets/blog2pic1.png"],
    content: `Redesigning your space has never been easier. With our web-based AR Home Decor Visualizer, you can reimagine your room directly from your browser—no downloads or installations required.

Step 1: Scan Your Space
Using your device’s camera, scan your room right from the browser. The visualizer will detect your room’s layout in real time, identifying walls, floors, and existing furniture.

Step 2: Browse & Select
Explore our digital catalog of furniture, color palettes, textures, and decor items. From cozy modern to bold industrial styles, find elements that match your vision.

Step 3: Place & Preview
Click to place items into your live space. You can reposition, rotate, or scale them to fit perfectly. Want to see how a coffee table pairs with your sofa? Or how a new color will look on your wall? It’s all possible in seconds.

Step 4: Save or Share Your Design
Once you’ve styled your space, save your layout or take a screenshot to share with friends, family, or clients.

Why It’s Game-Changing
Our browser-based AR tool brings the power of professional design directly to you—no app required. Experience design in your own space, with real-time accuracy and zero guesswork.`
  },
  "themes-that-transform-your-living-space": {
    title: "Themes That Transform Your Living Space",
    date: "April 26, 2025",
    author: "Malik Adil",
    images: ["../assets/blog3pic3.png", "../assets/blog3pic2.png", "../assets/blog3pic1.png"],
    content: `Your home is more than just walls and furniture—it’s a place where your personality, mood, and values are expressed. Choosing the right interior design theme can completely transform the way your space looks and feels. Whether you're starting from scratch or looking to refresh a room, understanding different design themes can help you make intentional and impactful changes.

One of the most popular approaches to modern home design is minimalism. With its “less is more” philosophy, minimalism strips away the unnecessary and embraces simplicity. This theme relies on neutral tones, clean lines, and functional furniture to create a calming, open atmosphere. Minimalist spaces often feel larger and more organized, making them ideal for small apartments or those who prefer clutter-free environments.

Another beloved theme is Scandinavian design, which blends minimalism with warmth and comfort. Known for its use of light woods, soft textiles, and cozy lighting, this style focuses on functionality without sacrificing beauty. Scandinavian interiors often highlight natural light, incorporate plenty of greenery, and promote a sense of peace and contentment—qualities that are especially appealing in today's fast-paced world.

For those who love boldness and self-expression, the bohemian theme offers a vibrant, eclectic mix of textures, colors, and global influences. Boho spaces feel layered and lived-in, with items collected over time like woven rugs, handmade crafts, vintage furniture, and lush plants. This theme encourages creativity and freedom, and it’s perfect for people who enjoy mixing patterns, showcasing personal collections, or blending cultural styles.

On the other end of the spectrum, the industrial theme embraces raw materials and urban influence. Inspired by warehouses and lofts, industrial design features exposed brick walls, metal pipes, concrete floors, and repurposed wood. The look is edgy yet sophisticated, often paired with minimal decor and strong, statement lighting. It’s especially well-suited for city apartments and open-concept living spaces.

The rustic or farmhouse theme continues to be a timeless favorite for its cozy and inviting aesthetic. With warm wood finishes, distressed furniture, vintage accessories, and natural fabrics, this style evokes a sense of countryside charm. Rustic interiors often feel nostalgic and comforting, making them ideal for family homes or anyone who values tradition and simplicity.

If you’re dreaming of sea breezes and serene escapes, a coastal theme might be the way to go. Inspired by beach houses and seaside living, this style uses light, airy colors like whites, blues, and sandy beiges. Nautical elements such as rope, shells, and driftwood are common, and the overall mood is relaxed and casual. Coastal interiors aim to bring the outdoors in and create a calming retreat from the hustle of daily life.

For those who enjoy staying current with trends, contemporary design offers a stylish and ever-evolving option. Contemporary interiors are sleek, curated, and often feature bold statement pieces, high-contrast color schemes, and a mix of materials like glass, metal, and textured fabrics. This theme allows you to update your space with ease and gives you the flexibility to adapt to new styles without a complete overhaul.

What makes home decorating truly exciting is the freedom to combine elements from different themes. Many homeowners now blend styles to create hybrid spaces like “modern farmhouse” or “Scandi-boho,” resulting in personalized and dynamic environments. Mixing styles works best when done thoughtfully—keeping color schemes and overall balance in mind helps everything flow naturally.

Ultimately, the best theme is the one that reflects your lifestyle, values, and personal taste. Whether you want a peaceful retreat, an expressive studio, or a welcoming family hub, the right design approach can make your living space feel truly yours. Let your creativity lead the way, and don’t be afraid to experiment—you might just transform your home into something extraordinary.`
  },
  "how-ai-and-ar-are-changing-e-commerce": {
    title: "How AI and AR Are Changing E-commerce",
    date: "April 24, 2025",
    author: "Minahil Shah",
    images: ["../assets/blog4pic1.png"],
    content: `The world of e-commerce is evolving fast, and two technologies are playing a major role in this transformation: Artificial Intelligence (AI) and Augmented Reality (AR). Together, they’re not just improving online shopping—they’re completely reshaping it.

AI is making e-commerce smarter and more personalized. From product recommendations based on browsing behavior to chatbots that answer customer queries 24/7, AI helps online stores offer a smoother, faster, and more customized shopping experience. It can even manage inventory, predict trends, and analyze customer feedback to help businesses make better decisions.

On the other hand, AR is making online shopping more interactive and visual. Shoppers can now “try on” clothes virtually, see how furniture looks in their room before buying, or view 3D models of products from all angles—all from their phones or computers. This not only builds confidence in purchase decisions but also reduces returns and boosts satisfaction.

Together, AI and AR are turning traditional online stores into smart, immersive platforms that feel more human and helpful. As these technologies continue to grow, the future of e-commerce looks more intuitive, engaging, and customer-centric than ever before.`
  }
};

const BlogPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  }, [hash]);

  const sliderSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: false,
  };

  const renderParagraphs = (content) =>
    content.split("\n\n").map((para, idx) => (
      <p key={idx} className="mb-3">{para.trim()}</p>
    ));

  const generateId = (title) =>
    title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  const blogEntries = Object.entries(blogContent);

  return (
    <>
      <Navbar />
      <Container className="py-5">
      <h2
  className="text-center mb-5 display-5 pb-3 font-bold"
  style={{ color: '#D1A36A', fontFamily: 'Poppins, sans-serif' }}
>
  ALL BLOGS
</h2>



        {blogEntries.map(([key, blog], index) => {
          const isEven = index % 2 === 0;
          const isFirst = index === 0;
          const isThemeBlog = key === "themes-that-transform-your-living-space";
          const isVerticalFillFix = key === "how-to-use-ar-for-redesigning-your-room" || key === "how-ai-and-ar-are-changing-e-commerce";

          return (
            <div id={generateId(blog.title)} key={key} className="mb-5 pb-5 border-bottom">
              <Row className="mb-4 align-items-center">
                <Col md={12}>
                  <h1 className="mb-2 text-center" style={{ fontWeight: 600 }}>{blog.title}</h1>
                  <p className="text-muted fst-italic text-center mb-4">
                    {blog.date} | By {blog.author}
                  </p>
                </Col>
              </Row>

              {isFirst && (
                <Slider {...sliderSettings} className="mb-5" style={{ maxWidth: "70%", margin: "0 auto" }}>
                  <div>
                    <img src={blog.images[0]} alt="Before" className="img-fluid rounded shadow" />
                  </div>
                  <div>
                    <img src={blog.images[1]} alt="After" className="img-fluid rounded shadow" />
                  </div>
                </Slider>
              )}

              {isThemeBlog && (
                <Slider {...sliderSettings} className="mb-5" style={{ maxWidth: "90%", margin: "0 auto" }}>
                  {blog.images.map((img, idx) => (
                    <div key={idx}>
                      <img
                        src={img}
                        alt={`theme-${idx}`}
                        className="img-fluid rounded shadow"
                        style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </Slider>
              )}

              <Row className={`mb-4 ${isVerticalFillFix ? 'd-flex align-items-stretch' : 'align-items-center'}`}>
                {isFirst || isThemeBlog ? (
                  <Col md={{ span: 8, offset: 2 }}>
                    <div className="fs-5 lh-lg" style={{ textAlign: "left" }}>
                      {renderParagraphs(blog.content)}
                    </div>
                  </Col>
                ) : isEven ? (
                  <>
                    <Col md={6} className={isVerticalFillFix ? "d-flex" : ""}>
                      <div
                        className={`fs-5 lh-lg ${isVerticalFillFix ? "d-flex flex-column justify-content-center" : ""}`}
                        style={{ width: "100%" }}
                      >
                        {renderParagraphs(blog.content)}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="text-center mb-4 h-100">
                        <img
                          src={blog.images[0]}
                          alt="Blog Visual"
                          className="img-fluid rounded shadow"
                          style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
                        />
                      </div>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col md={6}>
                      <div className="text-center mb-4 h-100">
                        <img
                          src={blog.images[0]}
                          alt="Blog Visual"
                          className="img-fluid rounded shadow"
                          style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
                        />
                      </div>
                    </Col>
                    <Col md={6} className={isVerticalFillFix ? "d-flex" : ""}>
                      <div
                        className={`fs-5 lh-lg ${isVerticalFillFix ? "d-flex flex-column justify-content-center" : ""}`}
                        style={{ width: "100%" }}
                      >
                        {renderParagraphs(blog.content)}
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </div>
          );
        })}
      </Container>
      <Footer />
    </>
  );
};

export default BlogPage;
