"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type HomeBannerItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  href?: string | null;
};

type HomeBannerSliderProps = {
  banners: HomeBannerItem[];
  className?: string;
  fitHeight?: boolean;
};

export function HomeBannerSlider({
  banners,
  className,
  fitHeight = false,
}: HomeBannerSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragEndX, setDragEndX] = useState<number | null>(null);

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const hasBanner = banners.length > 0;
  const canSlide = banners.length > 1;

  const heightClass = fitHeight
    ? "h-[240px] sm:h-[280px] md:h-[320px] lg:h-full lg:min-h-[300px]"
    : "h-[240px] sm:h-[300px] md:h-[360px] lg:h-[420px]";

  const safeActiveIndex = useMemo(() => {
    if (!hasBanner) return 0;

    return Math.min(activeIndex, banners.length - 1);
  }, [activeIndex, banners.length, hasBanner]);

  useEffect(() => {
    if (!canSlide) return;

    const interval = window.setInterval(() => {
      goNext();
    }, 4500);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSlide, banners.length]);

  useEffect(() => {
    if (activeIndex !== safeActiveIndex) {
      setActiveIndex(safeActiveIndex);
    }
  }, [activeIndex, safeActiveIndex]);

  function goPrev() {
    setActiveIndex((current) =>
      current === 0 ? banners.length - 1 : current - 1
    );
  }

  function goNext() {
    setActiveIndex((current) =>
      current === banners.length - 1 ? 0 : current + 1
    );
  }

  function handleSwipeEnd() {
    if (dragStartX === null || dragEndX === null) return;

    const distance = dragStartX - dragEndX;
    const minimumSwipeDistance = 50;

    if (Math.abs(distance) < minimumSwipeDistance) {
      setDragStartX(null);
      setDragEndX(null);
      return;
    }

    if (distance > 0) {
      goNext();
    } else {
      goPrev();
    }

    setDragStartX(null);
    setDragEndX(null);
  }

  if (!hasBanner) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[2rem] border border-white/10 bg-card p-6 shadow-soft",
          heightClass,
          className
        )}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(32,214,181,.18),rgba(255,255,255,.04))]" />

        <div className="relative z-10 flex h-full flex-col justify-end">
          <p className="text-sm font-black uppercase tracking-widest text-primary">
            PLACEHOLDER BANNER HOME
          </p>

          <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Banner Home
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-white/75 md:text-base">
            Gambar banner bisa ditambahkan dari Admin Panel → Web Setting →
            Change Banner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sliderRef}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-soft",
        heightClass,
        className
      )}
      onTouchStart={(event) => {
        setDragStartX(event.touches[0].clientX);
        setDragEndX(null);
      }}
      onTouchMove={(event) => {
        setDragEndX(event.touches[0].clientX);
      }}
      onTouchEnd={handleSwipeEnd}
      onMouseDown={(event) => {
        setDragStartX(event.clientX);
        setDragEndX(null);
      }}
      onMouseMove={(event) => {
        if (dragStartX !== null) {
          setDragEndX(event.clientX);
        }
      }}
      onMouseUp={handleSwipeEnd}
      onMouseLeave={handleSwipeEnd}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
        }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative h-full w-full shrink-0 select-none"
          >
            {banner.href ? (
              <a
                href={banner.href}
                className="absolute inset-0 z-10"
                aria-label={banner.title}
              />
            ) : null}

            {banner.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.imageUrl}
                alt={banner.title}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(32,214,181,.18),rgba(255,255,255,.04))]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 to-transparent" />

            <div className="relative z-20 flex h-full flex-col justify-end p-6 pb-12 md:p-8 md:pb-14">
              <p className="text-sm font-black uppercase tracking-widest text-primary">
                {banner.title}
              </p>

              {banner.subtitle && (
                <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {canSlide && (
        <>
          <button
            type="button"
            aria-label="Slide sebelumnya"
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-100 backdrop-blur transition hover:bg-black/70 md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Slide berikutnya"
            onClick={goNext}
            className="absolute right-4 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-100 backdrop-blur transition hover:bg-black/70 md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Pilih banner ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={
                  index === activeIndex
                    ? "h-2.5 w-7 rounded-full bg-primary transition-all"
                    : "h-2.5 w-2.5 rounded-full bg-white/60 transition-all hover:bg-white"
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}