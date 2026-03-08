import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <Image
        src="/Landing (1).png"
        alt="Inner State OS"
        fill
        priority
        style={{ objectFit: "cover", objectPosition: "top" }}
      />
    </div>
  );
}
