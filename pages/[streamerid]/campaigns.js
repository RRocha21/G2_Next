import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:3002');

export default function Home({initial_properties, initial_display_final, initial_campaigns_to_show, initial_campaigns_saved, streamerid}) {

    const [count, setCount] = useState(0);
    const [endtimer, setEndtimer] = useState(30);
    const [opacity, setOpacity] = useState(0);
    const [active, setActive] = useState(false);
    const [properties, setProperties] = useState(initial_properties);
    const [display_final, setDisplay] = useState(initial_display_final);
    const [display_provi, setDisplayProvi] = useState(initial_display_final);
    const [campaigns_to_show, setCampaignsShow] = useState(initial_campaigns_to_show);
    const [campaigns_saved, setCampaignsSaved] = useState(initial_campaigns_saved);
    const [firstLoad , setfirstLoad] = useState(false);
    const [flag, setFlag] = useState(false);


    socket.connect();
    useEffect(() => {
      setTimeout(() => {
        if (firstLoad == false) {
          setProperties(initial_properties);
          setDisplay(initial_display_final);
          setCampaignsShow(initial_campaigns_to_show);
          setCampaignsSaved(initial_campaigns_saved);
          setDisplayProvi(initial_display_final);
          setfirstLoad(true);
        }
      }, 2500);
    }, [initial_properties, initial_display_final, initial_campaigns_to_show, initial_campaigns_saved, firstLoad]);

    useEffect(() => {
      socket.on('Triggers_changeTrigger', (data) => {
        var currentSecond = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[2]);
        if (data.css.duration + currentSecond >= 60) {
          setEndtimer(endtimer => data.css.duration + currentSecond - 60)
        } else {
          setEndtimer(endtimer => data.css.duration + currentSecond);
        }
        setOpacity(opacity => 0);
        setActive(active => true);
      });

      socket.on('Campaigns_changeCampaign', (data) => {
        var currentDate = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[1]);

        var month = Date(Date.now()).toString().split(" ")[1];
        var day = Date(Date.now()).toString().split(" ")[2];
        var year = Date(Date.now()).toString().split(" ")[3];
      
        if (month == "Jan") month = 1;
        if (month == "Feb") month = 2;
        if (month == "Mar") month = 3;
        if (month == "Apr") month = 4;
        if (month == "May") month = 5;
        if (month == "Jun") month = 6;
        if (month == "Jul") month = 7;
        if (month == "Aug") month = 8;
        if (month == "Sep") month = 9;
        if (month == "Oct") month = 10;
        if (month == "Nov") month = 11;
        if (month == "Dec") month = 12;
        month = parseInt(month);
        day = parseInt(day);
        year = parseInt(year);


        let data1 = data;

        let new_properties = [];
        let new_display_final = [];
        let new_campaigns_to_show = [];
        let new_campaigns_saved = [];
        let new_display_times = [];
        
        if (properties !== undefined) {

          for (var i = 0; i < data1.length; i++) {
            if (data1[i].status) {
              let startdate = data1[i].properties.timeframe.start_date.toString();
              let enddate = data1[i].properties.timeframe.end_date.toString();

              startdate = startdate.split("T")[0];
              enddate = enddate.split("T")[0];

              let startdate_month = parseInt(startdate.split("-")[1]);
              let startdate_day = parseInt(startdate.split("-")[2]);
              let startdate_year = parseInt(startdate.split("-")[0]);

              let enddate_month = parseInt(enddate.split("-")[1]);
              let enddate_day = parseInt(enddate.split("-")[2]);
              let enddate_year = parseInt(enddate.split("-")[0]);

              if (startdate_year !== 2001 && enddate_year !== 2001) {
                if (startdate_year <= year && enddate_year >= year) {
                  if (startdate_month <= month && enddate_month >= month) {
                    if (startdate_day <= day && enddate_day >= day) {
                      for (const campaign_on_streamer of data1[i].on.streamer) {
                        if (campaign_on_streamer == streamerid) {
                          new_properties.push(data1[i]);
                        }
                      }
                    }
                  }
                }
              } else {
                for (const campaign_on_streamer of data1[i].on.streamer) {
                  if (campaign_on_streamer == streamerid) {
                    new_properties.push(data1[i]);
                  }
                }
              }
            }
          }

          for (var i = 0; i < new_properties.length; i++) {
            for (var j = 0; j < new_properties[i].properties.frequency; j++) {
              new_campaigns_saved.push(i);
            }
          }

          let all_times = [];

          for (var i = 0; i < 60; i++) {
            all_times.push(i);
          }

          for (var i = 0; i < new_campaigns_saved.length; i++) {
            let random_time = all_times[Math.floor(Math.random() * all_times.length)];
            all_times.splice(all_times.indexOf(random_time), 1);
            new_display_final.push(random_time);
          }

          new_display_final = new_display_final.sort(function(a, b){return a-b});

          if (new_properties.length > properties.length) {
            
            let k = 0;

            for (var i = 0; i < properties.length; i++) {
              if (new_properties[i].campaignName !== properties[i].campaignName) {
                k = i;
                break;
              } else {
                k = new_properties.length - 1;
              }
            }
            
            let timetoend = 60 - currentDate;
            let possible_time = [];

            let new_frequency = Math.round(new_properties[k].properties.frequency * timetoend/ 60);

            let index = [];


            for (var i = 0; i < new_properties.length; i++) {    
              if (i !== k) {
                index[i] = getOcorrence(campaigns_saved, i) - getOcorrence(campaigns_to_show, i);
              } else {
                index[i] = new_properties[k].properties.frequency - new_frequency;
              }
            }

            new_campaigns_to_show = new_campaigns_saved.slice(0);

            for (var j = 0; j < index.length; j++) {
              for (var i = new_campaigns_to_show.length; i >= 0; i--) {
                if (index[j] > 0) {
                  if (new_campaigns_to_show[i] == j) {
                    new_campaigns_to_show.splice(i, 1);
                    index[j] = index[j] - 1;
                  }
                }
              }
            }

            for (var i = 0; i < timetoend; i++) {
              possible_time.push(currentDate + i);
            }

            for (var i = 0; i < possible_time.length; i++) {
              if (display_final.includes(possible_time[i])) {
                possible_time.splice(possible_time.indexOf(possible_time[i]), 1);
              }
            }
            
            for (var i = 0; i < new_campaigns_to_show.length; i++) {
              let random_time = possible_time[Math.floor(Math.random() * possible_time.length)];
              possible_time.splice(possible_time.indexOf(random_time), 1);
              new_display_times.push(random_time);
            }
            new_display_times = new_display_times.sort(function(a, b){return a-b});

          } else if (new_properties.length < properties.length) {

            let index = 0;

            if (new_properties.length == 1) {
              index = 1;
            }

            for (var i = 0; i < new_properties.length; i++) {
              if (new_properties[i].campaignName !== properties[i].campaignName) {
                index = i;
                break;
              }
            }

            new_campaigns_to_show = campaigns_to_show.slice(0);
            let index_array = [];
            for (var i = new_campaigns_to_show.length; i >= 0; i--) {
              if (new_campaigns_to_show[i] == index) {
                new_campaigns_to_show.splice(i, 1);
              }
            }

            for (var i = 0; i < new_campaigns_to_show.length; i++) {
              if (new_campaigns_to_show[i] > index) {
                new_campaigns_to_show[i] = new_campaigns_to_show[i] - 1;
              }
            }

            let timetoend = 60 - currentDate;
            let possible_time = [];

            for (var i = 0; i < timetoend; i++) {
              possible_time.push(currentDate + i);
            }
            
            for (var i = 0; i < new_campaigns_to_show.length; i++) {
              let random_time = possible_time[Math.floor(Math.random() * possible_time.length)];
              possible_time.splice(possible_time.indexOf(random_time), 1);
              new_display_times.push(random_time);
            }
            new_display_times = new_display_times.sort(function(a, b){return a-b});
          } else if (new_properties.length == properties.length) {

            let index = [];

            for (var i = 0; i < new_properties.length; i++) {              
              index[i] = getOcorrence(campaigns_saved, i) - getOcorrence(campaigns_to_show, i);
            }

            new_campaigns_to_show = new_campaigns_saved.slice(0);
            for (var j = 0; j < index.length; j++) {
              for (var i = new_campaigns_to_show.length; i >= 0; i--) {
                if (index[j] > 0) {
                  if (new_campaigns_to_show[i] == j) {
                    new_campaigns_to_show.splice(i, 1);
                    index[j] = index[j] - 1;
                  }
                }
              }
            }

            let timetoend = 60 - currentDate;
            let possible_time = [];

            for (var i = 0; i < timetoend; i++) {
              possible_time.push(currentDate + i);
            }

            for (var i = 0; i < new_campaigns_to_show.length; i++) {
              let random_time = possible_time[Math.floor(Math.random() * possible_time.length)];
              possible_time.splice(possible_time.indexOf(random_time), 1);
              new_display_times.push(random_time);
            }
            new_display_times = new_display_times.sort(function(a, b){return a-b});
          }


          // console.log("["+ new_campaigns_to_show.length + "] new_campaigns_to_show: " + new_campaigns_to_show);
          // console.log("["+ new_display_times.length + "] new_display_times: " + new_display_times);
          // console.log("["+ new_display_final.length + "] new_display_final: " + new_display_final);
          // console.log("["+ new_campaigns_saved.length + "] new_campaigns_saved: " + new_campaigns_saved);

          // console.log("..................................................................")

          setProperties(new_properties);
          setCampaignsSaved(new_campaigns_saved);
          setDisplay(new_display_times);
          setDisplayProvi(new_display_final);
          setCampaignsShow(new_campaigns_to_show);
        }
      });


    }, [properties, display_final, campaigns_to_show, campaigns_saved]);

    useEffect(() => {
      const interval = setInterval(() => {
        var currentSecond = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[2]);
        var currentDate = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[1]);

        if (!flag) {
          if (currentSecond >= endtimer) {
            setOpacity(0);
            setActive(active => false);
          }
        } else {
          if (currentSecond < 40) {
            if (currentSecond >= endtimer) {
              setOpacity(0);
              setActive(active => false);
              setFlag(flag => false);
            }
          }
        }
        if (display_final != undefined) {
          if (display_final.includes(currentDate)) {
            if (campaigns_to_show != undefined) {
              if (currentSecond < endtimer) {
                if (!active) {
                  // while(true){ 
                  var index = campaigns_to_show[Math.floor(Math.random() * campaigns_to_show.length)];
                  //   if (index != count) break;
                  // }
                  setCount(count => index);
                  if (properties[index].css.duration !== undefined) {
                    setEndtimer(endtimer => currentSecond + properties[index].css.duration);
                  } else {
                    setEndtimer(endtimer => 30);
                  }
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
        if (currentDate == 59 && currentSecond >= 53) {
          setCampaignsShow(campaigns_saved.slice(0));
          setDisplay(display_provi.slice(0));
        }
      }, 5000);
      return () => clearInterval(interval); 
    }, [display_final, campaigns_to_show, active, count, campaigns_saved, opacity,properties, flag]);

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
            {filetype == "image" ? ( <img src= {"https://g2-layer.fra1.cdn.digitaloceanspaces.com/" + filepath} style={{position: "absolute", left: left + "px", top: top + "px", opacity: opacity}}/> ) : null}
            {filetype == "video" ? ( <video src= {"https://g2-layer.fra1.cdn.digitaloceanspaces.com/" + filepath} style={{position: "absolute", left: left + "px", top: top + "px", opacity: opacity}} autoPlay muted/> ) : null}
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

    const data = await db.collection("streamers").find({twitch_id: params.streamerid}).toArray();

    const streamers = await db.collection('streamers').find({}).toArray();
    const staticOverlays = await db.collection('staticoverlays').find({}).toArray();
    const staticArts = await db.collection('staticarts').find({}).toArray();
    const Campaigns = await db.collection('campaigns').find({}).toArray();


    var month = Date(Date.now()).toString().split(" ")[1];
    var day = Date(Date.now()).toString().split(" ")[2];
    var year = Date(Date.now()).toString().split(" ")[3];
  
    if (month == "Jan") month = 1;
    if (month == "Feb") month = 2;
    if (month == "Mar") month = 3;
    if (month == "Apr") month = 4;
    if (month == "May") month = 5;
    if (month == "Jun") month = 6;
    if (month == "Jul") month = 7;
    if (month == "Aug") month = 8;
    if (month == "Sep") month = 9;
    if (month == "Oct") month = 10;
    if (month == "Nov") month = 11;
    if (month == "Dec") month = 12;
    month = parseInt(month);
    day = parseInt(day);
    year = parseInt(year);


    var file = [];
    for (const Campaign of Campaigns) {
      if (Campaign.status) {

        let startdate = Campaign.properties.timeframe.start_date.toString();
        let enddate = Campaign.properties.timeframe.end_date.toString();

        let startdate_month = startdate.split(" ")[1];
        if (startdate_month == "Jan") startdate_month = 1;
        if (startdate_month == "Feb") startdate_month = 2;
        if (startdate_month == "Mar") startdate_month = 3;
        if (startdate_month == "Apr") startdate_month = 4;
        if (startdate_month == "May") startdate_month = 5;
        if (startdate_month == "Jun") startdate_month = 6;
        if (startdate_month == "Jul") startdate_month = 7;
        if (startdate_month == "Aug") startdate_month = 8;
        if (startdate_month == "Sep") startdate_month = 9;
        if (startdate_month == "Oct") startdate_month = 10;
        if (startdate_month == "Nov") startdate_month = 11;
        if (startdate_month == "Dec") startdate_month = 12;
        startdate_month = parseInt(startdate_month);
        let startdate_day = parseInt(startdate.split(" ")[2]);
        let startdate_year = parseInt(startdate.split(" ")[3]);

        let enddate_month = enddate.split(" ")[1];
        if (enddate_month == "Jan") enddate_month = 1;
        if (enddate_month == "Feb") enddate_month = 2;
        if (enddate_month == "Mar") enddate_month = 3;
        if (enddate_month == "Apr") enddate_month = 4;
        if (enddate_month == "May") enddate_month = 5;
        if (enddate_month == "Jun") enddate_month = 6;
        if (enddate_month == "Jul") enddate_month = 7;
        if (enddate_month == "Aug") enddate_month = 8;
        if (enddate_month == "Sep") enddate_month = 9;
        if (enddate_month == "Oct") enddate_month = 10;
        if (enddate_month == "Nov") enddate_month = 11;
        if (enddate_month == "Dec") enddate_month = 12;
        enddate_month = parseInt(enddate_month);
        let enddate_day = parseInt(enddate.split(" ")[2]);
        let enddate_year = parseInt(enddate.split(" ")[3]);


        if (startdate_year !== 2001 && enddate_year !== 2001) {
          if (startdate_year <= year && enddate_year >= year) {
            if (startdate_month <= month && enddate_month >= month) {
              if (startdate_day <= day && enddate_day >= day) {
                for (const Campaign_on_streamer of Campaign.on.streamer) {
                  if (Campaign_on_streamer == params.streamerid) {
                    file.push(Campaign);
                  }
                }
              }
            }
          }
        } else {
          for (const Campaign_on_streamer of Campaign.on.streamer) {
            if (Campaign_on_streamer == params.streamerid) {
              file.push(Campaign);
            }
          }
        }
      }
    }

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
        props: {initial_properties: properties, initial_display_final: display_final, initial_campaigns_to_show: campaigns_to_show, initial_campaigns_saved: campaigns_saved, streamerid: params.streamerid },
        revalidate: 1
    };
}

function getOcorrence(array, value) {
    return array.filter((v) => (v === value)).length;
}