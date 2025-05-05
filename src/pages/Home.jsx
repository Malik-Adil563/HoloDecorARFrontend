import { Navbar, Main, Footer, CategoryCards, ImgWDesc,SmallSection,BlogSection } from "../components";
import VideoShowcase from "../components/VideoShowcase";



function Home() {
  return (
    <>
      <Navbar />
      <Main />
      <CategoryCards />
      <ImgWDesc/>
      <SmallSection/>
      <VideoShowcase/>
      <BlogSection/>
      <Footer />
      
    </>
  )
}

export default Home