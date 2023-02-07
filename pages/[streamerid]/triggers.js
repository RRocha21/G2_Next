import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:3002');

export default function Home({}) {


  const [endtimer, setEndtimer] = useState(30);
  const [opacity, setOpacity] = useState(0);
  const [active, setActive] = useState(false);
  const [properties, setProperties] = useState(undefined);
  const [flag, setFlag] = useState(false);

  socket.connect();

  useEffect(() => {
    socket.on('Triggers_changeTrigger', (data) => {
      var currentSecond = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[2]);
      if (data.css.duration + currentSecond >= 60) {
        setEndtimer(endtimer => data.css.duration + currentSecond - 60);
        setFlag(flag => true);
      } else {
        setEndtimer(endtimer => data.css.duration + currentSecond);
      }
      setProperties(properties => data);
      setOpacity(opacity => 1);
      setActive(active => true);
    });
  }, [properties, opacity, active, endtimer]);

  useEffect(() => {
    const interval = setInterval(() => {
      var currentSecond = parseInt(Date(Date.now()).toString().split(" ")[4].split(":")[2]);

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
    }, 5000);
    return () => clearInterval(interval); 
  }, [properties, opacity, active, endtimer, flag]);

  if (properties != undefined) {
    if (properties == undefined) {
      setCount(0);
    } else if (opacity == 1) {
      var left = properties.css.left;
      var top = properties.css.top;
      var filetype = properties.file.type;
      if (properties.file.path == "none") {
        var filepath = "";
        setOpacity(0);
      } else {
        var filepath = properties.file.path;
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

    return {
        props: { },
        revalidate: 1
    };
}

function getOcorrence(array, value) {
    return array.filter((v) => (v === value)).length;
}