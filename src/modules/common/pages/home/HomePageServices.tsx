const HomepageServices = () => {
    return (
        <div className="bg-blue-200 my-12 py-10 px-5">
            <h2 className="text-2xl font-bold">Comprehensive Services</h2>
            <div className="flex flex-wrap gap-4 mt-12">
                {services.map((service, index) => (
                    <div key={index} className="flex flex-1 justify-center my-5 w-full md:w-[48%]">
                        <div className="flex w-full items-center">
                            <div className="w-2/5">
                                <img src={service.image} alt={service.title} className="w-full object-cover" />
                            </div>
                            <div className="w-3/5 pl-5">
                                <p className="font-semibold">{service.title}</p>
                                <p className="mt-2 text-sm">{service.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <h1 className="text-3xl text-center font-bold mt-24">Being There Wherever, Whenever You Need Us</h1>
            <div className="flex justify-between py-12">
                {statistics.map((stat, index) => (
                    <div key={index} className="text-center">
                        <div className={`text-5xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-lg font-semibold text-gray-700">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const services = [
    {
        title: "Financial Statements",
        description: "Our financial consulting services provide expert guidance on budgeting, financial planning, and investment strategies tailored to your business needs.",
        image: "https://static.wixstatic.com/media/11062b_f0010cf224904e5383ed94bd38b873ab~mv2.jpg/v1/fill/w_470,h_295,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_f0010cf224904e5383ed94bd38b873ab~mv2.jpg"
    },
    {
        title: "Tax Preparation",
        description: "We specialize in tax preparation services, ensuring compliance with tax regulations and maximizing deductions to optimize your financial position.",
        image: "https://static.wixstatic.com/media/11062b_aa4665bc130a49728ebf3c1e65dd90e6~mv2.jpg/v1/fill/w_470,h_295,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/02.jpg"
    },
    {
        title: "Bookkeeping Services",
        description: "Efficient and accurate bookkeeping services to keep your financial records organized and up-to-date, enabling informed business decisions.",
        image: "https://static.wixstatic.com/media/11062b_d8c8c150557a41fb986c6162f2556939~mv2.jpg/v1/fill/w_470,h_295,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/03.jpg"
    },
    {
        title: "Financial Advising",
        description: "Comprehensive audit support services to assist your business in preparing for audits and ensuring compliance with financial regulations.",
        image: "https://static.wixstatic.com/media/11062b_7ffbcc1b69df473a86873f09a429a709~mv2.jpg/v1/fill/w_470,h_295,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/04.jpg"
    }
];

const statistics = [
    { value: "86", label: "Branches & Representative offices", color: "text-cyan-500" },
    { value: "1,100+", label: "Global Clients", color: "text-green-500" },
    { value: "33,000+", label: "Employees", color: "text-blue-700" },
    { value: "30", label: "Countries & Territories", color: "text-orange-500" }
];

export default HomepageServices;