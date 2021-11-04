import logo from './logo.svg';
import './App.css';
import { useState, useEffect, useCallback } from 'react'
import Paho from 'paho-mqtt'

var client = new Paho.Client("broker.emqx.io", Number(8083), "asdas")

const omronFIN = (d) => {
  const fins = require('omron-fins')
  const options = { timeout: 5000, protocal: "udp" }
  const ip = ''
  const port = 9600
  const client = fins.FinsClient(port, ip, options)

  client.on('error',(error,msg) => {
    console.log("Error: ",error,msg)
  })

  client.on('timeout',(host,msg) => {
    console.log("Timeout: ",host,msg)
  })

  client.on('open',(info) => {
    console.log("open: ",info)

  })

  client.connect()
  const dAddress = ('00000' + d).substr(-5)
  client.read(`D${dAddress}`, 1, (err, msg) => {
    console.log("msg: ", msg)
    console.log("err: ", err)
  })
}

function App() {
  const [data, setData] = useState({})
  const [connection, setConnection] = useState("Disconnect")
  const topics = ["mc1/status", 'mc2/status', 'dnth/energy/1', 'dnth/energy/2']

  client.onConnectionLost = function (responseObject) {
    console.log("Connection Lost: " + responseObject.errorMessage)
    setConnection("Connection is lost")
  }
  client.onMessageArrived = function (message) {
    console.log(data)
    console.log("Message Arrived: " + message.payloadString)
    setData({ ...data, [message.destinationName]: message.payloadString })
  }

  function onConnect() {
    // console.log("Connected")
    setConnection("Connected")
  }

  const connectMQTT = useCallback(() => {
    client = new Paho.Client("broker.emqx.io", Number(8083), "asdas")
    client.connect({
      onSuccess: onConnect
    })
  }, [])

  useEffect(() => {
    connectMQTT()
    // console.log("render")
  }, [connectMQTT])

  const publish = async (pubTopic) => {
    // const pubTopic = document.getElementById('topic_pub').value
    const elID = `msg-${pubTopic}`
    const message = new Paho.Message(document.getElementById(elID).value)
    message.destinationName = pubTopic
    message.qos = 0
    message.retained = false
    client.send(message)
    console.log("publish: " + pubTopic + ", msg: " + message)
  }

  const subscribe = (subTopic) => {
    // const subTopic = document.getElementById('topic_sub').value
    client.subscribe(subTopic)
    console.log("subscribe: " + subTopic)
  }

  const unsubscribe = (subTopic) => {
    client.unsubscribe(subTopic)
    console.log("unsubscribe: " + subTopic)
  }

  const getCurrentData = () => {
    console.log(data)
  }

  return (
    <div className="App">
      <header className="App-header">
        <script src="/paho-1.0.3/paho-mqtt-min.js"></script>
        <script src="/paho-1.0.3/paho-mqtt.js"></script>
        <script src="mqttws31.js">
        </script>
        <h2>Connection status: {connection}</h2>
        <button onClick={connectMQTT}>Connect</button>
        <button onClick={getCurrentData}>Current Data</button>
        <table>
          <thead>
            <tr>
              <th>topic</th>
              <th>subscribe</th>
              <th>unsubscribe</th>
              <th>publish</th>
              <th>msg</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic, ind) =>
              <tr key={ind}>
                <td>{topic}</td>
                <td>
                  <button onClick={() => subscribe(topic)}>Sub</button>
                </td>
                <td>
                  <button onClick={() => unsubscribe(topic)}>Unsub</button>
                </td>
                <td>
                  <input id={`msg-${topic}`} />
                  <button onClick={() => publish(topic)}>Pub</button>
                </td>
                <td>{data[topic] || 'empty'}</td>
              </tr>
            )}
          </tbody>
        </table>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
