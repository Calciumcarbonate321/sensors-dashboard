import LiveDataFeed from "@/components/live-feed";

export default function Home() {
  return (
    <>
    <LiveDataFeed id="hehe" />
    <LiveDataFeed id="nothehe"/>
    </>
  )
}

export const dynamic ='force-dynamic';