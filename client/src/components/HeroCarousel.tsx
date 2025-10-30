import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { CarouselItem } from "@shared/schema";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: slides = [], isLoading } = useQuery<CarouselItem[]>({
    queryKey: ["/api/carousel"],
  });

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading || slides.length === 0) {
    return (
      <div className="relative h-[70vh] bg-muted animate-pulse" data-testid="carousel-loading" />
    );
  }

  return (
    <div className="relative h-[70vh] overflow-hidden" data-testid="hero-carousel">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          data-testid={`carousel-slide-${index}`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="max-w-5xl px-6">
              <h1 className="font-serif font-semibold text-5xl md:text-6xl text-white mb-4" data-testid="carousel-title">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8" data-testid="carousel-subtitle">
                {slide.subtitle}
              </p>
              {slide.ctaText && slide.ctaLink && (
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-semibold px-8 shadow-lg"
                  onClick={() => window.location.href = slide.ctaLink!}
                  data-testid="carousel-cta"
                >
                  {slide.ctaText}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur hover:bg-black/40 text-white border-0"
            onClick={prevSlide}
            data-testid="carousel-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur hover:bg-black/40 text-white border-0"
            onClick={nextSlide}
            data-testid="carousel-next"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" data-testid="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => setCurrentSlide(index)}
                data-testid={`carousel-indicator-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
