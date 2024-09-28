'use client';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export default function BookCarousel() {
	return (
		<Carousel
			className="mb-8"
			opts={{ loop: true }}
			plugins={[Autoplay({ delay: 5000 })]}
		>
			<CarouselContent>
				<CarouselItem className="md:basis-1/2 lg:basis-1/3">
					<img
						src="https://ui.shadcn.com/placeholder.svg?height=400&width=1000&text=Promotion+1"
						alt="Promotion 1"
						className="w-full rounded-lg"
					/>
				</CarouselItem>
				<CarouselItem className="md:basis-1/2 lg:basis-1/3">
					<img
						src="https://ui.shadcn.com/placeholder.svg?height=400&width=1000&text=Promotion+2"
						alt="Promotion 2"
						className="w-full rounded-lg"
					/>
				</CarouselItem>
				<CarouselItem className="md:basis-1/2 lg:basis-1/3">
					<img
						src="https://ui.shadcn.com/placeholder.svg?height=400&width=1000&text=Promotion+3"
						alt="Promotion 3"
						className="w-full rounded-lg"
					/>
				</CarouselItem>
				<CarouselItem className="md:basis-1/2 lg:basis-1/3">
					<img
						src="https://ui.shadcn.com/placeholder.svg?height=400&width=1000&text=New+Release+1"
						alt="New Release 1"
						className="w-full rounded-lg"
					/>
				</CarouselItem>
				<CarouselItem className="md:basis-1/2 lg:basis-1/3">
					<img
						src="https://ui.shadcn.com/placeholder.svg?height=400&width=1000&text=Best+Seller+1"
						alt="Best Seller 1"
						className="w-full rounded-lg"
					/>
				</CarouselItem>
				<CarouselItem className="md:basis-1/2 lg:basis-1/3">
					<img
						src="https://ui.shadcn.com/placeholder.svg?height=400&width=1000&text=Special+Offer"
						alt="Special Offer"
						className="w-full rounded-lg"
					/>
				</CarouselItem>
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
