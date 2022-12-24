import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'
import styled from 'styled-components'
import Image from 'next/image'

export default function Home({properties, sponsor_props, overlay_props}) {

  if (properties != undefined) {
      properties = [...properties].sort((a, b) => parseFloat(b.css.zindex) - parseFloat(a.css.zindex));
  }
  var width = 0;
  var height = 0;
  var left = 0;
  var top = 0;
  var sponsor_sizes = 0;
  var start_left = 0;

  var new_sponsor_props = [];

  if (sponsor_props != undefined) {
    sponsor_props = [...sponsor_props].sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
    if (overlay_props != undefined) {
      width = overlay_props.sponsor_container.size.width;
      height = overlay_props.sponsor_container.size.height;
      left = overlay_props.sponsor_container.position.left;
      top = overlay_props.sponsor_container.position.top;
      sponsor_sizes = (overlay_props.sponsor_container.size.width / sponsor_props.length) - 10;
      sponsor_sizes = sponsor_sizes.toString();
      console.log(sponsor_sizes);
    }
    for (var i = 0; i < sponsor_props.length; i++) {
      var file_black_path = sponsor_props[i].file.black.path;
      var file_white_path = sponsor_props[i].file.white.path;
      if (i == 0) {
        start_left = 0;
      } else {
        start_left = start_left + parseInt(sponsor_sizes);
      }
      for (var j = 10000; j>0; j--) {
        var value = j / 10000;
        if (sponsor_props[i].file.black.size.width * value < parseInt(sponsor_sizes)) {
          if (sponsor_props[i].file.black.size.height * value <= height) {
            var file_black_size_width = value * sponsor_props[i].file.black.size.width;
            var file_black_size_height = value * sponsor_props[i].file.black.size.height;
            break;
          }
        }
      }
      for (var j = 10000; j>0; j--) {
        var value = j / 10000;
        if (sponsor_props[i].file.white.size.width * value < parseInt(sponsor_sizes)) {
          if (sponsor_props[i].file.white.size.height * value <= height) {
            var file_white_size_width = value * sponsor_props[i].file.white.size.width;
            var file_white_size_height = value * sponsor_props[i].file.white.size.height;
            break;
          }
        }
      }
        var new_set = {
        file: {
          black: {
            path: file_black_path,
            size: {
              width: file_black_size_width,
              height: file_black_size_height,
              top: (height - file_black_size_height) / 2,
            }
          },
          white: {
            path: file_white_path,
            size: {
              width: file_white_size_width,
              height: file_white_size_height,
              top: (height - file_white_size_height) / 2,
            }
          }
        },
        order: sponsor_props[i].order,
        css: {
          left: start_left,
          top: top,
          zindex: 500
        }
      }
      // console.log(start_left);
      new_sponsor_props.push(new_set);
    }
  }

  if (new_sponsor_props != undefined) {
    var total_width = 0;
    for (var i = 0; i < new_sponsor_props.length; i++) {
      total_width += new_sponsor_props[i].file.white.size.width;
    }
    console.log(total_width)
    var setWidth = (((width) - total_width) / 2 ) - (10 * (new_sponsor_props.length -1))/2;
    console.log(setWidth);
    for (var i = 0; i < new_sponsor_props.length; i++) {
      new_sponsor_props[i].css.left = setWidth;
      setWidth += new_sponsor_props[i].file.white.size.width + 10;
    }
  }


  if (properties != undefined) {
    return (
      <div>
        <Head>
          <title>Home</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div>
          <div style={{position: "absolute", left: left + "px", top: top + "px", width: width + "px", height: height + "px", background: "#FFA07A", zIndex: "450"}}>
          {new_sponsor_props.map((new_sponsor_prop) => ( 
              <div style={{position: "absolute", left: new_sponsor_prop.css.left + "px", top: "0px", width: new_sponsor_prop.file.white.size.width + "px", height: height + "px"}}>
                <img src= {"https://g2layer-4sknz.ondigitalocean.app/" + new_sponsor_prop.file.white.path} style={{ alignSelf: "center", position: "absolute", left: "0px", top: new_sponsor_prop.file.white.size.top + "px", width: new_sponsor_prop.file.white.size.width + "px", height: new_sponsor_prop.file.white.size.height + "px", zIndex:"500"}}/>
              </div>
          ))}
          </div>
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

    const data = await db.collection("streamers").find({twitch_id: params.streamerid}).toArray();

    const streamers = await db.collection('streamers').find({}).toArray();
    const staticOverlays = await db.collection('staticoverlays').find({}).toArray();
    const staticArts = await db.collection('staticarts').find({}).toArray();
    const groups = await db.collection('groups').find({}).toArray();
    const sponsors = await db.collection('sponsors').find({}).toArray();

    var file = [];
    var sponsor_array = [];
  
    for (const streamer of streamers) {
      if (streamer.twitch_id == params.streamerid) {
        for (const group of groups) {
          if (streamer.group == group.name) {
            for (const sponsor of sponsors) {
              for (const group_sponsor of group.sponsors) {
                if (sponsor.name == group_sponsor) {
                  sponsor_array.push(sponsor);
                }
              }
            }
          }
        }
      }
    }

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

    var overlay_array = [];
    for (const staticOverlay of staticOverlays) {
      if (staticOverlay.OverlayName == params.overlayid) {
        overlay_array = staticOverlay;
      }
    }

    // console.log(file);
    const overlay_props = JSON.parse(JSON.stringify(overlay_array));
    const sponsor_props = JSON.parse(JSON.stringify(sponsor_array));
    const properties = JSON.parse(JSON.stringify(file));

    return {
        props: {properties: properties, sponsor_props: sponsor_props, overlay_props: overlay_props },
        revalidate: 1
    };
}