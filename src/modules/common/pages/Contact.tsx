import React, { useState } from "react";
import Layout from "../../../shared/layouts/Layout";
import { ArrowForward } from "@mui/icons-material";
import Footer from "../../../shared/components/layoutComponent/Footer";


const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <>
      <Layout>
        <div className="min-h-screen flex items-center justify-center ">
          <div className="container  md:p-12 grid grid-cols-1 md:grid-cols-2  max-w-5xl  ">
            {/* Thông tin liên hệ */}
            <div className="bg-white p-8 shadow-lg border-l-4  ">
              <h2 className="text-8xl font-bold text-black mb-4 ">Let’s get in touch</h2>
              <p className="text-gray-700 mb-6 font-semibold text-2xl">Don't be afraid to say hello with us!</p>
              <div className="text-gray-800">
                <p className="font-semibold">Phone</p>
                <p className="mb-4">+123456789</p>

                <p className="font-semibold">Email</p>
                <p className="mb-4">overtrack@gmail.com</p>

                <p className="font-semibold">Office</p>
                <p>FPT Cau Giay Building, Duy Tan Street, Dich Vong Hau Ward, Cau Giay District, Hanoi City, Vietnam</p>
                <a href="https://www.google.com/maps/place/To%C3%A0+nh%C3%A0+FPT+C%E1%BA%A7u+Gi%E1%BA%A5y/@21.0308333,105.7802029,17z/data=!3m1!4b1!4m6!3m5!1s0x313454b355336d23:0xb337376aa7a9622f!8m2!3d21.0308333!4d105.7827778!16s%2Fg%2F11dz_wjx9h?entry=ttu&g_ep=EgoyMDI1MDIxOS4xIKXMDSoASAFQAw%3D%3D"
                  className="text-black underline mt-2 inline-block">
                  See on Google Map ↗
                </a>
              </div>
            </div>

            <div className="flex flex-col justify-between ">
              <div className="flex items-center gap-2 bg-gray ">
                <ArrowForward className="text-2xl text-black pl-5" />
                <h2 className="m-13">
                  Great! We're excited to hear from you and let's start something special together.
                  Call us for any inquery
                </h2>
              </div>
              {/* Form liên hệ */}
              <div className="bg-black p-8 shadow-lg  ">
                <h2 className="text-white text-2xl font-bold mb-6">Contact</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="p-3 border rounded w-full bg-gray-800 text-white placeholder-gray-400"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="p-3 border rounded w-full bg-gray-800 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="p-3 border rounded w-full bg-gray-800 text-white placeholder-gray-400"
                    required
                  />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="p-3 border rounded w-full bg-gray-800 text-white placeholder-gray-400"
                    required
                  />
                  <textarea
                    name="message"
                    placeholder="Tell us about your interest in"
                    value={formData.message}
                    onChange={handleChange}
                    className="p-3 border rounded w-full bg-gray-800 text-white placeholder-gray-400 h-24"
                    required
                  ></textarea>
                  <button type="submit" className="w-full p-3 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-500">
                    Send to us
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Layout>
      <Footer />
    </>
  );
};

export default Contact;