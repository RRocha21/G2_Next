import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'
import styled from 'styled-components'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:3002');

export default function Home({arts_props, sponsor_props, group_props, overlay_props, streamerId, overlayId}) {
  const [count, setCount] = useState(0);
  const [staticOverlays, setStaticOverlays] = useState(overlay_props);
  const [staticArts, setStaticArts] = useState(arts_props);
  const [sponsors, setSponsors] = useState(sponsor_props);
  const [groups, setGroups] = useState(group_props);
  const [firstLoad , setfirstLoad] = useState(false);

  console.log(overlay_props);
  console.log(arts_props);

  socket.connect();
  useEffect(() => {
    setTimeout(() => {
      if (firstLoad == false) {
        setStaticOverlays(overlay_props);
        setSponsors(sponsor_props);
        setStaticArts(arts_props);
        setGroups(group_props);
        setfirstLoad(true);
      }
    }, 2500);
  }, [overlay_props, staticOverlays, firstLoad, sponsor_props, sponsors, staticArts, arts_props, groups, group_props]);


  useEffect(() => {
      socket.on('Overlays_changeOverlay', (data) => {
        let data1 = data.result;
        let data2 = data.result2;

        let new_staticArts_array = [];
        for (var i = 0; i < data1.length; i++) {
          if (data1[i].on.streamer.includes(streamerId)) {
            if (data1[i].OverlayName == overlayId) {
              setStaticOverlays(data1[i]);
              for (var j = 0; j < data2.length; j++) {
                for (var z = 0; z < data1[i].on.art.length; z++) {
                  if (data2[j].ArtName == data1[i].on.art[z]) {
                    new_staticArts_array.push(data2[j]);
                  }
                }
              }
            }
          }
        }
        setStaticArts(new_staticArts_array);
      });

      socket.on('Overlays_changeStreamer', (data) => {
        let data1 = data.result;
        let data2 = data.result2;
        let data3 = data.result3;

        let new_sponsors_array = [];
        for (var i = 0; i < data1.length; i++) {
          if (data1[i].twitch_id == streamerId) {
            for (var j = 0; j < data2.length; j++) {
              if (data2[j].name == data1[i].group) {
                setGroups(data2[j]);
                for (var z = 0; z < data2[j].sponsors.length; z++) {
                  for (var x = 0; x < data3.length; x++) {
                    if (data2[j].sponsors[z] == data3[x].name) {
                      new_sponsors_array.push(data3[x]);
                    }
                  }
                }
              }
            }
          }
        }
        setSponsors(new_sponsors_array);
      });

      socket.on('Overlays_changeStaticArt', (data) => {
        let data1 = data.result;
        let data2 = data.result2;

        let new_staticArts_array = [];
        for (var i = 0; i < data1.length; i++) {
          if (data1[i].OverlayName == overlayId) {
            for (var z = 0; z < data1[i].on.art.length; z++) {
              for (var j = 0; j < data2.length; j++) {
                if (data2[j].ArtName == data1[i].on.art[z]) {
                  new_staticArts_array.push(data2[j]);
                }
              }
            }
          }
        }
        setStaticArts(new_staticArts_array);
      });

  }, [overlayId, streamerId, staticOverlays, staticArts, sponsors, groups]);

  let new_staticArts = [];

  if (staticArts != undefined) {
      new_staticArts = [...staticArts].sort((a, b) => parseFloat(b.css.zindex) - parseFloat(a.css.zindex));
  }
  var width = 0;
  var height = 0;
  var left = 0;
  var top = 0;
  var sponsor_sizes = 0;
  var start_left = 0;

  var new_sponsor_props = [];
  var slide_sponsor_props = [];

  if (sponsors != undefined) {
    let new_sponsors = [...sponsors].sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
    if (staticOverlays != undefined) {
      width = staticOverlays.sponsor_container.size.width;
      height = staticOverlays.sponsor_container.size.height;
      left = staticOverlays.sponsor_container.position.left;
      top = staticOverlays.sponsor_container.position.top;
      
      if(staticOverlays.sponsor_container.slideshow.status == false) {
        sponsor_sizes = (staticOverlays.sponsor_container.size.width / new_sponsors.length) - 10;
        sponsor_sizes = sponsor_sizes.toString();
        for (var i = 0; i < new_sponsors.length; i++) {
          if (i == 0) {
            start_left = 0;
          } else {
            start_left = start_left + parseInt(sponsor_sizes);
          }
          if (staticOverlays.sponsor_container.color) {
            for (var j = 10000; j>0; j--) {
              var value = j / 10000;
              if (new_sponsors[i].file.white.size.width * value < parseInt(sponsor_sizes)) {
                if (new_sponsors[i].file.white.size.height * value <= height) {
                  var file_path = new_sponsors[i].file.white.path;
                  var file_size_width = value * new_sponsors[i].file.white.size.width;
                  var file_size_height = value * new_sponsors[i].file.white.size.height;
                  break;
                }
              }
            }
          } else {
            for (var j = 10000; j>0; j--) {
              var value = j / 10000;
              if (new_sponsors[i].file.black.size.width * value < parseInt(sponsor_sizes)) {
                if (new_sponsors[i].file.black.size.height * value <= height) {
                  var file_path = new_sponsors[i].file.black.path;
                  var file_size_width = value * new_sponsors[i].file.black.size.width;
                  var file_size_height = value * new_sponsors[i].file.black.size.height;
                  break;
                }
              }
            }
          }
            var new_set = {
            file: {
              path: file_path,
              size: {
                width: file_size_width,
                height: file_size_height,
                top: (height - file_size_height) / 2,
              }
            },
            order: new_sponsors[i].order,
            css: {
              left: start_left,
              top: top,
              zindex: 500
            }
          }
          new_sponsor_props.push(new_set);
        }
        var total_width = 0;
        for (var i = 0; i < new_sponsor_props.length; i++) {
          total_width += new_sponsor_props[i].file.size.width;
        }
        var setWidth = (((width) - total_width) / 2 ) - (10 * (new_sponsor_props.length -1))/2;
        for (var i = 0; i < new_sponsor_props.length; i++) {
          new_sponsor_props[i].css.left = setWidth;
          setWidth += new_sponsor_props[i].file.size.width + 10;
        }
      } else {
        sponsor_sizes = staticOverlays.sponsor_container.size.width - 20;
        sponsor_sizes = sponsor_sizes.toString();
        for (var i = 0; i < new_sponsors.length; i++) {
          if (i == 0) {
            start_left = 0;
          } else {
            start_left = start_left + parseInt(sponsor_sizes);
          }
          if (staticOverlays.sponsor_container.color) {
            for (var j = 10000; j>0; j--) {
              var value = j / 10000;
              if (new_sponsors[i].file.white.size.width * value < parseInt(sponsor_sizes)) {
                if (new_sponsors[i].file.white.size.height * value <= height) {
                  var file_path = new_sponsors[i].file.white.path;
                  var file_size_width = value * new_sponsors[i].file.white.size.width;
                  var file_size_height = value * new_sponsors[i].file.white.size.height;
                  break;
                }
              }
            }
          } else {
            for (var j = 10000; j>0; j--) {
              var value = j / 10000;
              if (new_sponsors[i].file.black.size.width * value < parseInt(sponsor_sizes)) {
                if (new_sponsors[i].file.black.size.height * value <= height) {
                  var file_path = new_sponsors[i].file.black.path;
                  var file_size_width = value * new_sponsors[i].file.black.size.width;
                  var file_size_height = value * new_sponsors[i].file.black.size.height;
                  break;
                }
              }
            }
          }
            var new_set = {
            file: {
              path: file_path,
              size: {
                width: file_size_width,
                height: file_size_height,
                top: (height - file_size_height) / 2,
              }
            },
            order: new_sponsors[i].order,
            css: {
              left: start_left,
              top: top,
              zindex: 500
            }
          }
          slide_sponsor_props.push(new_set);
        }
        var total_width = 0;


        var setWidth = width;

        // new_sponsor_props = [];
        // new_sponsor_props.push(slide_sponsor_props[count]);
        // new_sponsor_props[0].css.left = (width - new_sponsor_props[0].file.size.width) / 2;
      }
    } 
  }

  useEffect(() => {
    if (staticOverlays != undefined) {
      if(staticOverlays.sponsor_container.slideshow.status == true) {
        const interval = setInterval(() => {
          setCount(count => count + 1);
          if (count >= slide_sponsor_props.length -1 ) {
            setCount(0);
          }
          console.log("terst1");
        }, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [count, staticOverlays]);

  if (new_staticArts != undefined) {
    return (
      <div>
        <Head>
          <title>Home</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div key = "4">
          <div style={{position: "absolute", left: left + "px", top: top + "px", width: width + "px", height: height + "px", background: "#FFA07A", zIndex: "450"}} key = "3">
          {new_sponsor_props.map((new_sponsor_prop) => ( 
              <div style={{position: "absolute", left: new_sponsor_prop.css.left + "px", top: "0px", width: new_sponsor_prop.file.size.width + "px", height: height + "px"}} key="1">
                {new_sponsor_prop.file.path != undefined ? ( <img src= {"https://g2layer-4sknz.ondigitalocean.app/" + new_sponsor_prop.file.path} style={{ alignSelf: "center", position: "absolute", left: "0px", top: new_sponsor_prop.file.size.top + "px", width: new_sponsor_prop.file.size.width + "px", height: new_sponsor_prop.file.size.height + "px", zIndex:"500"} } /> ) : null }
              </div>
          ))}
          </div>
          {new_staticArts.map((property) => (
            <div key="2">
              {property.file.type == "image" ? ( <img src = {"https://g2layer-4sknz.ondigitalocean.app/" + property.file.path} style={{position: "absolute", left: property.css.left + "px", top: property.css.top + "px", zIndex: property.css.zindex}}/> ) : null }
              {property.file.type == "video" ? ( <video src = {"https://g2layer-4sknz.ondigitalocean.app/" + property.file.path} style={{position: "absolute", left: property.css.left + "px", top: property.css.top + "px", zIndex: property.css.zindex }} autoPlay muted loop/> ) : null}
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
    var group_array = [];
  
    for (const streamer of streamers) {
      if (streamer.twitch_id == params.streamerid) {
        for (const group of groups) {
          if (streamer.group == group.name) {
            group_array.push(group);
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

    console.log("test")
    for (const staticOverlay of staticOverlays) {
      for (const staticOverlay_on_streamer of staticOverlay.on.streamer) {
        if (staticOverlay_on_streamer == params.streamerid) {
            if (staticOverlay.OverlayName == params.overlayid) {
              for (const staticArt of staticArts) {
                for (const staticOverlay_art of staticOverlay.on.art) {
                  console.log(staticArt.ArtName + " " + staticOverlay_art)
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


    const overlayId = params.overlayid;
    const streamerId = params.streamerid;

    const overlay_props = JSON.parse(JSON.stringify(overlay_array));
    const sponsor_props = JSON.parse(JSON.stringify(sponsor_array));
    const arts_props = JSON.parse(JSON.stringify(file));
    const group_props = JSON.parse(JSON.stringify(group_array));

    return {
        props: {arts_props: arts_props, group_props: group_props, sponsor_props: sponsor_props, overlay_props: overlay_props, overlayId: overlayId, streamerId: streamerId },
        revalidate: 1
    };

}


