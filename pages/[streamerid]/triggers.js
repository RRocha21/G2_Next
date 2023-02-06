import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:3002');

export default function Home({}) {


  const [properties, setProperties] = useState(undefined);
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.on('trigger', (data) => {

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

    // console.log(params

    return {
        props: { },
        revalidate: 1
    };
}

function getOcorrence(array, value) {
    return array.filter((v) => (v === value)).length;
}