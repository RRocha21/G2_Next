import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'
import styled from 'styled-components'

export default function Home({properties }) {

  if (properties != undefined) {

    properties = [...properties].sort((a, b) => parseFloat(b.css.zindex) - parseFloat(a.css.zindex));
  }

  if (properties != undefined) {
    return (
      <div>
        <Head>
          <title>Home</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div>
          {properties.map((property) => (
            <div>
              <img src= {"https://g2layer-4sknz.ondigitalocean.app/" + property.file.path} style={{position: "absolute", left: property.css.left + "px", top: property.css.top + "px", zIndex: property.css.zindex}}/>
              <video src= {"https://g2layer-4sknz.ondigitalocean.app/" + property.file.path} style={{position: "absolute", left: property.css.left + "px", top: property.css.top + "px", zIndex: property.css.zindex}} autoPlay loop muted/>
            </div>
          ))}
          
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

    console.log(params)
    const data = await db.collection("streamers").find({twitch_id: params.streamerid}).toArray();

    const streamers = await db.collection('streamers').find({}).toArray();
    const staticOverlays = await db.collection('staticoverlays').find({}).toArray();
    const staticArts = await db.collection('staticarts').find({}).toArray();
  
    var file = [];
    for (const staticOverlay of staticOverlays) {
      for (const staticOverlay_on_streamer of staticOverlay.on.streamer) {
        if (staticOverlay_on_streamer == params.streamerid) {
            if (staticOverlay.OverlayName == params.overlayid) {
              for (const staticArt of staticArts) {
                for (const staticOverlay_art of staticOverlay.on.art) {
                  if (staticArt.ArtName == staticOverlay_art) {
                    file.push(staticArt);
                  }
                }
              }
            }
          
        }
      }
    }

    // console.log(file);

    const properties = JSON.parse(JSON.stringify(file));

    return {
        props: {properties: properties },
        revalidate: 1
    };
}