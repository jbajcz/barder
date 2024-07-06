import Link from "next/link";
import { FaPlay, FaRotate } from "react-icons/fa6";
import Image from "next/image";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-[#1a1a1a] text-white">
      <Header />
      <main className="flex-1">
        <section className="w-full pt-12 md:pt-24 lg:pt-32 border-y border-[#333]">
          <div className="px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
              <div>
                <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-[#8b5cf6]">
                  Unlock a World of Possibilities with Barder
                </h1>
                <p className="mx-auto max-w-[700px] text-[#b3b3b3] md:text-xl py-2">
                  Experience the thrill of trading in our unique bartering game
                </p>
                <p className="mx-auto max-w-[700px] text-[#b3b3b3] md:text-xl">
                  Level up and show off your trading skills against our
                  intelligent AI models
                </p>
                <div className="space-x-4 mt-6">
                  <Link
                    href="/play"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-[#19b351] px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[#7e44f6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Start Playing <FaPlay className="ml-2" />
                  </Link>
                </div>
              </div>
              <img
                src="https://img.freepik.com/premium-vector/png-files-transparent-vector-background-png-background_302321-1276.jpg?w=400"
                width="500"
                height="500"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-bottom sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6">
        <p className="text-xs text-[#b3b3b3]">Barder © 2024</p>
      </footer>
    </div>
  );
}
