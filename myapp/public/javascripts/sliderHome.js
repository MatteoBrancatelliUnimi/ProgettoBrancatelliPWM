$(document).ready(()=>{
    $('.slider').slick({
        dots: true,
        infinite: false,
        speed: 700,
        slidesToShow: 8, 
        slidesToScroll: 8,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            }
        ]
    });
});