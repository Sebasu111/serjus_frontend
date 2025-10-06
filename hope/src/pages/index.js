import React from "react";
import Layout from "../layouts/index.jsx";
import Header from "../layouts/header";
import PricingContainer from "../containers/global/pricing";
import Footer from "../layouts/footer";
import ScrollToTop from "../components/scroll-to-top";
import SEO from "../components/seo";

const HomePage = () => {
    return (
        <React.Fragment>
            <Layout>
                <SEO title="Hope – Health &amp; Medical React JS Template" />
                <div className="wrapper home-default-wrapper">
                    <Header />
                    <div className="main-content site-wrapper-reveal">
                        <PricingContainer />
                    </div>
                    <Footer />
                    <ScrollToTop />
                </div>
            </Layout>
        </React.Fragment>
    );
};

export default HomePage;
