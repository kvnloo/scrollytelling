"use client";

import { useScroll, useTransform, useMotionValueEvent, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 80;

export default function HeadphoneScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    // Track scroll progress for the animation section only
    const { scrollYProgress } = useScroll({
        target: animationRef,
        offset: ["start start", "end end"],
    });

    // Map scroll progress to frame index
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

    // Canvas opacity - fade out as we exit animation section
    const canvasOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

    // Preload images
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            const paddedIndex = String(i + 1).padStart(4, "0");
            img.src = `/images/frame_${paddedIndex}.webp`;

            img.onload = () => {
                loadedCount++;
                setLoadProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
                if (loadedCount === FRAME_COUNT) {
                    setImagesLoaded(true);
                }
            };
            loadedImages.push(img);
        }
        setImages(loadedImages);
    }, []);

    // Draw to canvas
    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !imagesLoaded || images.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const safeIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(index)));
        const img = images[safeIndex];
        if (!img) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image - "contain" fit
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);

        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        ctx.drawImage(
            img,
            0, 0, img.width, img.height,
            centerShift_x, centerShift_y,
            img.width * ratio, img.height * ratio
        );
    };

    // Update on scroll
    useMotionValueEvent(frameIndex, "change", (latest) => {
        requestAnimationFrame(() => renderFrame(latest));
    });

    // Initial render when loaded
    useEffect(() => {
        if (imagesLoaded) {
            renderFrame(0);
        }
    }, [imagesLoaded]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame(frameIndex.get());
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, [imagesLoaded]);

    return (
        <div ref={containerRef} className="relative bg-[#050505]">
            {/* Animation Section */}
            <div ref={animationRef} className="relative h-[400vh]">
                {/* Fixed Canvas */}
                <motion.div
                    style={{ opacity: canvasOpacity }}
                    className="fixed inset-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#050505]"
                >
                    <canvas ref={canvasRef} className="block" />
                </motion.div>

                {/* Text Overlays */}
                <ScrollOverlay scrollYProgress={scrollYProgress} />
            </div>

            {/* Technical Specs Section */}
            <TechnicalSpecs />

            {/* Loading Overlay */}
            {!imagesLoaded && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    <span className="font-mono text-xs uppercase tracking-widest text-white/50">
                        Loading... {loadProgress}%
                    </span>
                </div>
            )}
        </div>
    );
}

function ScrollOverlay({ scrollYProgress }: { scrollYProgress: any }) {
    const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
    const y1 = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

    const opacity2 = useTransform(scrollYProgress, [0.15, 0.3, 0.45], [0, 1, 0]);
    const x2 = useTransform(scrollYProgress, [0.15, 0.3], [50, 0]);

    const opacity3 = useTransform(scrollYProgress, [0.45, 0.6, 0.75], [0, 1, 0]);
    const x3 = useTransform(scrollYProgress, [0.45, 0.6], [-50, 0]);

    const opacity4 = useTransform(scrollYProgress, [0.75, 0.9, 1], [0, 1, 0]);
    const scale4 = useTransform(scrollYProgress, [0.75, 0.9], [0.8, 1]);

    return (
        <div className="pointer-events-none fixed inset-0 z-10 flex h-full w-full flex-col items-center justify-center p-8">
            {/* Opening Title */}
            <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute text-center max-w-4xl mx-auto">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white/90 mb-4">
                    Zenith X
                </h1>
                <p className="text-xl md:text-2xl text-white/60 font-light tracking-tight">
                    Pure Sound.
                </p>
            </motion.div>

            {/* Precision Engineering */}
            <motion.div
                style={{ opacity: opacity2, x: x2 }}
                className="absolute left-[10%] top-1/2 -translate-y-1/2 md:max-w-sm text-left"
            >
                <h2 className="text-4xl font-semibold tracking-tight text-white/90 mb-2">Precision Engineering</h2>
                <p className="text-white/60 text-lg leading-relaxed tracking-tight">
                    Crafted with aerospace-grade aluminum for uncompromising durability and weightless comfort.
                </p>
            </motion.div>

            {/* Titanium Drivers */}
            <motion.div
                style={{ opacity: opacity3, x: x3 }}
                className="absolute right-[10%] top-1/2 -translate-y-1/2 md:max-w-sm text-right"
            >
                <h2 className="text-4xl font-semibold tracking-tight text-white/90 mb-2">Titanium Drivers</h2>
                <p className="text-white/60 text-lg leading-relaxed tracking-tight">
                    40mm custom-tuned drivers deliver crystal clear highs and deep, resonant bass.
                </p>
            </motion.div>

            {/* CTA */}
            <motion.div
                style={{ opacity: opacity4, scale: scale4 }}
                className="absolute text-center"
            >
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white/90 mb-8">
                    Hear Everything.
                </h2>
                <button className="pointer-events-auto rounded-full bg-white px-8 py-4 text-black font-semibold tracking-tight hover:bg-neutral-200 transition-colors">
                    Pre-order Now
                </button>
            </motion.div>
        </div>
    );
}

function TechnicalSpecs() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "start center"],
    });

    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const y = useTransform(scrollYProgress, [0, 1], [100, 0]);

    const specs = [
        { label: "Driver Size", value: "40mm" },
        { label: "Frequency Response", value: "5Hz - 40kHz" },
        { label: "Impedance", value: "32Ω" },
        { label: "Sensitivity", value: "108dB" },
        { label: "Weight", value: "245g" },
        { label: "Battery Life", value: "60 hours" },
        { label: "Charging", value: "USB-C Fast Charge" },
        { label: "Bluetooth", value: "5.3 with aptX Lossless" },
    ];

    return (
        <motion.section
            ref={sectionRef}
            style={{ opacity, y }}
            className="relative z-20 min-h-screen bg-[#050505] py-32 px-8"
        >
            <div className="max-w-5xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white/90 mb-4 text-center">
                    Technical Specifications
                </h2>
                <p className="text-white/60 text-lg tracking-tight text-center mb-16 max-w-2xl mx-auto">
                    Every detail engineered for audiophile-grade performance.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                    {specs.map((spec, index) => (
                        <div
                            key={spec.label}
                            className="flex justify-between items-baseline border-b border-white/10 pb-4"
                        >
                            <span className="text-white/60 tracking-tight">{spec.label}</span>
                            <span className="text-white/90 font-medium tracking-tight text-lg">{spec.value}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <p className="text-white/40 text-sm tracking-tight mb-8">
                        Available in Matte Black, Silver, and Midnight Blue
                    </p>
                    <button className="rounded-full border border-white/20 px-8 py-4 text-white/90 font-medium tracking-tight hover:bg-white/5 transition-colors">
                        View Full Specifications
                    </button>
                </div>
            </div>
        </motion.section>
    );
}
