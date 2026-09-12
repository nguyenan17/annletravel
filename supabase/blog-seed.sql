-- ANNLETRAVEL - 6 bài SEO khởi tạo cho Blog
-- Chạy sau supabase/blog.sql
-- Có thể chạy lại an toàn: slug được upsert.

insert into public.blog_posts
(title, slug, excerpt, content, cover_image, seo_title, seo_description, category, destination, published, published_at, updated_at)
values
(
'Hướng dẫn du lịch Hàn Quốc tự túc: lịch trình, chi phí và kinh nghiệm cần biết',
'kinh-nghiem-du-lich-han-quoc-tu-tuc',
'Từ cách lên lịch trình Seoul - Busan đến mẹo di chuyển, ăn uống và chuẩn bị cho chuyến đi Hàn Quốc tự túc.',
'<h2>Du lịch Hàn Quốc tự túc nên bắt đầu từ đâu?</h2><p>Hàn Quốc phù hợp với cả chuyến đi ngắn ngày và hành trình dài ngày. Nếu lần đầu đến Hàn Quốc, bạn có thể bắt đầu với Seoul, sau đó mở rộng sang Busan hoặc một điểm đến thiên nhiên tùy thời gian.</p><h2>Lịch trình Hàn Quốc 5 ngày 4 đêm gợi ý</h2><h3>Ngày 1 - Seoul</h3><p>Khám phá khu Myeongdong, cung điện Gyeongbokgung và Bukchon Hanok Village. Buổi tối có thể dành thời gian mua sắm và thưởng thức ẩm thực đường phố.</p><h3>Ngày 2 - Seoul</h3><p>Tham quan N Seoul Tower, Hongdae và các khu phố mua sắm. Nên gom các điểm gần nhau để giảm thời gian di chuyển.</p><h3>Ngày 3 - Seoul hoặc ngoại ô</h3><p>Có thể chọn Nami Island, Garden of Morning Calm hoặc dành thêm một ngày cho Seoul tùy sở thích.</p><h3>Ngày 4 - Busan</h3><p>Di chuyển bằng tàu cao tốc và khám phá Gamcheon Culture Village, Haeundae, Jagalchi Market.</p><h3>Ngày 5 - Busan</h3><p>Tham quan biển, cafe ven biển và trở về theo lịch bay.</p><h2>Chi phí cần dự trù</h2><p>Các khoản chính gồm vé máy bay, khách sạn, phương tiện công cộng, ăn uống, vé tham quan và mua sắm. Nên tách ngân sách cố định và ngân sách mua sắm để dễ kiểm soát.</p><h2>Mẹo chuẩn bị</h2><ul><li>Kiểm tra hộ chiếu và yêu cầu nhập cảnh trước chuyến đi.</li><li>Chuẩn bị eSIM hoặc phương án kết nối Internet.</li><li>Tải bản đồ và ứng dụng hỗ trợ giao thông phù hợp.</li><li>Đổi một khoản tiền mặt vừa đủ và ưu tiên thanh toán tiện lợi.</li></ul><p>Muốn tối ưu lịch trình, bạn có thể tham khảo các tour Hàn Quốc của ANNLETRAVEL hoặc liên hệ để được tư vấn theo thời gian và ngân sách.</p>',
null,
'Du lịch Hàn Quốc tự túc: Lịch trình 5 ngày và kinh nghiệm từ A-Z',
'Kinh nghiệm du lịch Hàn Quốc tự túc: lịch trình Seoul, Busan, cách di chuyển, chi phí dự trù và những điều nên chuẩn bị.',
'Kinh nghiệm Hàn Quốc','Seoul',true,now() - interval '5 days',now()
),
(
'Lịch trình du lịch Nhật Bản 7 ngày: Tokyo, Kyoto và Osaka',
'lich-trinh-du-lich-nhat-ban-7-ngay',
'Gợi ý hành trình Nhật Bản 7 ngày dành cho người đi lần đầu, cân bằng giữa Tokyo, Kyoto và Osaka.',
'<h2>7 ngày có đủ để khám phá Nhật Bản?</h2><p>Với người đi Nhật lần đầu, 7 ngày là khoảng thời gian hợp lý để kết hợp Tokyo, Kyoto và Osaka. Điều quan trọng là không xếp quá nhiều điểm trong một ngày.</p><h2>Lịch trình gợi ý</h2><h3>Ngày 1-2: Tokyo</h3><p>Khám phá Asakusa, Senso-ji, Shibuya và Shinjuku. Buổi tối có thể trải nghiệm ẩm thực địa phương tại các khu phố trung tâm.</p><h3>Ngày 3: Tokyo - Kyoto</h3><p>Di chuyển bằng tàu cao tốc. Sau khi nhận phòng, tham quan khu Gion và các con phố truyền thống.</p><h3>Ngày 4-5: Kyoto</h3><p>Dành thời gian cho Fushimi Inari, Kiyomizu-dera, Arashiyama và các khu phố cổ.</p><h3>Ngày 6: Kyoto - Osaka</h3><p>Di chuyển sang Osaka, tham quan Dotonbori, Shinsaibashi và khu trung tâm.</p><h3>Ngày 7: Osaka</h3><p>Chọn Osaka Castle, khu mua sắm hoặc Universal Studios Japan tùy sở thích và lịch bay.</p><h2>Kinh nghiệm tiết kiệm thời gian</h2><p>Hãy chọn khách sạn gần ga tàu, chuẩn bị trước tuyến di chuyển và gom các điểm tham quan theo khu vực. Nhật Bản có hệ thống giao thông rất thuận tiện nhưng khoảng cách giữa các khu vực vẫn có thể khiến lịch trình bị quá tải nếu xếp thiếu hợp lý.</p><p>Nếu muốn một hành trình nhẹ nhàng hơn, ANNLETRAVEL có thể tư vấn lịch trình Nhật Bản theo mùa, ngân sách và số ngày thực tế.</p>',
null,
'Lịch trình Nhật Bản 7 ngày: Tokyo - Kyoto - Osaka cho người đi lần đầu',
'Gợi ý lịch trình du lịch Nhật Bản 7 ngày qua Tokyo, Kyoto và Osaka, kèm kinh nghiệm di chuyển và sắp xếp điểm tham quan.',
'Kinh nghiệm Nhật Bản','Tokyo',true,now() - interval '4 days',now()
),
(
'Kinh nghiệm du lịch Thái Lan 5 ngày: Bangkok và những trải nghiệm nên thử',
'kinh-nghiem-du-lich-thai-lan-5-ngay',
'Lịch trình Thái Lan 5 ngày kết hợp Bangkok và các trải nghiệm ẩm thực, mua sắm, văn hóa dễ đi cho người Việt.',
'<h2>Vì sao Thái Lan phù hợp cho chuyến đi ngắn?</h2><p>Thái Lan có nhiều chuyến bay thuận tiện từ Việt Nam, đồ ăn phong phú và hệ thống dịch vụ du lịch phát triển. Bangkok là lựa chọn dễ bắt đầu cho chuyến đi 4-5 ngày.</p><h2>Lịch trình 5 ngày gợi ý</h2><h3>Ngày 1</h3><p>Nhận phòng, tham quan khu trung tâm và thưởng thức ẩm thực địa phương.</p><h3>Ngày 2</h3><p>Tham quan Grand Palace, Wat Pho và Wat Arun, sau đó khám phá khu phố ven sông.</p><h3>Ngày 3</h3><p>Dành thời gian cho mua sắm tại các trung tâm thương mại hoặc chợ phù hợp với lịch trình.</p><h3>Ngày 4</h3><p>Có thể chọn một chuyến đi trong ngày tới Ayutthaya hoặc một điểm vui chơi phù hợp.</p><h3>Ngày 5</h3><p>Mua quà, ăn uống và trở về theo lịch bay.</p><h2>Mẹo cho chuyến đi</h2><ul><li>Chọn khách sạn gần BTS/MRT nếu ưu tiên di chuyển thuận tiện.</li><li>Không nên xếp quá nhiều điểm ngoài trời vào giữa trưa.</li><li>Luôn kiểm tra giờ mở cửa và quy định trang phục tại các điểm tham quan tôn giáo.</li></ul>',
null,
'Du lịch Thái Lan 5 ngày: Lịch trình Bangkok và kinh nghiệm hữu ích',
'Kinh nghiệm du lịch Thái Lan 5 ngày: lịch trình Bangkok, điểm tham quan, ăn uống, mua sắm và mẹo chuẩn bị chuyến đi.',
'Kinh nghiệm Thái Lan','Bangkok',true,now() - interval '3 days',now()
),
(
'Du lịch Singapore 4 ngày 3 đêm: lịch trình gọn và dễ đi',
'du-lich-singapore-4-ngay-3-dem',
'Gợi ý lịch trình Singapore 4 ngày 3 đêm cho người đi lần đầu, ưu tiên các điểm nổi bật và giao thông công cộng.',
'<h2>Singapore 4 ngày 3 đêm có đủ không?</h2><p>Singapore có diện tích nhỏ và giao thông công cộng thuận tiện nên 4 ngày 3 đêm đủ để trải nghiệm những khu vực nổi tiếng nếu sắp xếp hợp lý.</p><h2>Lịch trình tham khảo</h2><h3>Ngày 1 - Marina Bay</h3><p>Khám phá Merlion, Marina Bay Sands, Gardens by the Bay và khu vực ven vịnh.</p><h3>Ngày 2 - Sentosa</h3><p>Dành cả ngày cho Sentosa, lựa chọn hoạt động theo sở thích và thời tiết.</p><h3>Ngày 3 - Chinatown và Little India</h3><p>Khám phá văn hóa, kiến trúc và ẩm thực tại các khu phố đặc trưng.</p><h3>Ngày 4 - Mua sắm và trở về</h3><p>Dành thời gian cho Orchard Road hoặc một khu mua sắm gần khách sạn trước khi ra sân bay.</p><h2>Mẹo tiết kiệm</h2><p>Ưu tiên MRT và xe buýt, chọn khách sạn gần ga, đặt trước các hoạt động cần vé và chuẩn bị lịch trình theo từng khu vực.</p>',
null,
'Du lịch Singapore 4 ngày 3 đêm: Lịch trình và kinh nghiệm',
'Kinh nghiệm du lịch Singapore 4 ngày 3 đêm: lịch trình Marina Bay, Sentosa, Chinatown, Little India và mẹo di chuyển.',
'Kinh nghiệm Singapore','Singapore',true,now() - interval '2 days',now()
),
(
'Kinh nghiệm du lịch Sapa 3 ngày 2 đêm: lịch trình cho người đi lần đầu',
'kinh-nghiem-du-lich-sapa-3-ngay-2-dem',
'Lịch trình Sapa 3 ngày 2 đêm kết hợp bản làng, núi Hàm Rồng, Fansipan và những trải nghiệm đặc trưng vùng Tây Bắc.',
'<h2>Sapa 3 ngày 2 đêm nên đi đâu?</h2><p>Với 3 ngày 2 đêm, bạn có thể kết hợp trung tâm Sapa, Fansipan và một bản làng để có cả trải nghiệm thiên nhiên lẫn văn hóa.</p><h2>Lịch trình gợi ý</h2><h3>Ngày 1 - Trung tâm Sapa</h3><p>Nhận phòng, khám phá nhà thờ đá, quảng trường và các khu phố trung tâm. Buổi tối thưởng thức món ăn vùng cao.</p><h3>Ngày 2 - Fansipan và bản làng</h3><p>Buổi sáng dành cho Fansipan. Buổi chiều có thể chọn bản Cát Cát hoặc một điểm phù hợp với thời tiết.</p><h3>Ngày 3 - Thư giãn và trở về</h3><p>Dành buổi sáng cho cafe, mua đặc sản và trả phòng. Nên tính dư thời gian cho việc di chuyển về Hà Nội.</p><h2>Đi Sapa mùa nào đẹp?</h2><p>Mỗi mùa có một nét riêng. Mùa xuân nổi bật với hoa, mùa hè có khí hậu dễ chịu hơn đồng bằng, mùa thu thường được yêu thích bởi cảnh ruộng bậc thang và mùa đông phù hợp với người muốn trải nghiệm không khí lạnh.</p><p>Trước chuyến đi, nên xem dự báo thời tiết và chuẩn bị giày có độ bám tốt vì nhiều điểm tham quan có đường dốc hoặc bậc đá.</p>',
null,
'Du lịch Sapa 3 ngày 2 đêm: Lịch trình và kinh nghiệm đầy đủ',
'Kinh nghiệm du lịch Sapa 3 ngày 2 đêm: lịch trình Fansipan, bản Cát Cát, thời điểm nên đi và mẹo chuẩn bị.',
'Kinh nghiệm Sapa','Sapa',true,now() - interval '1 day',now()
),
(
'Seoul mùa nào đẹp? Gợi ý thời điểm du lịch Hàn Quốc theo mùa',
'seoul-mua-nao-dep',
'Khám phá Seoul theo bốn mùa và chọn thời điểm phù hợp nếu bạn thích hoa, lá vàng, tuyết hoặc thời tiết dễ chịu.',
'<h2>Mùa xuân ở Seoul</h2><p>Mùa xuân thường được yêu thích bởi hoa và không khí trong lành. Đây là thời điểm phù hợp cho lịch trình tham quan ngoài trời và chụp ảnh.</p><h2>Mùa hè</h2><p>Mùa hè có nhiều hoạt động và ngày dài, nhưng nên chuẩn bị cho thời tiết nóng và những ngày mưa.</p><h2>Mùa thu</h2><p>Mùa thu là lựa chọn nổi bật cho người thích lá vàng, thời tiết mát và các hoạt động đi bộ trong thành phố.</p><h2>Mùa đông</h2><p>Mùa đông phù hợp với người muốn trải nghiệm không khí lạnh và tuyết. Hãy chuẩn bị quần áo giữ nhiệt, giày chống trơn và kiểm tra dự báo thời tiết trước khi đi.</p><h2>Nên chọn mùa nào?</h2><p>Nếu ưu tiên thời tiết dễ chịu, mùa xuân và mùa thu thường là lựa chọn dễ cân bằng. Nếu mục tiêu là tuyết hoặc trải nghiệm mùa đông, hãy chuẩn bị kỹ hơn và dành thời gian linh hoạt cho thời tiết.</p>',
null,
'Seoul mùa nào đẹp? Kinh nghiệm du lịch Seoul theo 4 mùa',
'Seoul mùa nào đẹp nhất? So sánh mùa xuân, hè, thu, đông và gợi ý thời điểm du lịch Seoul theo sở thích.',
'Kinh nghiệm Hàn Quốc','Seoul',true,now(),now()
)
on conflict (slug) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    content = excluded.content,
    cover_image = excluded.cover_image,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    category = excluded.category,
    destination = excluded.destination,
    published = excluded.published,
    published_at = excluded.published_at,
    updated_at = now();
