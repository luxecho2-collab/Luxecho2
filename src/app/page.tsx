import { Hero } from "@/components/home/hero"
import { FeaturedCollections } from "@/components/home/featured-collections"
import { FeaturedProducts } from "@/components/home/featured-products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Hero />
      <FeaturedCollections />
      <FeaturedProducts />

      {/* Newsletter Section: Unified Funky Identity */}
      <section className="py-32 bg-gray-50 border-y border-gray-100 mt-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-black animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Join the movement</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                UNMASK THE <br /> FUTURE
              </h2>
              <p className="text-gray-400 text-lg font-bold uppercase tracking-widest leading-relaxed max-w-md">
                Signup to get exclusive early access to limited edition drops.
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <form className="flex flex-col gap-6">
                <div className="relative">
                  <Input
                    placeholder="ENTER YOUR EMAIL"
                    className="h-20 bg-white border-2 border-gray-100 rounded-none text-black font-bold placeholder:text-gray-300 text-lg px-8 focus-visible:ring-black focus-visible:border-black transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-black" />
                </div>
                <Button className="h-20 px-12 bg-black text-white font-black uppercase tracking-[0.3em] rounded-none text-sm hover:bg-black transition-colors duration-500">
                  Join Community
                </Button>
              </form>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-8 text-center lg:text-left">
                *By joining, you agree to our premium terms and conditions. No spam, just pure heat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
