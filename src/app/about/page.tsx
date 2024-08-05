import Header from "@/components/Header";

export default function About() {
  return (
    <div className="flex flex-col min-h-dvh bg-[#1a1a1a] text-white">
      <Header />
        <h1 className="mt-16 text-3xl font-bold mb-20 text-purple-600 text-center">About the Game</h1>
        <p className="mb-16 text-center">
          Welcome to our bartering game! This game is all about trading and making strategic decisions to maximize your profits. Start with an item, negotiate with various traders, and try to work your way up to the best possible deal.
        </p>
        <p className="mb-16 text-center">
          Each trader has their own unique items and prices. You will need to assess their mood and their personality to make the best trade possible. Keep an eye on your attempts and manage your trades wisely to avoid failure.
        </p>
        <p className="mb-16 text-center">
          As you progress, the stakes get higher, and the challenges become tougher. Are you ready to become the ultimate trader?
        </p>
        <p className="mb-16 text-center">
          Good luck, and happy trading!
        </p>
    </div>
  );
}
