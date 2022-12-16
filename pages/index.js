import Head from 'next/head'
import { connectToDatabase } from '../util/mongodb'

export default function Home({ properties }) {

  console.log(properties);

  var path = "https://g2layer-4sknz.ondigitalocean.app/" + properties;

  console.log(path);


  return (
    <div>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <img src= {path}/>
      </div>

    </div>
  )
}

export async function getServerSideProps() {
  const { db } = await connectToDatabase();

  const results = await fetch ('https://g2layer-4sknz.ondigitalocean.app/api/staticoverlay');

  const streamers = await db.collection('streamers').find({}).toArray();
  const staticOverlays = await db.collection('staticoverlays').find({}).toArray();
  const staticArts = await db.collection('staticarts').find({}).toArray();

  var file = "";

  for (const staticOverlay of staticOverlays) {
    if (staticOverlay.on.streamer == "RRocha21") {
      for (const staticArt of staticArts) {
        for (const staticOverlay_art of staticOverlay.on.art) {
          if (staticArt.ArtName == staticOverlay_art) {
            // console.log(staticArt.file.path);
            var file = staticArt.file.path;
          }
        }
      }
    }
  }

  const properties = JSON.parse(JSON.stringify(file));

  return {
    props: { properties: properties },
  };
}
