import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:3002');

export default function Home({initial_properties, initial_display_final, initial_campaigns_to_show, initial_campaigns_saved}) {

    const [count, setCount] = useState(0);
    const [opacity, setOpacity] = useState(0);
    const [active, setActive] = useState(false);
    const [properties, setProperties] = useState(initial_properties);
    const [display_final, setDisplay] = useState(initial_display_final);
    const [campaigns_to_show, setCampaignsShow] = useState(initial_campaigns_to_show);
    const [campaigns_saved, setCampaignsSaved] = useState(initial_campaigns_saved);
    const [firstLoad , setfirstLoad] = useState(false);



    socket.connect();
    useEffect(() => {
      setTimeout(() => {
        if (firstLoad == false) {
          console.log("passou");
          setProperties(initial_properties);
          setDisplay(initial_display_final);
          setCampaignsShow(initial_campaigns_to_show);
          setCampaignsSaved(initial_campaigns_saved);
          setfirstLoad(true);
        }
      }, 2500);
    }, [initial_properties, initial_display_final, initial_campaigns_to_show, initial_campaigns_saved, firstLoad]);

    console.log(display_final);
    console.log(campaigns_to_show);

    useEffect(() => {
      socket.on('Campaigns_changeCampaign', (data) => {

        var currentDate = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[1]);
        let data1 = data;

        let new_properties = [];
        let new_display_final = [];
        let new_campaigns_to_show = [];
        let new_campaigns_saved = [];
        

        if (properties !== undefined) {
          for (var i = 0; i < data1.length; i++) {
            new_properties.push(data1[i]);
            for (var k = 0; k < data1[i].properties.frequency; k++) {
              new_campaigns_saved.push(i);
            }
          }
          if (new_properties.length > properties.length) {
            let k = new_properties.length - 1;
            for (var i = 0; k < data1[k].properties.frequency; i++) {
              new_campaigns_to_show.push(k);
            }
            let timetoend = 60 - currentDate;
            let possible_time = [];
            for (var i = 0; i < timetoend; i++) {
              possible_time.push(currentDate + i);
            }
            for (var i = 0; i < new_campaigns_to_show.length; i++) {
              var random_time = possible_time[Math.floor(Math.random() * possible_time.length)];
              possible_time.splice(possible_time.indexOf(random_time), 1);
              new_display_times.push(random_time);
            }
            console.log(new_display_times);
          } 
          console.log(new_campaigns_to_show);
          setProperties(new_properties);
          setCampaignsSaved(new_campaigns_saved);
        }
      });


    }, [properties, display_final, campaigns_to_show, campaigns_saved]);

    useEffect(() => {
      const interval = setInterval(() => {
        var currentSecond = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[2]);
        var currentDate = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[1]);
        if (currentSecond > 30) {
          setOpacity(0);
          setActive(active => false);
        }
        if (display_final != undefined) {
          if (display_final.includes(currentDate)) {
            if (campaigns_to_show != undefined) {
              if (currentSecond < 30) {
                if (!active) {
                  var index = campaigns_to_show[Math.floor(Math.random() * campaigns_to_show.length)];
                  setCount(count => index);
                  campaigns_to_show.splice(campaigns_to_show.indexOf(index), 1);
                  setOpacity(1);
                  setActive(active => true);
                }
              }
            }
          } else {
            setOpacity(0);
            setActive(active => false);
          }
        }
        if (currentDate == 59 && currentSecond >= 50) {
          setCampaigns_to_show(campaigns_saved.slice(0));
        }
      }, 10000);
      return () => clearInterval(interval); 
    }, [display_final, campaigns_to_show, active, count, campaigns_saved, opacity]);

  if (properties != undefined) {
    if (properties[count] == undefined) {
      setCount(0);
    } else if (opacity == 1) {
      var left = properties[count].css.left;
      var top = properties[count].css.top;
      var filetype = properties[count].file.type;
      if (properties[count].file.path == "none") {
        var filepath = "";
        setOpacity(0);
      } else {
        var filepath = properties[count].file.path;
      }

    } else {
      var left = 0;
      var top = 0;
      var filepath = "";
    }
    return (
      <div>
        <Head>
          <title>Home</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div>
          <div>
            {filetype == "image" ? ( <img src= {"https://g2layer-4sknz.ondigitalocean.app/" + filepath} style={{position: "absolute", left: left + "px", top: top + "px", opacity: opacity}}/> ) : null}
            {filetype == "video" ? ( <video src= {"https://g2layer-4sknz.ondigitalocean.app/" + filepath} style={{position: "absolute", left: left + "px", top: top + "px", opacity: opacity}} autoPlay muted/> ) : null}
          </div>
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
    const Campaigns = await db.collection('campaigns').find({}).toArray();
  
    var file = [];
    for (const Campaign of Campaigns) {
      for (const Campaign_on_streamer of Campaign.on.streamer) {
        if (Campaign_on_streamer == params.streamerid) {
          file.push(Campaign);
        }
      }
    }

    

    // console.log(file);

    const properties = JSON.parse(JSON.stringify(file));
    const campaigns_to_show = [];
    var total_displays = 0;
    var k = 0;
    if (properties != undefined) {
      for (const property of properties) {
        total_displays += property.properties.frequency;
        for (var i = 0; i < property.properties.frequency; i++) {
          campaigns_to_show.push(k);
        }
        k++;
      }
    }

    const display_times = [];
  
    const possible_time = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59];
  
    for (var i = 0; i < total_displays; i++) {
      var random_time = possible_time[Math.floor(Math.random() * possible_time.length)];
      possible_time.splice(possible_time.indexOf(random_time), 1);
      display_times.push(random_time);
    }
    
    var display_times_sorted = display_times.sort(function(a, b){return a-b});

    const display_final = JSON.parse(JSON.stringify(display_times_sorted));

    const campaigns_saved = JSON.parse(JSON.stringify(campaigns_to_show));    

    return {
        props: {initial_properties: properties, initial_display_final: display_final, initial_campaigns_to_show: campaigns_to_show, initial_campaigns_saved: campaigns_saved },
        revalidate: 1
    };
}