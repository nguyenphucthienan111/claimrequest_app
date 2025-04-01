const HomepageQuotes = () => {
  return (
    <div className="flex justify-center items-center w-full my-50">
      <div className="flex-1 flex justify-center items-center">
        <img
          src="https://ictv.1cdn.vn/2023/04/26/chu-tich-hdqt-fpt-truong-gia-binh.jpg"
          alt="Trương Gia Bình"
          className="rounded-full w-[600px] h-[600px] object-cover"
        />
      </div>

      <div className="flex-1 text-2xl relative max-w-[50%] mx-auto md:mx-0">
        <div className="absolute text-[120px] top-[-60px] left-[70px]">❝</div>
        <p className="w-2/3 mx-auto">
          Việt Nam đã thành lập các tập đoàn lớn, nhưng câu hỏi đặt ra là chúng ta có chung sức để làm những việc lớn hơn nữa không?
          <b>
            Bài học lịch sử trả lời rằng, chỉ khi nào đối diện thử thách lớn thì chúng ta mới có thể chung tay, chung sức đồng lòng.
          </b>
        </p>
        <div className="flex flex-col items-center w-2/3 mx-auto">
          <div className="bg-gradient-to-r from-black via-gray-900 to-red-900 w-full h-1 my-5"></div>
          <p className="text-lg font-semibold text-center">
            Doanh nhân <b>TRƯƠNG GIA BÌNH</b>
            <br />
            <i>Chủ tịch FPT</i>
          </p>
        </div>

        <div className="absolute text-[120px] bottom-[40px] right-[75px]">❞</div>
      </div>
    </div>
  );
};

export default HomepageQuotes;