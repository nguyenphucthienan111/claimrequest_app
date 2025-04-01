import Footer from "../../../shared/components/layoutComponent/Footer";
import Layout from "../../../shared/layouts/Layout"

const About = () => {
  return (
    <Layout>
      <div className="flex  h-screen items-center  bg-[#F5EFE6]">
        <div className="max-w-6xl p-10 grid grid-cols-4 gap-6 ">
          {/* Side Text */}
          <div className=" flex items-center ">
            <h1 className="!text-[100px]  font-bold rotate-[-90deg] ">
              ABOUT
            </h1>
          </div>

          {/* Main Content */}
          <div className="col-span-2 ">
            <h2 className="text-xl text-gray-700 font-serif">Hi! Our name is FinancePro and we provide trusted financial services.</h2>
            <p className="text-gray-600 mt-4">
              We specialize in delivering reliable accounting solutions for businesses of all sizes.
              Our goal is to provide professional and comprehensive financial support, ensuring
              stability and growth for your company.
            </p>
            <p className="text-gray-600 mt-2">
              With a strong foundation in finance and years of expertise, we aim to help businesses
              navigate complex financial landscapes with confidence and ease.
            </p>


          </div>
          <div className="col-span-1 flex justify-center items-center">
            <img
              src="https://fpt.com/Images/images/tin-tuc-2021/toa-nha/Toan-canh-toa-nha.jpg"
              className="w-full h-full object-cover rounded-lg shadow-lg "
            />
          </div>
        </div>

      </div>
      <Footer />
    </Layout>
  )
}

export default About