import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'

export default function Home({ properties, properties_type }) {

  console.log(properties);

  var path = "https://g2layer-4sknz.ondigitalocean.app/" + properties;


  if (properties_type == "image") {

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
  } else if (properties_type == "video") {
    return (
      <div>
        <Head>
          <title>Home</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div>
          <video controls>
            <source src={path} type="video/mp4"/>
          </video>
        </div>
      </div>
    )
  }

}

export async function getStaticPaths() {

  
      return { paths: [], fallback: true };

}

export async function getStaticProps({ params }) {
    const { db } = await connectToDatabase();

    const data = await db.collection("streamers").find({twitch_id: params.id}).toArray();

    const streamers = await db.collection('streamers').find({}).toArray();
    const staticOverlays = await db.collection('staticoverlays').find({}).toArray();
    const staticArts = await db.collection('staticarts').find({}).toArray();
  
    var file = "";
    for (const staticOverlay of staticOverlays) {
      if (staticOverlay.on.streamer == params.id) {
        for (const staticArt of staticArts) {
          for (const staticOverlay_art of staticOverlay.on.art) {
            if (staticArt.ArtName == staticOverlay_art) {
              console.log(staticArt.ArtName);
              if(staticArt.ArtName.toLowerCase() == params.streamerid) {
                var file = staticArt.file.path;
                var file_type = staticArt.file.type;
              }
            }
          }
        }
      }
    }

    const properties = JSON.parse(JSON.stringify(file));
    const properties_type = JSON.parse(JSON.stringify(file_type));

    console.log(file)

    return {
        props: { properties: properties, properties_type: properties_type },
        revalidate: 1
    };
}