import React, { lazy, Suspense } from "react";
import { useInView } from "react-intersection-observer";
import Layout from "../../../../shared/layouts/Layout";
import Footer from "../../../../shared/components/layoutComponent/Footer";
import { CircularProgress } from "@mui/material";

// Sử dụng React.lazy để lazy load các component
const HomepageTitle = lazy(() => import("./HomePageTitle"));
const HomepageServices = lazy(() => import("./HomePageServices"));
const HomepageQuotes = lazy(() => import("./HomePageQuotes"));
const PartnersSection = lazy(() => import("./HomePagePartners"));
const AboutUs = lazy(() => import("./HomePageIntro"));

const LazyComponent = ({ component: Component }: { component: React.FC }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    return (
        <div ref={ref} className="min-h-[300px] w-full max-w-[100vw]"> 
            {inView ? (
                <Suspense fallback={
                    <div className="flex justify-center items-center h-[300px]">
                        <CircularProgress size={50} />
                    </div>
                }>
                    <Component />
                </Suspense>
            ) : null}
        </div>
    );
};

const Home: React.FC = () => {
    return (
        <>
            <Layout>
                <LazyComponent component={HomepageTitle}/>
                <LazyComponent component={AboutUs} />
                <LazyComponent component={HomepageQuotes} />
                <LazyComponent component={HomepageServices} />
                <LazyComponent component={PartnersSection} />
            </Layout>
            <Footer />
        </>
    );
};

export default Home;