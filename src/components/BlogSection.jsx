import React from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const BlogSection = () => {
  const blogs = [
    {
      title: "Why AR is the Future of Home Decor",
      description:
        "Augmented reality is transforming how people visualize furniture, paint colors, and layouts before buying.",
      image: "/assets/ardecor.png",
    },
    {
      title: "How to Use AR for Redesigning Your Room",
      description:
        "Discover simple steps to use AR apps that let you preview furniture and decor in your actual space.",
      image: "/assets/usingar.jpeg",
    },
    {
      title: "Themes That Transform Your Living Space",
      description:
        "Explore how color palettes, paired with AR visualization, can create a calming and modern home environment.",
      image: "/assets/bluethemed.jpeg",
    },
    {
      title: "How AI and AR Are Changing E-commerce",
      description:
        "From virtual try-ons to 3D previews, AI and AR are enhancing online shopping experiences like never before.",
      image: "/assets/arai.jpeg",
    },
  ];

  const generateId = (title) =>
    title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  return (
    <section className="py-5 bg-light">
      <Container>
        <div className="text-center mb-4" style={{ fontFamily: "Georgia" }}>
          <h2 className="fw-bold fs-1">Latest from Our Blog</h2>
          <p className="text-muted fs-5">
            Explore tips, design inspiration, and more!
          </p>
        </div>

        <Row className="g-4">
          {blogs.map((blog, index) => (
            <Col xs={12} md={6} className="d-flex" key={index}>
              <Link
                to={`/blog#${generateId(blog.title)}`}
                className="text-decoration-none text-dark w-100"
              >
                <Card className="flex-fill shadow-sm h-100" style={{ cursor: "pointer" }}>
                  <Card.Img
                    variant="top"
                    src={blog.image}
                    style={{ height: "250px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title className="fs-5 fw-bold">{blog.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {blog.description.substring(0, 150)}...
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="bg-white border-0">
                    <Button variant="outline-dark" size="md" className="w-100">
                      Read More
                    </Button>
                  </Card.Footer>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-4">
          <Link to="/blog">
            <Button
              size="lg"
              className="border-0 text-white"
              style={{
                backgroundColor: "#C29664",
                transition: "all 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#a87945";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#C29664";
                e.target.style.transform = "translateY(0)";
              }}
            >
              View All Blogs
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default BlogSection;
