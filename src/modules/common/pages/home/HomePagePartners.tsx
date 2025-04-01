const partners = [
    { name: "Adobe", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Adobe_Corporate_logo.svg" },
    { name: "AWS", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" },
    { name: "Dataiku", logo: "https://upload.wikimedia.org/wikipedia/fr/9/91/Dataiku_logo.png" },
    { name: "Google Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" },
    { name: "LandingAI", logo: "https://app.circle.so/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCS3BXeEFJPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--2c1eb9632ec3537b7353b368867823a414174b27/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDRG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNITUdrQ09BUTZDbk5oZG1WeWV3WTZDbk4wY21sd1ZBPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--cfda350175ba87e768b4e96e935a8171fc679bec/LandingAI-logo-stacked-color-RGB.png" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
    { name: "NVIDIA", logo: "https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg" },
    { name: "OutSystems", logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/OS-logo-color_500x108.png" },
    { name: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" },
    { name: "SAP", logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg" },
    { name: "ServiceNow", logo: "https://mma.prnewswire.com/media/1316642/ServiceNow_Logo.jpg?p=facebook" },
    { name: "Sitecore", logo: "https://seeklogo.com/images/S/sitecore-logo-D5387ED3C7-seeklogo.com.png" }
];

const PartnersSection = () => {
  return (
    <div className="mt-24 text-center">
      <h1 className="text-4xl font-bold">Our Partners & Alliances</h1>
      <p className="text-lg mt-4 mb-12">
        We partnered with global leaders to drive innovative technology solutions with excellence
      </p>
      <div className="grid grid-cols-4 gap-5 mx-24 mb-48">
        {partners.map((partner, index) => (
          <div
            key={index}
            className="flex justify-center items-center bg-white bg-opacity-10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-blue-500 hover:shadow-blue-500/50"
          >
            <img src={partner.logo} alt={partner.name} draggable="false" width="100px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnersSection;